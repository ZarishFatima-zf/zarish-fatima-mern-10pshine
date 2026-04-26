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

  // 🔔 Custom notification state
  const [notification, setNotification] = useState({ show: false, message: "", type: "success" });

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
    return () => {
      document.removeEventListener("selectionchange", updateActiveFormats);
    };
  }, []);

  useEffect(() => {
    if (editingNote && editorRef.current) {
      editorRef.current.innerHTML = editingNote.content || "";
    }
  }, [editingNote]);

  const showNotification = (message, type = "success") => {
    setNotification({ show: true, message, type });
    setTimeout(() => setNotification({ show: false, message: "", type: "success" }), 3000);
  };

  const handleSave = async () => {
    try {
      const user = JSON.parse(localStorage.getItem("user"));
      if (!user) {
        showNotification("⚠️ Please login first", "error");
        navigate("/login");
        return;
      }

      const payload = {
        title,
        content: editorRef.current.innerHTML,
      };

      if (editingNote) {
        await axios.put(
          `${API}${user.id}/notes/${noteId}`,
          payload
        );
        showNotification("✅ Note updated successfully!", "success");
      } else {
        await axios.post('${API}/api/notes/add', {
          userId: user.id,
          ...payload,
        });
        showNotification("✅ Note saved successfully!", "success");
      }

      setTimeout(() => navigate("/notes"), 1200);
    } catch (error) {
      console.error("Save Error:", error.response?.data || error.message);
      showNotification(
        "❌ Failed to save note: " + (error.response?.data?.message || error.message),
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
            if (wwwMatch) {
              url = "https://" + match;
            }

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
    <motion.div
      className="min-h-screen bg-[#0A162D] flex items-center justify-center p-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
    >
      {/* 🔔 Top Notification Bar */}
      {notification.show && (
        <motion.div
          className={`fixed top-4 left-1/2 transform -translate-x-1/2 px-6 py-3 rounded-lg shadow-lg text-white z-50
            ${notification.type === "success" ? "bg-[#071124]" : "bg-red-600"}`}
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -50, opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          {notification.message}
        </motion.div>
      )}

      <motion.div
        className="bg-[#071124] rounded-2xl shadow-lg w-full max-w-3xl p-6 text-white relative"
        initial={{ scale: 0.8, opacity: 0, y: -40 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.8, opacity: 0, y: -40 }}
        transition={{ duration: 0.3 }}
      >
        {/* Close / Back */}
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

        {/* Toolbar */}
        <div className="flex flex-wrap gap-2 mb-4 text-gray-300 relative">
          <button
            onClick={() => handleFormat("bold")}
            className={`font-bold px-2 py-1 rounded ${
              activeFormats.bold ? "bg-[#868532] text-white" : "hover:text-white"
            }`}
          >
            B
          </button>
          <button
            onClick={() => handleFormat("italic")}
            className={`italic px-2 py-1 rounded ${
              activeFormats.italic ? "bg-[#868532] text-white" : "hover:text-white"
            }`}
          >
            I
          </button>
          <button
            onClick={() => handleFormat("underline")}
            className={`underline px-2 py-1 rounded ${
              activeFormats.underline ? "bg-[#868532] text-white" : "hover:text-white"
            }`}
          >
            U
          </button>
          <button
            onClick={() => handleFormat("strikeThrough")}
            className={`line-through px-2 py-1 rounded ${
              activeFormats.strikeThrough ? "bg-[#868532] text-white" : "hover:text-white"
            }`}
          >
            S
          </button>

          <select
            onChange={(e) => handleFormat("fontSize", e.target.value)}
            value={activeFormats.fontSize || ""}
            className="bg-[#071124] border border-gray-600 px-2 py-1 rounded text-white"
          >
            <option value="">Size</option>
            <option value="1">10px</option>
            <option value="2">13px</option>
            <option value="3">16px</option>
            <option value="4">18px</option>
            <option value="5">24px</option>
            <option value="6">32px</option>
            <option value="7">48px</option>
          </select>

          <select
            onChange={(e) => handleFormat("fontName", e.target.value)}
            value={activeFormats.fontName || ""}
            className="bg-[#071124] border border-gray-600 px-2 py-1 rounded text-white"
          >
            <option value="">Font</option>
            <option value="Arial">Arial</option>
            <option value="Times New Roman">Times</option>
            <option value="Courier New">Courier</option>
            <option value="Verdana">Verdana</option>
            <option value="Georgia">Georgia</option>
          </select>

          <button onClick={() => handleFormat("justifyLeft")} className="px-2 py-1 rounded hover:text-white">⟸</button>
          <button onClick={() => handleFormat("justifyCenter")} className="px-2 py-1 rounded hover:text-white">☰</button>
          <button onClick={() => handleFormat("justifyRight")} className="px-2 py-1 rounded hover:text-white">⟹</button>

          <button onClick={handleLinkInsert} className="px-2 py-1 rounded hover:text-white">🔗</button>
          <button onClick={() => setShowEmojiPicker((prev) => !prev)} className="px-2 py-1 rounded hover:text-white">😀</button>

          {showEmojiPicker && (
            <div className="absolute top-12 z-50">
              <Picker data={data} onEmojiSelect={insertEmoji} theme="dark" />
            </div>
          )}
        </div>

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
  );
};

export default NoteEditor;

// import React, { useState, useRef, useEffect } from "react";
// import { motion } from "framer-motion";
// import { useNavigate, useParams, useLocation } from "react-router-dom";
// import axios from "axios";
// import Picker from "@emoji-mart/react";
// import data from "@emoji-mart/data";
// import API from "../config/api";

// const NoteEditor = () => {
//   const navigate = useNavigate();
//   const { noteId } = useParams();
//   const location = useLocation();
//   const editorRef = useRef(null);

//   const editingNote = location.state?.note || null;

//   const [title, setTitle] = useState(editingNote?.title || "");
//   const [content, setContent] = useState(editingNote?.content || "");
//   const [showEmojiPicker, setShowEmojiPicker] = useState(false);

//   const [notification, setNotification] = useState({
//     show: false,
//     message: "",
//     type: "success",
//   });

//   const [activeFormats, setActiveFormats] = useState({
//     bold: false,
//     italic: false,
//     underline: false,
//     strikeThrough: false,
//     fontSize: "",
//     fontName: "",
//   });

//   const handleFormat = (command, value = null) => {
//     document.execCommand(command, false, value);
//     updateActiveFormats();
//   };

//   const updateActiveFormats = () => {
//     setActiveFormats({
//       bold: document.queryCommandState("bold"),
//       italic: document.queryCommandState("italic"),
//       underline: document.queryCommandState("underline"),
//       strikeThrough: document.queryCommandState("strikeThrough"),
//       fontSize: document.queryCommandValue("fontSize"),
//       fontName: document.queryCommandValue("fontName"),
//     });
//   };

//   useEffect(() => {
//     document.addEventListener("selectionchange", updateActiveFormats);
//     return () =>
//       document.removeEventListener("selectionchange", updateActiveFormats);
//   }, []);

//   useEffect(() => {
//     if (editingNote && editorRef.current) {
//       editorRef.current.innerHTML = editingNote.content || "";
//     }
//   }, [editingNote]);

//   const showNotification = (message, type = "success") => {
//     setNotification({ show: true, message, type });
//     setTimeout(
//       () => setNotification({ show: false, message: "", type: "success" }),
//       3000
//     );
//   };

//   // ✅ FIXED SAVE FUNCTION (MAIN FIX)
//   const handleSave = async () => {
//     try {
//       const user = JSON.parse(localStorage.getItem("user"));

//       if (!user?.id) {
//         showNotification("❌ User not found!", "error");
//         return;
//       }

//       const payload = {
//         title: title.trim(),
//         content: editorRef.current?.innerHTML || "",
//       };

//       // UPDATE NOTE
//       if (editingNote) {
//         await axios.put(
//           `${API}/api/notes/users/${user.id}/notes/${noteId}`,
//           payload
//         );
//         showNotification("✅ Note updated successfully!", "success");
//       }
//       // CREATE NOTE
//       else {
//         await axios.post(`${API}/api/notes/add`, {
//           userId: user.id,
//           ...payload,
//         });
//         showNotification("✅ Note saved successfully!", "success");
//       }

//       setTimeout(() => navigate("/notes"), 1200);
//     } catch (error) {
//       console.error("Save Error:", error.response?.data || error.message);

//       showNotification(
//         "❌ Failed to save note: " +
//           (error.response?.data?.message || error.message),
//         "error"
//       );
//     }
//   };

//   const insertEmoji = (emoji) => {
//     const selection = window.getSelection();
//     if (!selection.rangeCount) return;

//     const range = selection.getRangeAt(0);
//     range.deleteContents();
//     range.insertNode(document.createTextNode(emoji.native));
//     range.collapse(false);
//     selection.removeAllRanges();
//     selection.addRange(range);
//     setContent(editorRef.current.innerHTML);
//   };

//   const handleInput = (e) => {
//     const editor = e.currentTarget;

//     const walkNodes = (node) => {
//       if (node.nodeType === Node.TEXT_NODE) {
//         const urlRegex = /\b((https?:\/\/[^\s<]+)|(www\.[^\s<]+))/gi;
//         const text = node.textContent;

//         if (urlRegex.test(text)) {
//           const frag = document.createDocumentFragment();
//           let lastIndex = 0;

//           text.replace(urlRegex, (match, _u, http, www, offset) => {
//             if (offset > lastIndex) {
//               frag.appendChild(
//                 document.createTextNode(text.slice(lastIndex, offset))
//               );
//             }

//             let url = match;
//             if (www) url = "https://" + match;

//             const a = document.createElement("a");
//             a.href = url;
//             a.textContent = match;
//             a.target = "_blank";
//             a.style.color = "#3b82f6";
//             a.style.textDecoration = "underline";

//             frag.appendChild(a);
//             lastIndex = offset + match.length;
//           });

//           if (lastIndex < text.length) {
//             frag.appendChild(document.createTextNode(text.slice(lastIndex)));
//           }

//           node.replaceWith(frag);
//         }
//       } else if (node.nodeType === 1 && node.nodeName !== "A") {
//         [...node.childNodes].forEach(walkNodes);
//       }
//     };

//     walkNodes(editor);
//     setContent(editor.innerHTML);
//   };

//   return (
//     <motion.div className="min-h-screen bg-[#0A162D] flex items-center justify-center p-6">
//       {notification.show && (
//         <div className="fixed top-4 left-1/2 -translate-x-1/2 px-6 py-3 rounded bg-[#071124] text-white z-50">
//           {notification.message}
//         </div>
//       )}

//       <div className="bg-[#071124] w-full max-w-3xl p-6 rounded-2xl text-white">
//         <h2 className="text-2xl mb-4">
//           {editingNote ? "Edit Note" : "New Note"}
//         </h2>

//         <input
//           value={title}
//           onChange={(e) => setTitle(e.target.value)}
//           placeholder="Title"
//           className="w-full p-3 mb-4 bg-transparent border border-gray-600 rounded"
//         />

//         <div
//           ref={editorRef}
//           contentEditable
//           onInput={handleInput}
//           className="min-h-[250px] p-3 border border-gray-600 rounded"
//         ></div>

//         <div className="flex justify-end gap-3 mt-6">
//           <button onClick={() => navigate(-1)}>Cancel</button>
//           <button onClick={handleSave} className="bg-[#868532] px-4 py-2">
//             {editingNote ? "Update" : "Save"}
//           </button>
//         </div>
//       </div>
//     </motion.div>
//   );
// };

// export default NoteEditor;
