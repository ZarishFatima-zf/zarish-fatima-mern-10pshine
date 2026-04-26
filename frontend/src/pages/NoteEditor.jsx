import React, { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import axios from "axios";
import Picker from "@emoji-mart/react";
import data from "@emoji-mart/data";
import API from "../config/api";

const NoteEditor = () => {
  const navigate = useNavigate();
  const { noteId } = useParams();
  const location = useLocation();
  const editorRef = useRef(null);

  const editingNote = location.state?.note || null;

  const [title, setTitle] = useState(editingNote?.title || "");
  const [content, setContent] = useState(editingNote?.content || "");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  const [notification, setNotification] = useState({
    show: false,
    message: "",
    type: "success",
  });

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
    return () =>
      document.removeEventListener("selectionchange", updateActiveFormats);
  }, []);

  useEffect(() => {
    if (editingNote && editorRef.current) {
      editorRef.current.innerHTML = editingNote.content || "";
    }
  }, [editingNote]);

  const showNotification = (message, type = "success") => {
    setNotification({ show: true, message, type });
    setTimeout(
      () => setNotification({ show: false, message: "", type: "success" }),
      3000
    );
  };

  // ✅ FIXED SAVE FUNCTION (MAIN FIX)
  const handleSave = async () => {
    try {
      const user = JSON.parse(localStorage.getItem("user"));

      if (!user?.id) {
        showNotification("❌ User not found!", "error");
        return;
      }

      const payload = {
        title: title.trim(),
        content: editorRef.current?.innerHTML || "",
      };

      // UPDATE NOTE
      if (editingNote) {
        await axios.put(
          `${API}/api/notes/users/${user.id}/notes/${noteId}`,
          payload
        );
        showNotification("✅ Note updated successfully!", "success");
      }
      // CREATE NOTE
      else {
        await axios.post(`${API}/api/notes/add`, {
          userId: user.id,
          ...payload,
        });
        showNotification("✅ Note saved successfully!", "success");
      }

      setTimeout(() => navigate("/notes"), 1200);
    } catch (error) {
      console.error("Save Error:", error.response?.data || error.message);

      showNotification(
        "❌ Failed to save note: " +
          (error.response?.data?.message || error.message),
        "error"
      );
    }
  };

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

  const handleInput = (e) => {
    const editor = e.currentTarget;

    const walkNodes = (node) => {
      if (node.nodeType === Node.TEXT_NODE) {
        const urlRegex = /\b((https?:\/\/[^\s<]+)|(www\.[^\s<]+))/gi;
        const text = node.textContent;

        if (urlRegex.test(text)) {
          const frag = document.createDocumentFragment();
          let lastIndex = 0;

          text.replace(urlRegex, (match, _u, http, www, offset) => {
            if (offset > lastIndex) {
              frag.appendChild(
                document.createTextNode(text.slice(lastIndex, offset))
              );
            }

            let url = match;
            if (www) url = "https://" + match;

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
      } else if (node.nodeType === 1 && node.nodeName !== "A") {
        [...node.childNodes].forEach(walkNodes);
      }
    };

    walkNodes(editor);
    setContent(editor.innerHTML);
  };

  return (
    <motion.div className="min-h-screen bg-[#0A162D] flex items-center justify-center p-6">
      {notification.show && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 px-6 py-3 rounded bg-[#071124] text-white z-50">
          {notification.message}
        </div>
      )}

      <div className="bg-[#071124] w-full max-w-3xl p-6 rounded-2xl text-white">
        <h2 className="text-2xl mb-4">
          {editingNote ? "Edit Note" : "New Note"}
        </h2>

        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Title"
          className="w-full p-3 mb-4 bg-transparent border border-gray-600 rounded"
        />

        <div
          ref={editorRef}
          contentEditable
          onInput={handleInput}
          className="min-h-[250px] p-3 border border-gray-600 rounded"
        ></div>

        <div className="flex justify-end gap-3 mt-6">
          <button onClick={() => navigate(-1)}>Cancel</button>
          <button onClick={handleSave} className="bg-[#868532] px-4 py-2">
            {editingNote ? "Update" : "Save"}
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default NoteEditor;