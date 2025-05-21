import { useEffect, useState } from "react";
import {
  getAllPenitip,
  getPenitipById,
  updatePenitip,
  deletePenitip,
  searchPenitipByName,
  registerPenitip
} from "../../api/PenitipApi";
import EditFormPenitip from "../../components/EditFormPenitip";
import RegisterFormPenitip from "../../components/RegisterFormPenitip";

export default function PenitipPage() {
  const [penitipList, setPenitipList] = useState([]);
  const [selected, setSelected] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [registerLoading, setRegisterLoading] = useState(false);
  const [registerMessage, setRegisterMessage] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [searchLoading, setSearchLoading] = useState(false);
  const [registerFormKey, setRegisterFormKey] = useState(Date.now());

  useEffect(() => {
    getAllPenitip().then(data => {
      setPenitipList(data);
    });
  }, []);

  const handleShowDetail = async (id) => {
    const data = await getPenitipById(id);
    setSelected(data);
    setEditMode(false);
    setMessage("");
  };

  const handleEdit = () => setEditMode(true);

  const handleUpdate = async (formData) => {
    setLoading(true);
    try {
      const res = await updatePenitip(selected.id_penitip, formData);
      setMessage("Berhasil diupdate!");
      setEditMode(false);
      getAllPenitip().then(setPenitipList);
      setSelected(res.data);
    } catch (err) {
      setMessage("Gagal update: " + (err.response?.data?.message || ""));
    }
    setLoading(false);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Yakin hapus penitip ini?")) return;
    setLoading(true);
    try {
      await deletePenitip(id);
      setMessage("Berhasil dihapus!");
      setSelected(null);
      getAllPenitip().then(setPenitipList);
    } catch (err) {
      setMessage("Gagal hapus: " + (err.response?.data?.message || ""));
    }
    setLoading(false);
  };

  const handleRegister = async (formData) => {
    setRegisterLoading(true);
    setRegisterMessage("");
    try {
      await registerPenitip(formData);
      setRegisterMessage("Registrasi berhasil!");
      getAllPenitip().then(setPenitipList);
      setRegisterFormKey(Date.now());
    } catch (err) {
      setRegisterMessage(
        err.response?.data?.message || "Registrasi gagal. Cek data Anda."
      );
    }
    setRegisterLoading(false);
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleSearchSubmit = async (e) => {
    e.preventDefault();
    setSearchLoading(true);
    try {
      if (searchTerm.trim() === "") {
        const data = await getAllPenitip();
        setPenitipList(data);
      } else {
        const data = await searchPenitipByName(searchTerm);
        setPenitipList(data);
      }
    } catch (err) {
      setPenitipList([]);
    }
    setSearchLoading(false);
  };

  return (
    <div style={{ display: "flex", gap: "2rem", alignItems: "flex-start" }}>
      {/* Kiri: Form Register */}
      <div style={{ flex: 1, minWidth: 320 }}>
        <div className="card" style={{ padding: 20, boxShadow: "0 2px 8px #eee", borderRadius: 8 }}>
          <h2>Registrasi Penitip</h2>
          <RegisterFormPenitip key={registerFormKey} onSubmit={handleRegister} loading={registerLoading} />
          {registerMessage && <p style={{ color: registerMessage.includes("berhasil") ? "green" : "red" }}>{registerMessage}</p>}
        </div>
      </div>

      {/* Kanan: List & Detail/Edit */}
      <div style={{ flex: 2 }}>
        <div className="card" style={{ padding: 20, boxShadow: "0 2px 8px #eee", borderRadius: 8, marginBottom: 20 }}>
          <h2>Data Penitip</h2>
          <form onSubmit={handleSearchSubmit} style={{ marginBottom: 16, display: "flex", gap: 8 }}>
            <input
              type="text"
              placeholder="Cari nama penitip..."
              value={searchTerm}
              onChange={handleSearchChange}
              style={{ flex: 1, padding: 8, borderRadius: 4, border: "1px solid #ccc" }}
            />
            <button type="submit" disabled={searchLoading} style={{ padding: "8px 16px" }}>
              {searchLoading ? "Mencari..." : "Cari"}
            </button>
            {searchTerm && (
              <button type="button" onClick={() => { setSearchTerm(""); getAllPenitip().then(setPenitipList); }} style={{ padding: "8px 16px", background: "#eee" }}>
                Reset
              </button>
            )}
          </form>
          <ul style={{ listStyle: "none", padding: 0 }}>
            {penitipList.map((p) => (
              <li key={p.id_penitip} style={{ marginBottom: 8, display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid #eee", paddingBottom: 6 }}>
                <span>
                  <strong>{p.nama_penitip}</strong> - {p.nik}
                </span>
                <span>
                  <button onClick={() => handleShowDetail(p.id_penitip)} style={{ marginRight: 8 }}>Detail</button>
                  <button onClick={() => handleDelete(p.id_penitip)} disabled={loading} style={{ color: "red" }}>Hapus</button>
                </span>
              </li>
            ))}
          </ul>
          {penitipList.length === 0 && (
            <p style={{ color: "gray", textAlign: "center" }}>Tidak ada data penitip.</p>
          )}
        </div>

        {/* Detail/Edit */}
        {selected && !editMode && (
          <div className="card" style={{ padding: 20, boxShadow: "0 2px 8px #eee", borderRadius: 8, marginBottom: 20 }}>
            <h3>Detail Penitip</h3>
            <p><strong>Nama:</strong> {selected.nama_penitip}</p>
            <p><strong>NIK:</strong> {selected.nik}</p>
            <p><strong>No Telepon:</strong> {selected.no_telepon}</p>
            <p><strong>Alamat:</strong> {selected.alamat}</p>
            <p><strong>Saldo:</strong> {selected.saldo}</p>
            <p><strong>Jumlah Poin:</strong> {selected.jumlah_poin}</p>
            <button onClick={handleEdit}>Edit</button>
            {message && <p style={{ color: message.includes("Berhasil") ? "green" : "red" }}>{message}</p>}
          </div>
        )}
        {editMode && (
          <div className="card" style={{ padding: 20, boxShadow: "0 2px 8px #eee", borderRadius: 8 }}>
            <h3>Edit Penitip</h3>
            <EditFormPenitip
              initialData={selected}
              onSubmit={handleUpdate}
              loading={loading}
            />
            {message && <p style={{ color: message.includes("Berhasil") ? "green" : "red" }}>{message}</p>}
          </div>
        )}
      </div>
    </div>
  );
}
