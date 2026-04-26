import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Sidebar from "../components/SideBar";
import NoteCard from "../components/NoteCard";
import Button from "../components/Button";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { Search,ArrowBigDown } from "lucide-react";
import API from "../config/api";

const AllNotes = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [notes, setNotes] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [notesPerPage, setNotesPerPage] = useState(9);
  const [sortOption, setSortOption] = useState("latest");
  const [searchQuery, setSearchQuery] = useState("");

  // Responsive notes per page
  useEffect(() => {
    const updateNotesPerPage = () => {
      const width = window.innerWidth;
      if (width < 640) setNotesPerPage(2);
      else if (width >= 640 && width < 1024) setNotesPerPage(6);
      else setNotesPerPage(6);
    };
    updateNotesPerPage();
    window.addEventListener("resize", updateNotesPerPage);
    return () => window.removeEventListener("resize", updateNotesPerPage);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate("/login");
  };

  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    if (savedUser) {
      const u = JSON.parse(savedUser);
      setUser(u);
      fetchNotes(u.id);
    }
  }, []);

  const fetchNotes = async (userId) => {
    try {
      const res = await axios.get(`${API}/api/notes/users/${userId}/notes`);
      setNotes(res.data.notes || []);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteNote = async (noteId) => {
    try {
      await      awaitaxios.delete(`${API}/api/notes/users/${user.id}/notes/${noteId}`);

      setNotes(notes.filter((note) => note._id !== noteId));
    } catch (err) {
      console.error(err);
    }
  };

  // Sorting notes
  const sortedNotes = [...notes].sort((a, b) => {
    if (sortOption === "latest") return new Date(b.createdAt) - new Date(a.createdAt);
    if (sortOption === "oldest") return new Date(a.createdAt) - new Date(b.createdAt);
    return 0;
  });

  // Filter notes based on search query
  const filteredNotes = sortedNotes.filter((note) => {
    const query = searchQuery.toLowerCase();
    return (
      note.title.toLowerCase().includes(query) ||
      note.content.toLowerCase().includes(query)
    );
  });

  // Pagination
  const indexOfLastNote = currentPage * notesPerPage;
  const indexOfFirstNote = indexOfLastNote - notesPerPage;
  const currentNotes = filteredNotes.slice(indexOfFirstNote, indexOfLastNote);
  const totalPages = Math.ceil(filteredNotes.length / notesPerPage);

  const handlePageClick = (pageNum) => setCurrentPage(pageNum);
  const handlePrev = () => currentPage > 1 && setCurrentPage(currentPage - 1);
  const handleNext = () =>
    currentPage < totalPages && setCurrentPage(currentPage + 1);

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.3 } },
  };

  return (
    <motion.div
      className="min-h-screen flex flex-col sm:flex-row bg-[#0A162D] text-white overflow-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <Sidebar onLogout={handleLogout} />

      <main className="flex-1 flex flex-col mt-14 sm:mt-0 p-2 sm:p-6 md:p-6 lg:p-8">
        {/* Header */}
        <div className="text-center mb-1 md:mb-2 lg:mb-2">
          <motion.h2
            className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-2  md:mb-3"
            initial={{ y: -10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6 }}
          >
            All Notes
          </motion.h2>
          <motion.p
            className="text-gray-400 text-sm sm:text-base lg:text-lg mb-3 max-w-2xl mx-auto leading-relaxed"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.6 }}
          >
            Your personal space for everything you add & track.
          </motion.p>
        </div>

        {/* Total Notes + Search + Sort */}
       <div className="flex flex-wrap justify-between items-center bg-[#0A162D] z-10 p-3 sm:p-3 mb-2">
        {/* Sort Dropdown */}
      <div className="relative flex items-center">
        <select
          value={sortOption}
          onChange={(e) => setSortOption(e.target.value)}
          className="bg-[#868532] text-white py-1.5 sm:py-2 pl-4 pr-9 rounded-lg w-fit  text-sm sm:text-base 
                    appearance-none cursor-pointer focus:outline-none border-none"
        >
                <option value="latest">Latest</option>
                <option value="oldest">Oldest</option>
              </select>

              {/* Icon on the right side */}
              <ArrowBigDown className="absolute right-3 text-white w-4 h-4 pointer-events-none" />
            </div>


        {/* Search Bar */}
        <div className="flex items-center gap-2 relative flex-1 sm:flex-none">
          <input
            type="text"
            placeholder="Search notes..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
          className="bg-gray-700 text-white py-2 px-3 rounded-md shadow-md focus:outline-none text-sm sm:text-base 
                w-full sm:w-[280px] md:w-[380px] lg:w-[520px] transition-all"    />
              {/* Search icon right side */}
              <Search className="absolute right-2 sm:right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 sm:w-3 sm:h-3" />
            </div>

        <div className="bg-[#868532] text-white py-1.5 sm:py-2 px-3 sm:px-4 rounded-lg w-fit shadow-md text-sm sm:text-base">
          Total Notes: <span className="font-semibold">{notes.length}</span>
        </div>
      </div>

        {/* Notes Grid */}
        <motion.div
          className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3 mt-5 lg:mb-10 mb-4 px-2"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <AnimatePresence>
            {currentNotes.length > 0 ? (
              currentNotes.map((note) => (
                <NoteCard
                  key={note._id}
                  note={note}
                  onDelete={() => handleDeleteNote(note._id)}
                />
              ))
            ) : (
              <motion.p
                className="text-gray-400 col-span-full text-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
              >
                No notes found.
              </motion.p>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-3 mb-4 flex-wrap">
            <button
              onClick={handlePrev}
              className="px-3 py-1 rounded-md bg-gray-700 text-gray-300 hover:bg-[#868532]"
            >
              Prev
            </button>
            {Array.from({ length: totalPages }, (_, i) => (
              <button
                key={i + 1}
                onClick={() => handlePageClick(i + 1)}
                className={`px-3 py-1 rounded-md ${
                  currentPage === i + 1
                    ? "bg-[#868532] text-white"
                    : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                }`}
              >
                {i + 1}
              </button>
            ))}
            <button
              onClick={handleNext}
              className="px-3 py-1 rounded-md bg-gray-700 text-gray-300 hover:bg-[#868532]"
            >
              Next
            </button>
          </div>
        )}

        {/* Floating + Button */}
        <Button
          onClick={() => navigate("/noteeditor")}
          variant="primary"
          className="fixed bottom-4 right-4 rounded-full w-12 h-12 text-3xl flex items-center justify-center shadow-lg"
        >
          +
        </Button>
      </main>
    </motion.div>
  );
};

export default AllNotes;
