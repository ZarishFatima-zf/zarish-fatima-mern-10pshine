import React from "react"; // 👈 Add this line
import { motion } from "framer-motion";
import { Pencil, Trash2, Calendar, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";

const NoteCard = ({ note, onDelete }) => {
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [needsTruncate, setNeedsTruncate] = useState(false);

  // Check if content needs truncation (>120 chars without HTML tags)
  useEffect(() => {
    const plainText = note.content?.replace(/<[^>]+>/g, "") || "";
    setNeedsTruncate(plainText.length > 120);
  }, [note.content]);

  // Prevent background scroll when modal is open
  useEffect(() => {
    document.body.style.overflow = isModalOpen ? "hidden" : "auto";
    return () => (document.body.style.overflow = "auto");
  }, [isModalOpen]);

  return (
    <>
      {/* Note Card */}
      <motion.div
        className="bg-[#071124] rounded-2xl p-4 cursor-pointer flex flex-col relative transition-shadow duration-300"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{
          scale: 1.03,
          y: -3,
          boxShadow: "0px 8px 25px -5px #6f6c29",
        }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
      >
        {/* Action Buttons */}
        <div className="flex gap-3 justify-end mb-2">
          <button
            onClick={() => navigate(`/editor/${note._id}`, { state: { note } })}
            className="hover:text-blue-400 transition"
          >
            <Pencil size={14} />
          </button>
          <button
            onClick={() => onDelete(note._id)}
            className="hover:text-red-400 transition"
          >
            <Trash2 size={14} />
          </button>
        </div>

        {/* Title */}
        <h3 className="text-lg font-semibold text-white mb-1">
          {note.title || "No Title"}
        </h3>

        {/* URL */}
        {note.url && (
          <a
            href={note.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-400 text-sm hover:underline mb-2 block break-words"
          >
            {note.url}
          </a>
        )}

        {/* Preview Content */}
        <div
          className="text-gray-300 text-sm mb-2 line-clamp-4"
          dangerouslySetInnerHTML={{ __html: note.content }}
        />

        {/* Read More */}
        {needsTruncate && (
          <div className="flex justify-end">
            <button
              className="text-blue-400 text-sm hover:underline"
              onClick={() => setIsModalOpen(true)}
            >
              Read More
            </button>
          </div>
        )}

        {/* Footer Date */}
        <div className="flex items-center justify-between text-gray-400 text-xs mt-auto">
          <span className="flex items-center gap-1">
            <Calendar size={14} />
            {note.updatedAt
              ? new Date(note.updatedAt).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })
              : "No date"}
          </span>
        </div>
      </motion.div>

      {/* Modal */}
      {isModalOpen && (
        <div
          className="fixed inset-0 z-10 flex items-center justify-center backdrop-blur-sm bg-black/70 p-4"
          onClick={() => setIsModalOpen(false)}
        >
          <motion.div
            className="bg-[#071124] rounded-2xl p-6 w-full max-w-2xl relative max-h-[90vh] overflow-y-auto"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close */}
            <button
              className="absolute top-4 right-4 text-gray-400 hover:text-white"
              onClick={() => setIsModalOpen(false)}
            >
              <X size={20} />
            </button>

            {/* Title */}
            <h2 className="text-xl font-bold text-white mb-4">
              {note.title || "No Title"}
            </h2>

            {/* URL */}
            {note.url && (
              <a
                href={note.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-400 text-sm hover:underline mb-4 block break-words"
              >
                {note.url}
              </a>
            )}

            {/* Full Content */}
            <div
              className="text-gray-300 text-sm break-words"
              dangerouslySetInnerHTML={{ __html: note.content }}
            />

            {/* Footer */}
            <div className="flex items-center justify-end text-gray-400 text-xs mt-4">
              <span className="flex items-center gap-1">
                <Calendar size={14} />
                {note.updatedAt
                  ? new Date(note.updatedAt).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })
                  : "No date"}
              </span>
            </div>
          </motion.div>
        </div>
      )}
    </>
  );
};

export default NoteCard;
