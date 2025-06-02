// import React, { useEffect, useState } from "react";
// import { FaShoppingCart, FaUser } from "react-icons/fa";
// import { Link, useNavigate } from "react-router-dom";
// import logo from "/assets/logoReuseMart.png";
// import { getAllKategori } from "../api/KategoriBarangApi";
// import { searchBarangByName } from "../api/BarangApi";

// const Navbar = ({ onKategoriSelect = () => {}, onSearch = () => {} }) => {
//   const [showPanel, setShowPanel] = useState(false);
//   const [kategoriList, setKategoriList] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [showProfileMenu, setShowProfileMenu] = useState(false);
//   const [searchKeyword, setSearchKeyword] = useState("");
//   const [isSearchClicked, setIsSearchClicked] = useState(false);
//   const [isLoggedIn, setIsLoggedIn] = useState(false);
//   const [userId, setUserId] = useState(null);
//   const navigate = useNavigate();

//   useEffect(() => {
//     const fetchKategori = async () => {
//       try {
//         const data = await getAllKategori();
//         setKategoriList(data);
//       } catch (error) {
//         console.error("Gagal memuat kategori:", error);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchKategori();
//   }, []);

//   useEffect(() => {
//     const handleClickOutside = (e) => {
//       const panel = document.getElementById("kategoriPanel");
//       const toggle = document.getElementById("kategoriToggle");
//       const profileMenu = document.getElementById("profileMenu");
//       const profileToggle = document.getElementById("profileToggle");

//       if (
//         panel && !panel.contains(e.target) && !toggle.contains(e.target)
//       ) {
//         setShowPanel(false);
//       }

//       if (
//         profileMenu && !profileMenu.contains(e.target) && !profileToggle.contains(e.target)
//       ) {
//         setShowProfileMenu(false);
//       }
//     };

//     document.addEventListener("click", handleClickOutside);
//     return () => document.removeEventListener("click", handleClickOutside);
//   }, []);

//   useEffect(() => {
//     // Check if user is logged in and get userId
//     const token = localStorage.getItem('token');
//     const userData = localStorage.getItem('user');
//     setIsLoggedIn(!!token);
    
//     if (userData) {
//       try {
//         const user = JSON.parse(userData);
//         setUserId(user.id_user);
//       } catch (error) {
//         console.error('Error parsing user data:', error);
//       }
//     }
//   }, []);

//   const togglePanel = () => {
//     setShowPanel((prev) => !prev);
//   };

//   const toggleProfileMenu = () => {
//     setShowProfileMenu((prev) => !prev);
//   };

//   const handleKategoriClick = (namaKategori) => {
//     setShowPanel(false);
//     onKategoriSelect(namaKategori);
//     navigate(`/kategori/${namaKategori}`);
//   };

//   const handleSearchClick = (e) => {
//     e.preventDefault();
//     if (searchKeyword.trim() === "") return;

//     onSearch(searchKeyword);
//   };

//   const handleSearchChange = (e) => {
//     setSearchKeyword(e.target.value);
//   };

//   const handleProfileClick = () => {
//     if (isLoggedIn) {
//       navigate('/DashboardProfilPembeli');
//     } else {
//       navigate('/LoginPage');
//     }
//     setShowProfileMenu(false);
//   };

//   const handleCartClick = (e) => {
//     e.preventDefault();
//     if (!isLoggedIn) {
//       navigate('/LoginPage');
//       return;
//     }
//     if (userId) {
//       navigate(`/keranjang/${userId}`);
//     }
//   };

//   return (
//     <nav
//       className="navbar navbar-expand-lg navbar-light shadow-sm sticky-top"
//       style={{ backgroundColor: "white", boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)" }}
//     >
//       <div className="container position-relative">
//         <Link className="navbar-brand d-flex align-items-center" to="/">
//           <img src={logo} alt="Logo" height="40" className="me-2" />
//         </Link>

//         <button
//           className="navbar-toggler"
//           type="button"
//           data-bs-toggle="collapse"
//           data-bs-target="#navbarNav"
//         >
//           <span className="navbar-toggler-icon"></span>
//         </button>

//         <div className="collapse navbar-collapse" id="navbarNav">
//           <ul className="navbar-nav ms-auto align-items-center w-100">
//             <li className="nav-item me-3">
//               <button
//                 className="btn nav-link text-dark"
//                 id="kategoriToggle"
//                 onClick={togglePanel}
//                 style={{
//                   background: "none",
//                   border: "none",
//                   fontSize: "16px",
//                   cursor: "pointer",
//                 }}
//               >
//                 Kategori
//               </button>
//             </li>

//             <form
//               className="d-flex me-auto w-50"
//               style={{ maxWidth: "400px" }}
//               onSubmit={handleSearchClick}
//             >
//               <input
//                 className="form-control me-2"
//                 type="search"
//                 placeholder="Cari produk..."
//                 aria-label="Search"
//                 value={searchKeyword}
//                 onChange={handleSearchChange}
//               />
//               <button className="btn btn-outline-dark" type="submit">
//                 Cari
//               </button>
//             </form>

