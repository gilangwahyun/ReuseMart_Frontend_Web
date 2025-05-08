import React from "react";
import { Link } from "react-router-dom";
import foto from "/assets/logoReuseMart.png";

const ProductCard = ({ product }) => {
  return (
    <div className="card h-100 shadow-sm">
      <Link to={`/product/${product.id_barang}`} className="text-decoration-none text-dark">
        <img
          src={foto}
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
