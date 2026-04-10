import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import About from './pages/About';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Prediction from './pages/Prediction';
import Maintenance from './pages/Maintenance';
import Carbon from './pages/Carbon';
import Sensors from './pages/Sensors';
import AppLayout from './layouts/AppLayout';

function App() {
  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/login" element={<Login />} />

        {/* Protected/App Routes */}
        <Route element={<AppLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/prediction" element={<Prediction />} />
          <Route path="/maintenance" element={<Maintenance />} />
          <Route path="/carbon" element={<Carbon />} />
          <Route path="/sensors" element={<Sensors />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
