import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from '../pages/client/Home';
import DetailBarang from "../pages/client/DetailBarang";
// import AdminDashboard from '../pages/admin/AdminDashboard';
// import RegisterOrganisasi from '../pages/auth/RegisterOrganisasi';
// import RegisterPembeli from '../pages/auth/RegisterPembeli';
import LoginPage from '../pages/auth/LoginPage';
import DashboardProfilPembeli from '../pages/client/DashboardProfilPembeli';
import 'bootstrap/dist/css/bootstrap.min.css';
// import RegisterPembeliPage from '../pages/auth/RegisterOrganisasi';
import CRUDPenitip from '../pages/auth/CRUDPenitip';
import DashboardOrganisasi from '../pages/client/DashboardOrganisasi';


const AppRoutes = () => {
  return (  
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/product/:id" element={<DetailBarang />} />
        <Route path="/LoginPage" element={<LoginPage/>} />
        <Route path="/DashboardProfilPembeli" element={<DashboardProfilPembeli/>} />
        <Route path="/DashboardOrganisasi" element={<DashboardOrganisasi/>} />
        <Route path="/CRUDPenitip" element={<CRUDPenitip/>} />
      </Routes>
    </Router>
  );
};

export default AppRoutes;