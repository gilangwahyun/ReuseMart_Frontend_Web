import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from '../pages/client/Home';
import DetailBarang from "../pages/client/DetailBarang";
import AdminDashboard from '../pages/admin/AdminDashboard';
import RegisterOrganisasi from '../pages/auth/RegisterOrganisasi';
import RegisterPembeli from '../pages/auth/RegisterPembeli';
import 'bootstrap/dist/css/bootstrap.min.css';


const AppRoutes = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={< RegisterOrganisasi/>} />
        <Route path="/product/:id" element={<DetailBarang />} />
      </Routes>
    </Router>
  );
};

export default AppRoutes;