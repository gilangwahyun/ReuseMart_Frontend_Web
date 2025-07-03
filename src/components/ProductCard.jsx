import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { BASE_URL } from "../api/index";
import { getFotoBarangByIdBarang } from "../api/fotoBarangApi";
import { getByIdBarang } from "../api/PenitipanBarangApi"; // Import API untuk mendapatkan data penitipan berdasarkan id_barang
import { FaShieldAlt, FaUserAlt  } from "react-icons/fa"; // Import ikon garansi dan toko

const ProductCard = ({ product }) => {
  const [thumbnailFoto, setThumbnailFoto] = useState(null);
  const [remainingMonths, setRemainingMonths] = useState(null);
  const [namaPenitip, setNamaPenitip] = useState("");

  useEffect(() => {
    const fetchFotoBarang = async () => {
      try {
        const fotos = await getFotoBarangByIdBarang(product.id_barang);
        
        if (fotos && fotos.length > 0) {
          // Pilih foto dengan is_thumbnail === true
          const thumbnail = fotos.find(f => f.is_thumbnail);
          if (thumbnail) {
            setThumbnailFoto(thumbnail);
          } else {
            // Fallback ke foto pertama (id_foto_barang terkecil)
            const sortedFotos = fotos.sort((a, b) => a.id_foto_barang - b.id_foto_barang);
            setThumbnailFoto(sortedFotos[0]);
          }
        }
      } catch (error) {
        console.error("Error fetching foto barang:", error);
      }
    };

    fetchFotoBarang();
  }, [product.id_barang]);

  // Fetch data penitip berdasarkan id_barang menggunakan API PenitipanBarang
  useEffect(() => {
    const fetchPenitipData = async () => {
      try {
        // Gunakan id_barang untuk mendapatkan data penitipan dan penitip
        const data = await getByIdBarang(product.id_barang);
        
        // Jika ada data penitip, ambil nama penitipnya
        if (data && data.penitip && data.penitip.nama_penitip) {
          setNamaPenitip(data.penitip.nama_penitip);
        }
      } catch (error) {
        console.error("Error fetching penitip data:", error);
      }
    };

    fetchPenitipData();
  }, [product.id_barang]);

  useEffect(() => {
    // Menghitung sisa bulan garansi
    if (product.masa_garansi) {
      try {
        const guaranteeEndDate = new Date(product.masa_garansi);
        const today = new Date();
        
        // Hitung selisih bulan
        const months = (guaranteeEndDate.getFullYear() - today.getFullYear()) * 12 + 
                      (guaranteeEndDate.getMonth() - today.getMonth());
        
        // Hanya tampilkan jika masih ada sisa garansi
        if (months > 0) {
          setRemainingMonths(months);
        } else {
          setRemainingMonths(0);
        }
      } catch (error) {
        console.error("Error calculating guarantee months:", error);
        setRemainingMonths(null);
      }
    }
  }, [product.masa_garansi]);

  // Fungsi untuk mengecek apakah produk memiliki garansi yang masih berlaku
  const hasActiveGuarantee = product.masa_garansi !== null && remainingMonths > 0;
  
  // Fungsi untuk mengecek apakah produk pernah memiliki garansi
  const hasGuarantee = product.masa_garansi !== null;

  return (
    <div className="card h-100 shadow-sm position-relative">
      {/* Jika produk memiliki garansi aktif, tampilkan ikon garansi */}
      {hasActiveGuarantee && (
        <div 
          className="position-absolute bg-success text-white rounded-pill px-2 py-1 d-flex align-items-center"
          style={{ 
            top: "10px", 
            right: "10px", 
            fontSize: "0.7rem", 
            zIndex: 1,
            boxShadow: "0 2px 5px rgba(0,0,0,0.2)" 
          }}
        >
          <FaShieldAlt className="me-1" />
          <span>Garansi</span>
        </div>
      )}
      
      <Link to={`/product/${product.id_barang}`} className="text-decoration-none text-dark">
        <img
          src={thumbnailFoto ? `${BASE_URL}${thumbnailFoto.url_foto}` : "/assets/logoReuseMart.png"}
          className="card-img-top"
          alt={product.nama_barang}
          style={{ height: "200px", objectFit: "cover" }}
        />
        <div className="card-body">
          <h6 className="card-title">{product.nama_barang}</h6>
          <p className="card-text text-muted mb-1">Rp {product.harga.toLocaleString()}</p>
          
          {/* Tampilkan nama penitip selayaknya nama toko */}
          {namaPenitip && (
            <div className="d-flex align-items-center mt-2 mb-1">
              <FaUserAlt  className="me-1 text-secondary" size={12} />
              <span className="small text-secondary">{namaPenitip}</span>
            </div>
          )}
          
          {hasGuarantee && (
            <div className="d-flex align-items-center mt-2">
              <FaShieldAlt className={`me-1 ${hasActiveGuarantee ? 'text-success' : 'text-muted'}`} size={12} />
              <span className={`small ${hasActiveGuarantee ? 'text-success' : 'text-muted'}`}>
                {hasActiveGuarantee 
                  ? `${remainingMonths} bulan tersisa` 
                  : "Garansi berakhir"}
              </span>
            </div>
          )}
        </div>
      </Link>
    </div>
  );
};

export default ProductCard;