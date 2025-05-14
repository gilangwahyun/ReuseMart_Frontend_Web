import React, { useEffect, useState } from "react";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import ProductCard from "../../components/ProductCard";
import { getAllActiveBarang, searchBarangByName, getBarangByKategori } from "../../api/BarangApi";

const Home = () => {
  const [barangList, setBarangList] = useState([]);
  const [filteredBarang, setFilteredBarang] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedKategori, setSelectedKategori] = useState(null);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState("");

  useEffect(() => {
    const fetchBarang = async () => {
      try {
        const respone = await getAllActiveBarang();
        setBarangList(respone.data);
        setFilteredBarang(respone.data);
      } catch (err) {
        setError("Gagal memuat data barang.");
      } finally {
        setLoading(false);
      }
    };

    fetchBarang();
  }, []);

  const handleKategoriSelect = async (kategori) => {
    setSelectedKategori(kategori);
    setLoading(true);
    setError(null);

    try {
      const response = await getBarangByKategori(kategori);
      setFilteredBarang(response.data);
    } catch (err) {
      setError("Gagal memuat barang berdasarkan kategori.");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (searchKeyword) => {
    setSearchLoading(true);
    setSearchError("");

    try {
      const response = await searchBarangByName(searchKeyword);
      console.log(response);

      const result = response.data;

      if (result.length === 0) {
        setSearchError("Barang tidak ditemukan.");
        setFilteredBarang([]);
      } else {
        setFilteredBarang(result);
      }
    } catch (err) {
      setSearchError("Terjadi kesalahan saat pencarian.");
      console.error(err);
    } finally {
      setSearchLoading(false);
    }
  };

  return (
    <div className="d-flex flex-column min-vh-100">
      <Navbar onSearch={handleSearch} />
      <main className="container my-5 flex-grow-1">
        {loading && (
          <div className="d-flex flex-column align-items-center my-5">
            <div className="spinner-border text-success mb-3" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            <p className="text-muted">Sedang memuat produk, mohon tunggu...</p>
          </div>
        )}
        {error && <p className="text-danger">{error}</p>}
        {selectedKategori && (
          <h5 className="mb-4">
            Menampilkan produk untuk kategori: <strong>{selectedKategori}</strong>
          </h5>
        )}
        {searchError && <p className="text-danger">{searchError}</p>}
        <div className="row g-4">
          {filteredBarang.length > 0 ? (
            filteredBarang.map((product) => (
              <div className="col-12 col-sm-6 col-md-4 col-lg-3" key={product.id}>
                <ProductCard product={product} />
              </div>
            ))
          ) : (
            !loading && <p>Tidak ada produk ditemukan.</p>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Home;