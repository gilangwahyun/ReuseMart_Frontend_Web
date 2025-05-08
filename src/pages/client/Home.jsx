import React, { useEffect, useState } from "react";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import ProductCard from "../../components/ProductCard";
import { getAllBarang } from "../../api/BarangApi";

const Home = () => {
  const [barangList, setBarangList] = useState([]);
  const [filteredBarang, setFilteredBarang] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedKategori, setSelectedKategori] = useState(null);

  useEffect(() => {
    const fetchBarang = async () => {
      try {
        const data = await getAllBarang();
        setBarangList(data);
        setFilteredBarang(data);
      } catch (err) {
        setError("Gagal memuat data barang.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchBarang();
  }, []);

  const handleKategoriSelect = (kategori) => {
    setSelectedKategori(kategori);
    if (!kategori) {
      setFilteredBarang(barangList);
    } else {
      setFilteredBarang(
        barangList.filter((item) => item.kategori?.nama_kategori === kategori)
      );
    }
  };

  return (
    <div className="d-flex flex-column min-vh-100">
      <Navbar onKategoriSelect={handleKategoriSelect} />
      <main className="container my-5 flex-grow-1">
        {loading && <p>Memuat barang...</p>}
        {error && <p className="text-danger">{error}</p>}
        {selectedKategori && (
          <h5 className="mb-4">
            Menampilkan produk untuk kategori: <strong>{selectedKategori}</strong>
          </h5>
        )}
        <div className="row g-4">
          {filteredBarang.length > 0 ? (
            filteredBarang.map((product) => (
              <div className="col-12 col-sm-6 col-md-4 col-lg-3" key={product.id}>
                <ProductCard product={product} />
              </div>
            ))
          ) : (
            !loading && <p>Tidak ada produk ditemukan untuk kategori ini.</p>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Home;