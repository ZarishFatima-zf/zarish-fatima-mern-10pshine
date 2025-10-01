import React, { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import axios from "axios";
import Picker from "@emoji-mart/react";
import data from "@emoji-mart/data";

const NoteEditor = () => {
  const navigate = useNavigate();
  const { noteId } = useParams();
  const location = useLocation();
  const editorRef = useRef(null);
  const editingNote = location.state?.note || null;

  const [title, setTitle] = useState(editingNote?.title || "");
  const [content, setContent] = useState(editingNote?.content || "");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showModal, setShowModal] = useState(false); // ✅ modal state
  const [modalMessage, setModalMessage] = useState(""); // ✅ message

  const [activeFormats, setActiveFormats] = useState({
    bold: false,
    italic: false,
    underline: false,
    strikeThrough: false,
    fontSize: "",
    fontName: "",
  });

  const handleFormat = (command, value = null) => {
    document.execCommand(command, false, value);
    updateActiveFormats();
  };

  const updateActiveFormats = () => {
    let blockType = document.queryCommandValue("formatBlock");
    if (blockType) blockType = blockType.toLowerCase();

    setActiveFormats({
      bold: document.queryCommandState("bold"),
      italic: document.queryCommandState("italic"),
      underline: document.queryCommandState("underline"),
      strikeThrough: document.queryCommandState("strikeThrough"),
      fontSize: document.queryCommandValue("fontSize"),
      fontName: document.queryCommandValue("fontName"),
    });
  };

  useEffect(() => {
    document.addEventListener("selectionchange", updateActiveFormats);
    return () => {
      document.removeEventListener("selectionchange", updateActiveFormats);
    };
  }, []);

  useEffect(() => {
    if (editingNote && editorRef.current) {
      editorRef.current.innerHTML = editingNote.content || "";
    }
  }, [editingNote]);

  const handleSave = async () => {
    try {
      const user = JSON.parse(localStorage.getItem("user"));
      if (!user) {
        setModalMessage("⚠️ Please login first");
        setShowModal(true);
        return;
      }

      const payload = {
        title,
        content: editorRef.current.innerHTML,
      };

      if (editingNote) {
        await axios.put(
          `http://localhost:5000/api/notes/users/${user.id}/notes/${noteId}`,
          payload
        );
        setModalMessage("✅ Note updated successfully!");
      } else {
        await axios.post("http://localhost:5000/api/notes/add", {
          userId: user.id,
          ...payload,
        });
        setModalMessage("✅ Note saved successfully!");
      }

      setShowModal(true);
      setTimeout(() => {
        setShowModal(false);
        navigate("/notes");
      }, 1500);
    } catch (error) {
      console.error("Save Error:", error.response?.data || error.message);
      setModalMessage(
        "❌ Failed to save note: " +
          (error.response?.data?.message || error.message)
      );
      setShowModal(true);
    }
  };

  // Insert emoji
  const insertEmoji = (emoji) => {
    const selection = window.getSelection();
    if (!selection.rangeCount) return;
    const range = selection.getRangeAt(0);
    range.deleteContents();
    range.insertNode(document.createTextNode(emoji.native));
    range.collapse(false);
    selection.removeAllRanges();
    selection.addRange(range);
    setContent(editorRef.current.innerHTML);
  };

  // Insert link
  const handleLinkInsert = () => {
    const selection = window.getSelection();
    if (!selection.rangeCount) return;

    const range = selection.getRangeAt(0);
    const selectedText = selection.toString();
    let url = selectedText;

    if (!/^https?:\/\//i.test(selectedText)) {
      url = "https://";
    }

    const a = document.createElement("a");
    a.href = url;
    a.textContent = selectedText || url;
    a.target = "_blank";
    a.style.color = "#3b82f6";
    a.style.textDecoration = "underline";

    range.deleteContents();
    range.insertNode(a);

    range.setStartAfter(a);
    range.collapse(true);
    selection.removeAllRanges();
    selection.addRange(range);

    updateActiveFormats();
  };

  // Detect URLs
  const handleInput = (e) => {
    const editor = e.currentTarget;
    const walkNodes = (node) => {
      if (node.nodeType === Node.TEXT_NODE) {
        const urlRegex = /\b((https?:\/\/[^\s<]+)|(www\.[^\s<]+))/gi;
        const text = node.textContent;

        if (urlRegex.test(text)) {
          const frag = document.createDocumentFragment();
          let lastIndex = 0;

          text.replace(urlRegex, (match, _url, httpMatch, wwwMatch, offset) => {
            if (offset > lastIndex) {
              frag.appendChild(document.createTextNode(text.slice(lastIndex, offset)));
            }
            let url = match;
            if (wwwMatch) url = "https://" + match;

            const a = document.createElement("a");
            a.href = url;
            a.textContent = match;
            a.target = "_blank";
            a.style.color = "#3b82f6";
            a.style.textDecoration = "underline";
            frag.appendChild(a);

            lastIndex = offset + match.length;
          });

          if (lastIndex < text.length) {
            frag.appendChild(document.createTextNode(text.slice(lastIndex)));
          }
          node.replaceWith(frag);
        }
      } else if (node.nodeType === Node.ELEMENT_NODE && node.nodeName !== "A") {
        [...node.childNodes].forEach(walkNodes);
      }
    };
    walkNodes(editor);
    setContent(editor.innerHTML);
  };

  return (
    <>
      {/* ✅ Modal Component */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <motion.div
            className="bg-[#071124] p-6 rounded-lg shadow-lg text-center w-80 text-white"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
          >
            <p className="mb-4">{modalMessage}</p>
            <button
              onClick={() => setShowModal(false)}
              className="px-4 py-2 rounded-md bg-[#868532] hover:bg-[#6f6c29] text-white"
            >
              OK
            </button>
          </motion.div>
        </div>
      )}

      {/* Main Editor */}
      <motion.div
        className="min-h-screen bg-[#0A162D] flex items-center justify-center p-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.4 }}
      >
        <motion.div
          className="bg-[#071124] rounded-2xl shadow-lg w-full max-w-3xl p-6 text-white relative"
          initial={{ scale: 0.8, opacity: 0, y: -40 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.8, opacity: 0, y: -40 }}
          transition={{ duration: 0.3 }}
        >
          {/* Back Button */}
          <button
            onClick={() => navigate(-1)}
            className="absolute top-3 right-3 text-gray-300 hover:text-white text-xl"
          >
            ✕
          </button>

          <h2 className="text-2xl font-bold mb-4">
            {editingNote ? "Edit Note" : "New Note"}
          </h2>

          {/* Title */}
          <input
            type="text"
            placeholder="Note title..."
            className="w-full p-3 mb-4 rounded-md bg-transparent border border-yellow-400 text-white outline-none"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />

          {/* Toolbar ... (unchanged) */}

          {/* Editor */}
          <div
            ref={editorRef}
            contentEditable
            className="w-full min-h-[250px] p-3 rounded-md bg-transparent border border-gray-600 text-white outline-none"
            onInput={handleInput}
          ></div>

          <div className="flex justify-end gap-3 mt-6">
            <button
              onClick={() => navigate(-1)}
              className="px-4 py-2 rounded-md border border-gray-400 text-gray-300 hover:bg-gray-700"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-2 rounded-md bg-[#868532] hover:bg-[#6f6c29] text-white"
            >
              {editingNote ? "Update Note" : "Save Note"}
            </button>
          </div>
        </motion.div>
      </motion.div>
    </>
  );
};

export default NoteEditor;
