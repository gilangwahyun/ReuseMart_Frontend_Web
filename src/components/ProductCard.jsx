import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getFotoBarangByIdBarang } from "../api/fotoBarangApi"; // Pastikan import API dengan benar

const ProductCard = ({ product }) => {
  const [thumbnailFoto, setThumbnailFoto] = useState(null);

  useEffect(() => {
    const fetchFotoBarang = async () => {
      try {
        const fotos = await getFotoBarangByIdBarang(product.id_barang);
        
        if (fotos && fotos.length > 0) {
          // Pilih foto pertama dengan id_foto_barang terkecil
          console.log("Foto yang diterima:", fotos);
          const sortedFotos = fotos.sort((a, b) => a.id_foto_barang - b.id_foto_barang);
          setThumbnailFoto(sortedFotos[0]);
        }
      } catch (error) {
        console.error("Error fetching foto barang:", error);
      }
    };

    fetchFotoBarang();
  }, [product.id_barang]);

  return (
    <div className="card h-100 shadow-sm">
      <Link to={`/product/${product.id_barang}`} className="text-decoration-none text-dark">
        <img
          src={thumbnailFoto ? `http://127.0.0.1:8000/${thumbnailFoto.url_foto}` : "/assets/logoReuseMart.png"}
          className="card-img-top"
          alt={product.nama_barang}
          style={{ height: "200px", objectFit: "cover" }}
        />
        <div className="card-body">
          <h6 className="card-title">{product.nama_barang}</h6>
          <p className="card-text text-muted">Rp {product.harga.toLocaleString()}</p>
        </div>
      </Link>
    </div>
  );
};

export default ProductCard;