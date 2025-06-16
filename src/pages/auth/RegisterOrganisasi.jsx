import React from "react";
import RegisterFormOrganisasi from "../../components/RegisterFormOrganisasi";
import { useNavigate } from "react-router-dom";
import { FaArrowLeft } from "react-icons/fa";

const RegisterOrganisasiPage = () => {
  const navigate = useNavigate();
  
  // Opsi background yang sama dengan LoginPage
  const backgroundStyle = {
    backgroundColor: '#f8f9fa',
    backgroundImage: 'radial-gradient(#4CAF50 0.5px, transparent 0.5px), radial-gradient(#4CAF50 0.5px, #f8f9fa 0.5px)',
    backgroundSize: '20px 20px',
    backgroundPosition: '0 0, 10px 10px',
    backgroundAttachment: 'fixed'
  };
  
  return (
    <div 
      className="vh-100 d-flex flex-column justify-content-center align-items-center position-relative"
      style={{
        ...backgroundStyle,
        minHeight: '100vh'
      }}
    >
      {/* Tombol Kembali */}
      <div className="position-absolute top-0 start-0 m-3">
        <button 
          onClick={() => navigate(-1)} 
          className="btn btn-success rounded-circle shadow-sm"
          style={{ width: '40px', height: '40px' }}
        >
          <FaArrowLeft />
        </button>
      </div>
      
      <div className="text-center mb-5" style={{ marginTop: '-60px' }}>
        <img 
          src="/assets/logoReuseMart.png" 
          alt="ReuseMart Logo" 
          className="img-fluid" 
          style={{ 
            maxHeight: '150px', 
            filter: 'drop-shadow(0px 4px 8px rgba(0,0,0,0.15))' 
          }}
        />
      </div>
      
      <div style={{ width: '100%', maxWidth: '800px' }}>
        <RegisterFormOrganisasi />
      </div>
    </div>
  );
};

export default RegisterOrganisasiPage;