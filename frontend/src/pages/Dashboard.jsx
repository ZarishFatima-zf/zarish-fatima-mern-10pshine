import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import NoteCard from "../components/NoteCard";
import { StickyNote } from "lucide-react";
import Button from "../components/Button";
import axios from "axios";
import API from "../config/api";


const Dashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [notes, setNotes] = useState([]);

useEffect(() => {
  const savedUser = localStorage.getItem("user");
  if (savedUser) {
    const u = JSON.parse(savedUser);
    setUser(u);
    axios.get(`${API}/api/notes/users/${u.id}/notes`)
      .then((res) => {
        // Sort notes by createdAt (descending => latest first)
        const sortedNotes = (res.data.notes || []).sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        );
        setNotes(sortedNotes);
      })
      .catch((err) => console.error("Fetch Notes Error:", err));
  }
}, []);
  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate("/login");
  };

  const handleDeleteNote = async (noteId) => {
    try {
      await axios.delete(`${API}/api/notes/users/${user.id}/notes/${noteId}`);
      setNotes(notes.filter((note) => note._id !== noteId));
    } catch (err) {
      console.error("Delete Note Error:", err);
    }
  };

  const handleEditNote = (noteId) => navigate(`/editor/${noteId}`);

const [notesToDisplay, setNotesToDisplay] = useState([]);

useEffect(() => {
  const updateNotesToDisplay = () => {
    const width = window.innerWidth;
    let limit = 6;

    if (width < 640) {
      limit = 3; // 📱 Mobile
    } else if (width >= 640 && width < 1024) {
      limit = 6; // 📲 Tablet
    } else {
      limit = 6; // 💻 Desktop
    }

    setNotesToDisplay(notes.slice(0, limit));
  };

  updateNotesToDisplay(); // Initial run
  window.addEventListener("resize", updateNotesToDisplay);

  return () => window.removeEventListener("resize", updateNotesToDisplay);
}, [notes]);

  return (
    <motion.div
      className="min-h-screen flex flex-col sm:flex-row bg-[#0A162D] text-white overflow-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <Sidebar onLogout={handleLogout} />

      <main className="flex-1 mt-14 sm:mt-4 p-4 sm:p-6 md:p-8 lg:p-10 flex flex-col justify-start">
          <motion.h2
            className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold mb-3  flex items-center gap-2"
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6 }}
          >
            Welcome To Notezy
            <StickyNote className="text-[#6f6c29]" size={32} /> {user?.fullName || user?.email || "User"}
          </motion.h2>

        <p className="text-gray-400 mb-6">
          Your notes, your space, your way.
        </p>

        {/* Total Notes */}
        <div className="flex justify-end -mt-3 mb-4">
          <div     className="bg-[#868532] text-white py-1.5 sm:py-2 px-3 sm:px-4 rounded-lg w-fit shadow-md text-sm sm:text-base">
            Total Notes: <span className="font-semibold">{notes.length}</span>
          </div>
        </div>

        {/* Notes Grid */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 mt-5 mb-6">
          {notesToDisplay.length > 0 ? (
            notesToDisplay.map((note) => (
              <NoteCard
                key={note._id}
                note={note}
                onDelete={handleDeleteNote}
                onEdit={handleEditNote}
              />
            ))
          ) : (
            <p className="text-gray-400 text-center  col-span-full">
              No notes found. Add your first one!
            </p>
          )}
        </div>

        {/* "More Notes" Button */}
        {notes.length > notesToDisplay.length && (
          <div className="flex justify-center">
            <button
              onClick={() => navigate("/notes")}
              className="bg-[#868532] hover:bg-[#6f6c29] font-semibold transition  text-white px-9 py-3 rounded-lg shadow-md"
            >
              More Notes
            </button>
          </div>
        )}
      </main>

      {/* Floating + Button */}
      <Button
          onClick={() => navigate("/noteeditor")}
          variant="primary"
          className="fixed bottom-4 right-4 rounded-full w-12 h-12 text-3xl flex items-center justify-center shadow-lg"
        >
          +
        </Button>
    </motion.div>
  );
};

export default Dashboard;


