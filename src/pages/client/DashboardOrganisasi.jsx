import React, { useEffect, useState } from 'react';
import {
  createRequestDonasi,
  getRequestDonasiByOrganisasi,
  updateRequestDonasiByOrganisasi,
  deleteRequestDonasiByOrganisasi,
  createRequestDonasiByOrganisasi,
} from '../../api/RequestDonasiApi';
import { getOrganisasi } from '../../api/OrganisasiApi';
import ListRequestDonasi from '../../components/ListRequestDonasi';
import BuatRequestDonasi from '../../components/BuatRequestDonasi';

const DashboardOrganisasi = () => {
  const [organisasi, setOrganisasi] = useState(null);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');

  const user = JSON.parse(localStorage.getItem('user'));
  const id_user = user?.id_user;

  // Ambil data organisasi user login
  const fetchOrganisasi = async () => {
    const allOrgs = await getOrganisasi();
    return allOrgs.find(o => o.id_user === id_user);
  };

  // Ambil request donasi milik organisasi user login
  const fetchRequests = async (id_organisasi) => {
    const res = await getRequestDonasiByOrganisasi(id_organisasi);
    // Jika pakai axios, data ada di res.data
    return res.data;
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const org = await fetchOrganisasi();
        setOrganisasi(org);

        if (!org) {
          setError('Organisasi tidak ditemukan');
          setLoading(false);
          return;
        }

        const filteredRequests = await fetchRequests(org.id_organisasi);
        setRequests(filteredRequests);
      } catch (err) {
        setError('Gagal memuat data');
      }
      setLoading(false);
    };

    fetchData();
  }, [id_user]);

  const handleCreate = async (data) => {
    try {
      await createRequestDonasiByOrganisasi(organisasi.id_organisasi, data);
      if (organisasi) {
        const filteredRequests = await fetchRequests(organisasi.id_organisasi);
        setRequests(filteredRequests);
      }
    } catch (err) {
      alert('Gagal membuat request donasi');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Yakin ingin menghapus request donasi ini?')) {
      try {
        await deleteRequestDonasiByOrganisasi(organisasi.id_organisasi, id);
        if (organisasi) {
          const filteredRequests = await fetchRequests(organisasi.id_organisasi);
          setRequests(filteredRequests);
        }
      } catch (err) {
        alert('Gagal menghapus request donasi');
      }
    }
  };

  const handleEdit = async (id, data) => {
    try {
      await updateRequestDonasiByOrganisasi(organisasi.id_organisasi, id, data);
      if (organisasi) {
        const filteredRequests = await fetchRequests(organisasi.id_organisasi);
        setRequests(filteredRequests);
      }
    } catch (err) {
      alert('Gagal mengedit request donasi');
    }
  };

  // Filter requests by search query
  const filteredRequests = requests.filter(r =>
    r.deskripsi.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{ maxWidth: 800, margin: '0 auto', padding: 24 }}>
      <h1>Dashboard Organisasi</h1>
      {organisasi && (
        <div>
          <h3>Profil Organisasi</h3>
          <p><b>Nama:</b> {organisasi.nama_organisasi}</p>
          <p><b>Alamat:</b> {organisasi.alamat}</p>
          <p><b>No. Telepon:</b> {organisasi.no_telepon}</p>
          <p><b>Deskripsi:</b> {organisasi.deskripsi}</p>
        </div>
      )}
      <BuatRequestDonasi onCreate={handleCreate} />
      <input
        type="text"
        placeholder="Cari deskripsi request donasi..."
        value={search}
        onChange={e => setSearch(e.target.value)}
        style={{ marginBottom: 16, width: '100%', padding: 8 }}
      />
      {loading ? (
        <p>Memuat data...</p>
      ) : error ? (
        <p style={{ color: 'red' }}>{error}</p>
      ) : (
        <ListRequestDonasi
          requests={filteredRequests}
          onDelete={handleDelete}
          onEdit={handleEdit}
        />
      )}
    </div>
  );
};

export default DashboardOrganisasi;
