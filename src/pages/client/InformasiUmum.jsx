import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import Footer from "../../components/Footer";
import { FaRecycle, FaMoneyBill, FaCheck, FaBoxOpen, FaLeaf, FaShieldAlt, FaHandshake, FaSyncAlt, FaEnvelope, FaPhone, FaMapMarkerAlt, FaHome } from "react-icons/fa";
import { RiSpeedFill } from "react-icons/ri";
import { IoMdHelpCircleOutline, IoMdInformationCircleOutline, IoMdHome } from "react-icons/io";
import { MdQuestionAnswer } from "react-icons/md";
import logo from "/assets/logoReuseMart.png";

const InformasiUmum = () => {
  const location = useLocation();
  const [activeTab, setActiveTab] = useState("beranda");

  useEffect(() => {
    // Mengambil activeTab dari state jika ada
    if (location.state && location.state.activeTab) {
      setActiveTab(location.state.activeTab);
      window.scrollTo(0, 0);
    }
  }, [location]);

  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    window.scrollTo(0, 0);
  };

  return (
    <div className="d-flex flex-column min-vh-100">
      {/* Navbar Khusus untuk Informasi Umum */}
      <nav className="navbar navbar-expand-lg navbar-light bg-white shadow-sm sticky-top">
        <div className="container">
          {/* Logo yang mengarah ke Home */}
          <Link className="navbar-brand d-flex align-items-center" to="/">
            <img src={logo} alt="Logo ReuseMart" height="40" className="me-2" />
          </Link>
          
          <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#infoNavbar">
            <span className="navbar-toggler-icon"></span>
          </button>
          
          <div className="collapse navbar-collapse" id="infoNavbar">
            <ul className="navbar-nav mx-auto">
              <li className="nav-item mx-2">
                <button 
                  className={`nav-link btn ${activeTab === "beranda" ? "text-success fw-bold border-bottom border-success" : "text-dark"}`}
                  onClick={() => handleTabChange("beranda")}
                >
                  <IoMdHome className="me-1" /> Beranda
                </button>
              </li>
              <li className="nav-item mx-2">
                <button 
                  className={`nav-link btn ${activeTab === "carakerja" ? "text-success fw-bold border-bottom border-success" : "text-dark"}`}
                  onClick={() => handleTabChange("carakerja")}
                >
                  <IoMdHelpCircleOutline className="me-1" /> Cara Kerja
                </button>
              </li>
              <li className="nav-item mx-2">
                <button 
                  className={`nav-link btn ${activeTab === "tentangkami" ? "text-success fw-bold border-bottom border-success" : "text-dark"}`}
                  onClick={() => handleTabChange("tentangkami")}
                >
                  <IoMdInformationCircleOutline className="me-1" /> Tentang Kami
                </button>
              </li>
              <li className="nav-item mx-2">
                <button 
                  className={`nav-link btn ${activeTab === "faq" ? "text-success fw-bold border-bottom border-success" : "text-dark"}`}
                  onClick={() => handleTabChange("faq")}
                >
                  <MdQuestionAnswer className="me-1" /> FAQ
                </button>
              </li>
            </ul>
            
            <Link to="/" className="btn btn-outline-success">
              <FaHome className="me-1" /> Kembali ke Beranda
            </Link>
          </div>
        </div>
      </nav>

      <div className="container my-4">
        <div className="card shadow-sm">
          <div className="card-body p-4">
            {activeTab === "beranda" && <BerandaTab />}
            {activeTab === "carakerja" && <CaraKerjaTab />}
            {activeTab === "tentangkami" && <TentangKamiTab />}
            {activeTab === "faq" && <FaqTab />}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

const BerandaTab = () => {
  return (
    <div>
      {/* Banner Utama */}
      <div className="bg-success text-white p-4 rounded mb-4">
        <div className="text-center py-4">
          <FaRecycle size={48} className="mb-3" />
          <h2 className="fw-bold mb-3">Selamat Datang di ReuseMart</h2>
          <p className="lead">Platform Konsinyasi Barang Bekas</p>
        </div>
      </div>

      {/* Apa itu ReuseMart? */}
      <section className="mb-4">
        <h3 className="fw-bold mb-3">Apa itu ReuseMart?</h3>
        <p className="text-muted">
          ReuseMart adalah platform konsinyasi barang bekas yang mengelola penjualan barang bekas melalui sistem penitipan. 
          Anda cukup datang ke gudang kami, dan kami akan menangani seluruh proses penjualan hingga Anda mendapatkan hasil penjualan.
        </p>

        <div className="row g-3 mt-3">
          <div className="col-md-6">
            <div className="card h-100 bg-success bg-opacity-10 border-0">
              <div className="card-body text-center p-4">
                <FaMoneyBill className="text-success mb-3" size={32} />
                <h5 className="card-title">Untung Lebih</h5>
                <p className="card-text small">Dapatkan hasil optimal dari barang bekas Anda</p>
              </div>
            </div>
          </div>
          <div className="col-md-6">
            <div className="card h-100 bg-primary bg-opacity-10 border-0">
              <div className="card-body text-center p-4">
                <RiSpeedFill className="text-primary mb-3" size={32} />
                <h5 className="card-title">Proses Cepat</h5>
                <p className="card-text small">Penitipan langsung di gudang dan proses QC transparan</p>
              </div>
            </div>
          </div>
          <div className="col-md-6">
            <div className="card h-100 bg-warning bg-opacity-10 border-0">
              <div className="card-body text-center p-4">
                <FaLeaf className="text-warning mb-3" size={32} />
                <h5 className="card-title">Ramah Lingkungan</h5>
                <p className="card-text small">Barang yang tidak terjual dapat didonasikan dengan poin reward</p>
              </div>
            </div>
          </div>
          <div className="col-md-6">
            <div className="card h-100 bg-info bg-opacity-10 border-0">
              <div className="card-body text-center p-4">
                <FaShieldAlt className="text-info mb-3" size={32} />
                <h5 className="card-title">Fleksibel</h5>
                <p className="card-text small">Masa penitipan 30 hari dengan opsi perpanjangan</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <div className="bg-light p-4 rounded border mb-4 text-center">
        <h4>Siap untuk bergabung dengan ReuseMart?</h4>
        <p>Daftar sekarang dan mulai jual atau beli barang bekas dengan mudah</p>
        <Link to="/LoginPage" className="btn btn-success px-4">
          Masuk Sekarang
        </Link>
      </div>
    </div>
  );
};

const CaraKerjaTab = () => {
  return (
    <div>
      <h3 className="fw-bold mb-4">Bagaimana ReuseMart Bekerja?</h3>

      <h4 className="mt-4 mb-3">Alur Proses Penitipan Barang</h4>
      
      <div>
        {[
          {
            number: 1,
            title: "Datang ke Gudang ReuseMart",
            description: "Kunjungi gudang ReuseMart untuk membawa barang bekas Anda yang ingin dititipkan.",
            icon: <FaMapMarkerAlt className="text-success" />
          },
          {
            number: 2,
            title: "Quality Control",
            description: "Barang Anda akan diperiksa kualitasnya oleh petugas gudang ReuseMart.",
            icon: <FaCheck className="text-success" />
          },
          {
            number: 3,
            title: "Pembuatan Akun oleh CS",
            description: "Customer Service akan membuatkan akun penitip untuk Anda jika belum memilikinya.",
            icon: <FaShieldAlt className="text-success" />
          },
          {
            number: 4,
            title: "Proses Manajerial",
            description: "Tim manajerial akan menginput informasi barang dan menentukan detail penitipan.",
            icon: <FaBoxOpen className="text-success" />
          },
          {
            number: 5,
            title: "Masa Penitipan 30 Hari",
            description: "Barang Anda akan dititipkan selama 30 hari untuk dijual di platform ReuseMart.",
            icon: <FaRecycle className="text-success" />
          },
          {
            number: 6,
            title: "Opsi Perpanjangan",
            description: "Setelah 30 hari, Anda memiliki waktu 7 hari untuk memutuskan memperpanjang masa penitipan atau mengambil barang kembali. Perpanjangan hanya bisa dilakukan sekali.",
            icon: <FaSyncAlt className="text-success" />
          },
          {
            number: 7,
            title: "Pengalihan Hak Barang",
            description: "Jika tidak ada konfirmasi dalam 7 hari, barang masuk list kategori dan owner berhak mengalokasikan untuk donasi. Anda tetap mendapatkan poin reward donasi.",
            icon: <FaHandshake className="text-success" />
          },
        ].map((step, index) => (
          <div key={index} className="card mb-3 border-0 shadow-sm">
            <div className="card-body d-flex">
              <div className="me-3">
                <div className="bg-light rounded-circle d-flex align-items-center justify-content-center" style={{ width: 50, height: 50 }}>
                  <span className="fw-bold text-success">{step.number}</span>
                </div>
              </div>
              <div>
                <h5 className="card-title">{step.title}</h5>
                <p className="card-text text-muted">{step.description}</p>
              </div>
              <div className="ms-auto d-flex align-items-center">
                {step.icon}
              </div>
            </div>
          </div>
        ))}
      </div>

      <h4 className="mt-4 mb-3">Untuk Pembeli</h4>
      
      <div>
        {[
          {
            number: 1,
            title: "Browse Produk",
            description: "Jelajahi berbagai produk bekas berkualitas di aplikasi ReuseMart.",
            icon: <FaBoxOpen className="text-success" />
          },
          {
            number: 2,
            title: "Pilih & Beli",
            description: "Pilih produk yang Anda inginkan dan lakukan pembelian dengan mudah.",
            icon: <FaShieldAlt className="text-success" />
          },
          {
            number: 3,
            title: "Proses Pembayaran",
            description: "Lakukan pembayaran melalui berbagai metode yang tersedia.",
            icon: <FaMoneyBill className="text-success" />
          },
          {
            number: 4,
            title: "Terima Barang",
            description: "Barang akan dikirimkan ke alamat Anda oleh tim ReuseMart.",
            icon: <FaHandshake className="text-success" />
          },
        ].map((step, index) => (
          <div key={index} className="card mb-3 border-0 shadow-sm">
            <div className="card-body d-flex">
              <div className="me-3">
                <div className="bg-light rounded-circle d-flex align-items-center justify-content-center" style={{ width: 50, height: 50 }}>
                  <span className="fw-bold text-success">{step.number}</span>
                </div>
              </div>
              <div>
                <h5 className="card-title">{step.title}</h5>
                <p className="card-text text-muted">{step.description}</p>
              </div>
              <div className="ms-auto d-flex align-items-center">
                {step.icon}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="card bg-light border-0 p-4 mt-4">
        <h5>Masa Penitipan Barang</h5>
        <div className="d-flex align-items-center mt-3">
          <div className="flex-grow-1">
            <div className="progress" style={{ height: '10px' }}>
              <div 
                className="progress-bar bg-success" 
                role="progressbar" 
                style={{ width: '75%' }} 
                aria-valuenow="75" 
                aria-valuemin="0" 
                aria-valuemax="100"
              ></div>
              <div 
                className="progress-bar bg-warning" 
                role="progressbar" 
                style={{ width: '25%' }} 
                aria-valuenow="25" 
                aria-valuemin="0" 
                aria-valuemax="100"
              ></div>
            </div>
          </div>
        </div>
        <div className="d-flex mt-2">
          <div style={{ width: '75%' }} className="text-center">
            <small className="text-success fw-bold">30 Hari Masa Penitipan</small>
          </div>
          <div style={{ width: '25%' }} className="text-center">
            <small className="text-warning fw-bold">7 Hari Masa Keputusan</small>
          </div>
        </div>
        <div className="mt-3 small text-muted">
          <p className="mb-1">• Perpanjangan masa penitipan hanya dapat dilakukan 1 kali untuk 30 hari berikutnya</p>
          <p className="mb-1">• Barang tanpa keputusan setelah 7 hari akan dialokasikan untuk donasi</p>
        </div>
      </div>

      <div className="text-center mt-4">
        <Link to="/LoginPage" className="btn btn-success px-4">
          Mulai Sekarang
        </Link>
      </div>
    </div>
  );
};

const TentangKamiTab = () => {
  return (
    <div>
      <h3 className="fw-bold mb-4">Tentang ReuseMart</h3>
      
      <div className="bg-light rounded mb-4" style={{ height: '200px' }}>
        <div className="h-100 d-flex align-items-center justify-content-center">
          <FaRecycle size={60} className="text-muted" />
        </div>
      </div>
      
      <h4 className="fw-bold mt-4 mb-3">Visi Kami</h4>
      <p className="text-muted mb-4">
        Menjadi platform konsinyasi terkemuka yang mendorong ekonomi sirkular dan mengurangi dampak lingkungan melalui jual-beli barang bekas yang berkualitas.
      </p>
      
      <h4 className="fw-bold mb-3">Misi Kami</h4>
      <ul className="list-unstyled">
        {[
          'Menyediakan platform yang aman dan terpercaya untuk jual-beli barang bekas.',
          'Membantu penitip mendapatkan nilai maksimal dari barang bekas mereka.',
          'Menawarkan produk berkualitas dengan harga terjangkau untuk pembeli.',
          'Berkontribusi pada upaya pengurangan sampah dan pemanfaatan kembali produk.'
        ].map((misi, index) => (
          <li key={index} className="d-flex align-items-start mb-3">
            <FaCheck className="text-success mt-1 me-2" />
            <span className="text-muted">{misi}</span>
          </li>
        ))}
      </ul>
      
      <h4 className="fw-bold mt-4 mb-3">Nilai-Nilai Kami</h4>
      <div className="row g-3">
        {[
          { icon: <FaShieldAlt size={32} />, title: 'Kepercayaan', colorClass: 'bg-primary bg-opacity-10', textClass: 'text-primary' },
          { icon: <FaLeaf size={32} />, title: 'Keberlanjutan', colorClass: 'bg-success bg-opacity-10', textClass: 'text-success' },
          { icon: <FaHandshake size={32} />, title: 'Kerjasama', colorClass: 'bg-info bg-opacity-10', textClass: 'text-info' },
          { icon: <FaRecycle size={32} />, title: 'Inovasi', colorClass: 'bg-warning bg-opacity-10', textClass: 'text-warning' }
        ].map((nilai, index) => (
          <div key={index} className="col-md-6 col-lg-3">
            <div className={`card text-center h-100 ${nilai.colorClass} border-0`}>
              <div className="card-body py-4">
                <div className={nilai.textClass}>{nilai.icon}</div>
                <h5 className="mt-3 mb-0">{nilai.title}</h5>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      <div className="card mt-4 bg-light border-0">
        <div className="card-body">
          <h4 className="fw-bold mb-3">Hubungi Kami</h4>
          <div className="d-flex align-items-center mb-3">
            <FaEnvelope className="text-success me-3" />
            <span>info@reusemart.com</span>
          </div>
          <div className="d-flex align-items-center mb-3">
            <FaPhone className="text-success me-3" />
            <span>+62 812 3456 7890</span>
          </div>
          <div className="d-flex align-items-center">
            <FaMapMarkerAlt className="text-success me-3" />
            <span>Jl. Green Eco Park No. 456 Yogyakarta</span>
          </div>
        </div>
      </div>
    </div>
  );
};

const FaqTab = () => {
  const [activeAccordion, setActiveAccordion] = useState(null);

  const toggleAccordion = (id) => {
    setActiveAccordion(activeAccordion === id ? null : id);
  };

  const faqItems = [
    {
      id: 1,
      question: "Apa itu ReuseMart?",
      answer: "ReuseMart adalah platform konsinyasi barang bekas yang menghubungkan penitip barang dengan calon pembeli. Kami membantu penitip menjual barang bekas mereka dengan mudah dan menguntungkan."
    },
    {
      id: 2,
      question: "Bagaimana cara menitipkan barang?",
      answer: "Untuk menitipkan barang, Anda perlu datang langsung ke gudang ReuseMart dengan membawa barang yang ingin dititipkan. Petugas gudang akan melakukan pemeriksaan kualitas, dan Customer Service kami akan membuatkan akun penitip untuk Anda. Selanjutnya, barang akan diproses oleh tim manajerial untuk diinputkan informasinya dan dijual melalui platform kami."
    },
    {
      id: 3,
      question: "Berapa lama masa penitipan barang?",
      answer: "Masa penitipan awal adalah 30 hari. Setelah itu, Anda memiliki waktu 7 hari untuk memutuskan apakah ingin memperpanjang masa penitipan selama 30 hari lagi atau mengambil barang kembali. Perpanjangan hanya dapat dilakukan satu kali. Jika tidak ada konfirmasi dalam 7 hari tersebut, barang akan masuk ke list kategori dan hak alokasi untuk donasi menjadi milik owner. Penitip tetap mendapatkan poin reward donasi."
    },
    {
      id: 4,
      question: "Berapa komisi yang diambil ReuseMart?",
      answer: "ReuseMart mengambil komisi sebesar 20% dari harga jual barang. Komisi ini digunakan untuk biaya operasional, penyimpanan, pemasaran, dan proses penjualan."
    },
    {
      id: 5,
      question: "Kapan saya akan menerima pembayaran?",
      answer: "Setelah barang terjual, pembayaran akan diproses dalam waktu 3-5 hari kerja dan ditransfer ke rekening bank yang telah Anda daftarkan."
    },
    {
      id: 6,
      question: "Apakah ada jaminan barang akan terjual?",
      answer: "Kami tidak dapat menjamin bahwa semua barang akan terjual, tetapi kami akan berusaha memasarkan barang Anda dengan optimal. Jika masa penitipan berakhir dan barang belum terjual, Anda dapat memperpanjang masa penitipan atau mengambil barang kembali."
    },
    {
      id: 7,
      question: "Bagaimana dengan kondisi dan kualitas barang?",
      answer: "Semua barang yang diterima akan melalui proses pemeriksaan kualitas oleh petugas gudang kami. Kami hanya menerima barang bekas dengan kondisi yang masih layak jual. Kondisi barang akan dicantumkan dengan jelas pada deskripsi produk."
    },
    {
      id: 8,
      question: "Apa yang terjadi jika saya tidak mengambil keputusan setelah masa penitipan berakhir?",
      answer: "Jika tidak ada konfirmasi dalam 7 hari setelah masa penitipan 30 hari berakhir, barang akan masuk ke daftar barang untuk donasi dan hak alokasi untuk donasi menjadi milik owner ReuseMart. Sebagai penitip, Anda tetap akan mendapatkan poin reward donasi yang dapat ditukarkan dengan berbagai hadiah menarik."
    },
    {
      id: 9,
      question: "Apakah ReuseMart melayani pengiriman ke seluruh Indonesia?",
      answer: "Ya, ReuseMart melayani pengiriman ke seluruh Indonesia melalui berbagai jasa ekspedisi terpercaya. Biaya pengiriman ditanggung oleh pembeli."
    }
  ];

  return (
    <div>
      <h3 className="fw-bold mb-4">Pertanyaan yang Sering Diajukan</h3>
      
      <div className="accordion" id="faqAccordion">
        {faqItems.map((item) => (
          <div className="accordion-item border mb-3 shadow-sm" key={item.id}>
            <h2 className="accordion-header">
              <button 
                className={`accordion-button ${activeAccordion === item.id ? '' : 'collapsed'}`}
                type="button" 
                onClick={() => toggleAccordion(item.id)}
                style={{ boxShadow: 'none', backgroundColor: activeAccordion === item.id ? 'rgba(40, 167, 69, 0.1)' : 'white', color: activeAccordion === item.id ? '#198754' : 'inherit' }}
              >
                <span className="fw-bold">{item.question}</span>
              </button>
            </h2>
            <div className={`accordion-collapse collapse ${activeAccordion === item.id ? 'show' : ''}`}>
              <div className="accordion-body text-muted">
                {item.answer}
              </div>
            </div>
          </div>
        ))}
      </div>
      
      <div className="card bg-light border-0 p-4 mt-4 text-center">
        <h5>Pertanyaan lainnya?</h5>
        <p className="mb-4">Silakan hubungi tim layanan pelanggan kami melalui:</p>
        <div className="d-flex justify-content-center gap-3">
          <button className="btn btn-outline-primary px-3">
            <FaEnvelope className="me-2" /> Email
          </button>
          <button className="btn btn-outline-success px-3">
            <FaPhone className="me-2" /> Telepon
          </button>
          <button className="btn btn-outline-info px-3">
            <MdQuestionAnswer className="me-2" /> Chat
          </button>
        </div>
      </div>
    </div>
  );
};

export default InformasiUmum; 