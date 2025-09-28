import React, { Profiler } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Signup from "./pages/Signup";
import Login from "./pages/Login";
import ForgetPassword from "./components/ForgetPassword";
import Dashboard from "./pages/Dashboard";
import Setting from "./pages/Setting";






function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />       
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/forgot-password" element={<ForgetPassword />} />
        <Route path="/reset-password/:token" element={<ForgetPassword />} /> 
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/setting" element={<Setting />} />



       </Routes>
    </Router>
  );
}

export default App;



