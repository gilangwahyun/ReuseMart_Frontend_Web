import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from '../pages/client/Home';
import DetailBarang from "../pages/client/DetailBarang";
import AdminDashboard from '../pages/admin/AdminDashboard';

const AppRoutes = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/product/:id" element={<DetailBarang />} />
      </Routes>
    </Router>
  );
};

export default AppRoutes;