import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-white border-top mt-auto py-4 text-center text-muted">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-md-3 mb-3">
            <strong>Tentang ReuseMart</strong><br />
            <Link to="/informasi" className="text-muted d-block">Informasi Umum</Link>
            <Link to="/informasi" state={{ activeTab: "carakerja" }} className="text-muted d-block">Cara Kerja</Link>
            <Link to="/informasi" state={{ activeTab: "tentangkami" }} className="text-muted d-block">Tentang Kami</Link>
            <Link to="/informasi" state={{ activeTab: "faq" }} className="text-muted d-block">FAQ</Link>
          </div>
          <div className="col-md-3 mb-3">
            <strong>Hubungi Kami</strong><br />
            <a href="mailto:info@reusmart.com" className="text-muted d-block">info@reusmart.com</a>
            <a href="https://wa.me/6281234567890" className="text-muted d-block" target="_blank" rel="noopener noreferrer">WhatsApp</a>
            <a href="https://instagram.com/reusemart" className="text-muted d-block" target="_blank" rel="noopener noreferrer">Instagram</a>
          </div>
          <div className="col-md-3 mb-3">
            <strong>Alamat</strong><br />
            <span>Jl. Green Eco Park No. 456 Yogyakarta</span>
          </div>
        </div>
        <hr />
        <small>© 2025 ReuseMart. All rights reserved.</small>
      </div>
    </footer>
  );
};

export default Footer;