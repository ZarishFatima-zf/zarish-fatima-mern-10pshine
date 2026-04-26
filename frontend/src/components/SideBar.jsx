import React from "react";
import { NavLink } from "react-router-dom";
import { motion } from "framer-motion";
import { StickyNote, LayoutDashboard, NotebookPen,User , Settings, LogOut } from "lucide-react";


const Sidebar = ({ onLogout }) => {
  const menuItems = [
    { name: "Dashboard", icon: <LayoutDashboard className="w-6 h-6 sm:w-6 sm:h-6" />, path: "/dashboard" },
    { name: "Add Note", icon: <NotebookPen className="w-6 h-6 sm:w-6 sm:h-6" />, path: "/noteeditor" },
    { name: "All Notes", icon: <StickyNote className="w-6 h-6 sm:w-6 sm:h-6" />, path: "/notes" },
    { name: "Profile", icon: <User className="w-6 h-6 sm:w-6 sm:h-6" />, path: "/profile" },
    { name: "Settings", icon: <Settings className="w-6 h-6 sm:w-6 sm:h-6" />, path: "/setting" },
  ];

  return (
    <>
      {/* ===== Desktop / Tablet Sidebar ===== */}
      <aside className="hidden sm:flex w-48 md:w-56 lg:w-64 h-screen bg-[#071124] flex-col p-4 md:p-6 border-r border-slate-700">
        
        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex items-center gap-3 mb-10 px-2"
        >
          <StickyNote className="w-10 h-10 md:w-11 md:h-11 lg:w-12 lg:h-12 text-[#868532]" />
          <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-white">
            Notezy
          </h1>
        </motion.div>

        {/* Navigation */}
        <nav className="flex-1 space-y-3 text-base md:text-lg lg:text-xl">
          {menuItems.map((item, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: idx * 0.1 }}
            >
              <NavLink
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center gap-4 px-3 py-2 rounded-lg transition-all duration-300 ${
                    isActive
                      ? "bg-[#868532] text-white font-semibold"
                      : "text-white hover:bg-[#868532] hover:text-white"
                  }`
                }
              >
                {item.icon}
                <span>{item.name}</span>
              </NavLink>
            </motion.div>
          ))}
        </nav>

        {/* Logout */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="mt-6"
        >
          <button
            onClick={onLogout}
            className="flex items-center gap-3 w-full px-3 py-2 text-lg rounded-lg border border-[#868532] text-[#868532] hover:bg-[#868532] hover:text-white transition-colors"
          >
            <LogOut className="w-7 h-7" />
            <span>Logout</span>
          </button>
        </motion.div>
      </aside>

      {/* ===== Mobile Top Navbar ===== */}
      <motion.header
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="sm:hidden fixed top-0 left-0 w-full bg-[#071124] border-b border-slate-700 flex items-center justify-between px-4 py-3 z-50"
      >
        {/* Left: Logo */}
        <div className="flex items-center gap-2">
          <StickyNote className="w-7 h-7 text-[#868532]" />
          <h1 className="text-2xl font-bold text-white">Notezy</h1>
        </div>

        {/* Right: Icons + Logout */}
        <div className="flex items-center gap-1">
          {menuItems.map((item, idx) => (
            <NavLink
              key={idx}
              to={item.path}
              className={({ isActive }) =>
                `relative p-0.5 transition-all ${
                  isActive
                    ? "text-[#868532] after:absolute after:bottom-0 after:left-0 after:w-full after:h-[2px] after:bg-[#868532]"
                    : "text-white hover:text-[#868532] hover:after:absolute hover:after:bottom-0 hover:after:left-0 hover:after:w-full hover:after:h-[2px] hover:after:bg-[#868532]"
                }`
              }
            >
              {item.icon}
            </NavLink>
          ))}

          <button
            onClick={onLogout}
            className="p-2 rounded-lg border border-[#868532] text-[#868532] hover:bg-[#868532] hover:text-white transition-colors"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </motion.header>
    </>
  );
};

export default Sidebar;