//             <li className="nav-item me-3">
//               <button 
//                 className="btn nav-link text-dark" 
//                 onClick={handleCartClick}
//                 style={{
//                   background: "none",
//                   border: "none",
//                   padding: 0
//                 }}
//               >
//                 <FaShoppingCart size={18} />
//               </button>
//             </li>

//             <li className="nav-item position-relative">
//               <button
//                 id="profileToggle"
//                 className="btn nav-link text-dark"
//                 onClick={toggleProfileMenu}
//                 style={{
//                   background: "none",
//                   border: "none",
//                   fontSize: "16px",
//                   cursor: "pointer",
//                 }}
//               >
//                 <FaUser size={18} />
//               </button>

//               {showProfileMenu && (
//                 <div
//                   id="profileMenu"
//                   className="position-absolute end-0 mt-2 bg-white shadow rounded border"
//                   style={{ zIndex: 1000, minWidth: "150px" }}
//                 >
//                   {isLoggedIn ? (
//                     <>
//                       <Link
//                         to="/DashboardProfilPembeli"
//                         className="dropdown-item text-dark py-2 px-3 d-block text-decoration-none"
//                         onClick={() => setShowProfileMenu(false)}
//                       >
//                         Profile
//                       </Link>
//                       <button
//                         className="dropdown-item text-dark py-2 px-3 d-block text-decoration-none w-100 text-start border-0 bg-transparent"
//                         onClick={() => {
//                           localStorage.removeItem('token');
//                           setIsLoggedIn(false);
//                           setShowProfileMenu(false);
//                           navigate('/');
//                         }}
//                       >
//                         Logout
//                       </button>
//                     </>
//                   ) : (
//                     <>
//                       <Link
//                         to="/LoginPage"
//                         className="dropdown-item text-dark py-2 px-3 d-block text-decoration-none"
//                         onClick={() => setShowProfileMenu(false)}
//                       >
//                         Login
//                       </Link>
//                       <Link
//                         to="/RegisterPembeli"
//                         className="dropdown-item text-dark py-2 px-3 d-block text-decoration-none"
//                         onClick={() => setShowProfileMenu(false)}
//                       >
//                         Register
//                       </Link>
//                     </>
//                   )}
//                 </div>
//               )}
//             </li>
//           </ul>
//         </div>

//         {/* Panel kategori */}
//         <div
//           id="kategoriPanel"
//           className="position-absolute top-100 start-0 w-100 bg-white shadow-sm border-top"
//           style={{
//             zIndex: 1000,
//             display: showPanel ? "block" : "none",
//             padding: "1rem",
//           }}
//         >
//           <div className="container py-3">
//             <div className="row">
//               {loading ? (
//                 <p>Memuat kategori...</p>
//               ) : (
//                 kategoriList.map((kategori) => (
//                   <div className="col-6 col-md-3" key={kategori.id_kategori}>
//                     <button
//                       onClick={() => handleKategoriClick(kategori.nama_kategori)}
//                       className="btn btn-link text-start w-100 text-decoration-none text-dark"
//                       style={{ padding: "8px 15px", color: "#333" }}
//                     >
//                       {kategori.nama_kategori}
//                     </button>
//                   </div>
//                 ))
//               )}
//             </div>
//           </div>
//         </div>
//       </div>
//     </nav>
//   );
// };

// export default Navbar;
import React, { useEffect, useState } from "react";
import { FaShoppingCart, FaUser } from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";
import logo from "/assets/logoReuseMart.png";
import { getAllKategori } from "../api/KategoriBarangApi";
import { searchBarangByName } from "../api/BarangApi";

