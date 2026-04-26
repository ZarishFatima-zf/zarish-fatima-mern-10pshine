import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Camera, X } from "lucide-react";
import Sidebar from "../components/SideBar";
import Button from "../components/Button";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import API from "../config/api";

const Profile = () => {
  const navigate = useNavigate();

  const [isEditing, setIsEditing] = useState(false);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [backup, setBackup] = useState({ name: "", email: "", image: "" });

  const [userId, setUserId] = useState(null);
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);

  // 🔐 Load user from localStorage
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (!storedUser) return navigate("/login");

    const parsed = JSON.parse(storedUser);
    if (!parsed.id) return navigate("/login");

    setUserId(parsed.id);
    setFullName(parsed.fullName);
    setEmail(parsed.email);
    setImage(parsed.image || null);
  }, [navigate]);

  // 📡 Fetch profile from backend (UPDATED)
  useEffect(() => {
    if (!userId) return;

    axios
      .get(`${API}/api/auth/${userId}`)
      .then((res) => {
        setFullName(res.data.fullName);
        setEmail(res.data.email);
        setImage(res.data.image || null);
      })
      .catch((err) =>
        console.error("Profile fetch error:", err.response?.data || err.message)
      );
  }, [userId]);

  // ✏️ Edit
  const handleEdit = () => {
    setBackup({ name: fullName, email, image });
    setIsEditing(true);
  };

  // ❌ Cancel
  const handleCancel = () => {
    setFullName(backup.name);
    setEmail(backup.email);
    setImage(backup.image);
    setPreview(null);
    setIsEditing(false);
  };

  // 💾 Save (UPDATED API)
  const handleSave = async () => {
    if (!fullName || !email) {
      alert("Full Name and Email cannot be empty!");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("fullName", fullName);
      formData.append("email", email);

      if (preview instanceof File) {
        formData.append("image", preview);
      } else if (preview === "remove") {
        formData.append("removeImage", "true");
      }

      const res = await axios.put(
        `${API}/api/auth/${userId}`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );

      localStorage.setItem("user", JSON.stringify(res.data.user));

      setFullName(res.data.user.fullName);
      setEmail(res.data.user.email);
      setImage(res.data.user.image || null);
      setPreview(null);
      setIsEditing(false);
    } catch (err) {
      console.error("Profile update error:", err.response?.data || err.message);
    }
  };

  // 🚪 Logout
  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate("/login");
  };

  // 🖼️ Image change
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const allowedTypes = ["image/png", "image/jpeg", "image/jpg"];
    if (!allowedTypes.includes(file.type)) {
      alert("Only PNG, JPG, JPEG files are allowed");
      return;
    }

    setPreview(file);
    setImage(URL.createObjectURL(file));
  };

  // 🗑️ Remove image
  const handleRemoveImage = () => {
    setPreview("remove");
    setImage(null);
  };

  return (
    <motion.div
      className="min-h-screen flex flex-col sm:flex-row bg-[#0A162D] text-white overflow-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <Sidebar onLogout={handleLogout} />

      {/* Main */}
      <main className="flex-1 mt-14 sm:mt-4 p-4 sm:p-6 md:p-8 lg:p-10 flex flex-col items-center">

        {/* Heading */}
        <div className="text-center mb-8">
          <h2 className="text-3xl sm:text-4xl font-bold">Profile</h2>
          <p className="text-gray-400 text-sm sm:text-base">
            Manage your account settings and preferences
          </p>
        </div>

        {/* Card */}
        <motion.div
          className="bg-[#071124] w-full max-w-2xl p-6 rounded-xl shadow-lg"
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
        >

          {/* Avatar */}
          <div className="flex flex-col items-center mb-6 relative">
            <div className="relative w-28 h-28">
              <div className="w-full h-full rounded-full bg-[#868532] flex items-center justify-center overflow-hidden">
                {image ? (
                  <img
                    src={image}
                    alt="avatar"
                    className="w-full h-full object-cover rounded-full"
                  />
                ) : (
                  <span className="text-4xl font-bold">
                    {fullName ? fullName.charAt(0) : "?"}
                  </span>
                )}
              </div>

              {isEditing && (
                <>
                  <label className="absolute bottom-0 right-0 bg-[#868532] p-1 rounded-full cursor-pointer">
                    <Camera className="w-4 h-4" />
                    <input
                      type="file"
                      accept=".png,.jpg,.jpeg"
                      className="hidden"
                      onChange={handleImageChange}
                    />
                  </label>

                  {image && (
                    <button
                      onClick={handleRemoveImage}
                      className="absolute top-0 right-0 bg-red-600 p-1 rounded-full"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Info */}
          <div className="text-center mb-4">
            <h3 className="text-xl font-semibold">{fullName}</h3>
            <p className="text-gray-400">{email}</p>
          </div>

          {/* Inputs */}
          <label className="block text-sm mb-1">Full Name</label>
          <input
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            disabled={!isEditing}
            className={`w-full p-2 rounded mb-4 ${
              isEditing ? "bg-white text-black" : "bg-gray-300 text-gray-700"
            }`}
          />

          <label className="block text-sm mb-1">Email</label>
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={!isEditing}
            className={`w-full p-2 rounded mb-6 ${
              isEditing ? "bg-white text-black" : "bg-gray-300 text-gray-700"
            }`}
          />

          {/* Buttons */}
          {!isEditing ? (
            <Button onClick={handleEdit} className="w-full">
              Edit Profile
            </Button>
          ) : (
            <div className="flex gap-3">
              <Button onClick={handleSave}>Save</Button>
              <Button onClick={handleCancel} variant="secondary">
                Cancel
              </Button>
            </div>
          )}

        </motion.div>
      </main>
    </motion.div>
  );
};

export default Profile;