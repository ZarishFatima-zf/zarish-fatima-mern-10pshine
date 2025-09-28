import React from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";

const Dashboard = ({ user }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    navigate("/login");
  };

  return (
    <motion.div
      className="min-h-screen flex flex-col sm:flex-row bg-[#0A162D] text-white"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <Sidebar onLogout={handleLogout} />

      <main className="flex-1 mt-14 sm:mt-0 p-4 sm:p-6 md:p-8 lg:p-10">
        <motion.h2
          className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold mb-3 sm:mb-4"
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6 }}
        >
          Welcome To Notezy, {user?.name || user?.email || "User"}
        </motion.h2>

        <p className="text-gray-400 text-sm sm:text-base md:text-lg lg:text-xl leading-relaxed">
          Your notes, your space, your way because every idea deserves a home.
        </p>
      </main>

      <button className="fixed bottom-4 sm:bottom-5 md:bottom-6 right-4 sm:right-5 md:right-6 bg-[#868532] hover:bg-[#6f6c29] text-white rounded-full w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 text-2xl sm:text-3xl flex items-center justify-center shadow-lg">
        +
      </button>
    </motion.div>
  );
};

export default Dashboard;