const Navbar = ({ onKategoriSelect = () => {}, onSearch = () => {} }) => {
  const [showPanel, setShowPanel] = useState(false);
  const [kategoriList, setKategoriList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [searchKeyword, setSearchKeyword] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userId, setUserId] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchKategori = async () => {
      try {
        const data = await getAllKategori();
        setKategoriList(data);
      } catch (error) {
        console.error("Gagal memuat kategori:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchKategori();
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      const panel = document.getElementById("kategoriPanel");
      const toggle = document.getElementById("kategoriToggle");
      const profileMenu = document.getElementById("profileMenu");
      const profileToggle = document.getElementById("profileToggle");

      if (panel && !panel.contains(e.target) && !toggle.contains(e.target)) {
        setShowPanel(false);
      }

      if (profileMenu && !profileMenu.contains(e.target) && !profileToggle.contains(e.target)) {
        setShowProfileMenu(false);
      }
    };

    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const userData = localStorage.getItem("user");
    setIsLoggedIn(!!token);

    if (userData) {
      try {
        const user = JSON.parse(userData);
        setUserId(user.id_user);
      } catch (error) {
        console.error("Error parsing user data:", error);
      }
    }
  }, []);

  const togglePanel = () => setShowPanel((prev) => !prev);
  const toggleProfileMenu = () => setShowProfileMenu((prev) => !prev);

  const handleKategoriClick = (namaKategori) => {
    setShowPanel(false);
    onKategoriSelect(namaKategori);
    navigate(`/kategori/${namaKategori}`);
  };

  const handleSearchClick = (e) => {
    e.preventDefault();
    if (searchKeyword.trim() === "") return;
    onSearch(searchKeyword);
  };

  const handleSearchChange = (e) => {
    setSearchKeyword(e.target.value);
  };

  const handleProfileClick = () => {
    if (isLoggedIn && userId) {
      navigate(`/DashboardProfilPembeli/${userId}`);
    } else {
      navigate("/LoginPage");
    }
    setShowProfileMenu(false);
  };

  const handleCartClick = (e) => {
    e.preventDefault();
    if (!isLoggedIn) {
      navigate("/LoginPage");
      return;
    }
    if (userId) {
      navigate(`/keranjang/${userId}`);
    }
  };

  return (
    <nav
      className="navbar navbar-expand-lg navbar-light shadow-sm sticky-top"
      style={{ backgroundColor: "white", boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)" }}
    >
      <div className="container position-relative">
        <Link className="navbar-brand d-flex align-items-center" to="/">
          <img src={logo} alt="Logo" height="40" className="me-2" />
        </Link>

        <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav ms-auto align-items-center w-100">
            <li className="nav-item me-3">
              <button
                className="btn nav-link text-dark"
                id="kategoriToggle"
                onClick={togglePanel}
                style={{ background: "none", border: "none", fontSize: "16px", cursor: "pointer" }}
              >
                Kategori
              </button>
            </li>

            <form className="d-flex me-auto w-50" style={{ maxWidth: "400px" }} onSubmit={handleSearchClick}>
              <input
                className="form-control me-2"
                type="search"
                placeholder="Cari produk..."
                aria-label="Search"
                value={searchKeyword}
                onChange={handleSearchChange}
              />
              <button className="btn btn-outline-dark" type="submit">
                Cari
              </button>
            </form>

            <li className="nav-item me-3">
              <button
                className="btn nav-link text-dark"
                onClick={handleCartClick}
                style={{ background: "none", border: "none", padding: 0 }}
              >
                <FaShoppingCart size={18} />
              </button>
            </li>

            <li className="nav-item position-relative">
              <button
                id="profileToggle"
                className="btn nav-link text-dark"
                onClick={toggleProfileMenu}
                style={{ background: "none", border: "none", fontSize: "16px", cursor: "pointer" }}
              >
                <FaUser size={18} />
              </button>

              {showProfileMenu && (
                <div
                  id="profileMenu"
                  className="position-absolute end-0 mt-2 bg-white shadow rounded border"
                  style={{ zIndex: 1000, minWidth: "150px" }}
                >
                  {isLoggedIn ? (
                    <>
                      <button
                        className="dropdown-item text-dark py-2 px-3 d-block text-decoration-none w-100 text-start border-0 bg-transparent"
                        onClick={handleProfileClick}
                      >
                        Profile
                      </button>
                      <button
                        className="dropdown-item text-dark py-2 px-3 d-block text-decoration-none w-100 text-start border-0 bg-transparent"
                        onClick={() => {
                          localStorage.removeItem("token");
                          localStorage.removeItem("user");
                          setIsLoggedIn(false);
                          setShowProfileMenu(false);
                          window.dispatchEvent(new Event("logout"));
                          navigate("/");
                        }}
                      >
                        Logout
                      </button>
                    </>
                  ) : (
                    <>
                      <Link
                        to="/LoginPage"
                        className="dropdown-item text-dark py-2 px-3 d-block text-decoration-none"
                        onClick={() => setShowProfileMenu(false)}
                      >
                        Login
                      </Link>
                      <Link
                        to="/RegisterPembeli"
                        className="dropdown-item text-dark py-2 px-3 d-block text-decoration-none"
                        onClick={() => setShowProfileMenu(false)}
                      >
                        Register
                      </Link>
                    </>
                  )}
                </div>
              )}
            </li>
          </ul>
        </div>

        {/* Panel kategori */}
        <div
          id="kategoriPanel"
          className="position-absolute top-100 start-0 w-100 bg-white shadow-sm border-top"
          style={{
            zIndex: 1000,
            display: showPanel ? "block" : "none",
            padding: "1rem",
          }}
        >
          <div className="container py-3">
            <div className="row">
              {loading ? (
                <p>Memuat kategori...</p>
              ) : (
                kategoriList.map((kategori) => (
                  <div className="col-6 col-md-3" key={kategori.id_kategori}>
                    <button
                      onClick={() => handleKategoriClick(kategori.nama_kategori)}
                      className="btn btn-link text-start w-100 text-decoration-none text-dark"
                      style={{ padding: "8px 15px", color: "#333" }}
                    >
                      {kategori.nama_kategori}
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;