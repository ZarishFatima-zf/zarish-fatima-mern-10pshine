import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Camera, X } from "lucide-react";
import Sidebar from "../components/Sidebar";
import Button from "../components/Button"; 
import axios from "axios";
import { useNavigate } from "react-router-dom";

const Profile = () => {
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [backup, setBackup] = useState({ name: "", email: "", image: "" });
  const [userId, setUserId] = useState(null);
  const [image, setImage] = useState(null); 
  const [preview, setPreview] = useState(null);

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

  useEffect(() => {
    if (!userId) return;

    axios
      .get(`http://localhost:5000/api/auth/${userId}`)
      .then((res) => {
        setFullName(res.data.fullName);
        setEmail(res.data.email);
        setImage(res.data.image || null);
      })
      .catch((err) => console.error("Profile fetch error:", err.response?.data || err.message));
  }, [userId]);

  const handleEdit = () => {
    setBackup({ name: fullName, email, image });
    setIsEditing(true);
  };

  const handleCancel = () => {
    setFullName(backup.name);
    setEmail(backup.email);
    setImage(backup.image);
    setPreview(null);
    setIsEditing(false);
  };

  const handleSave = async () => {
    if (!fullName || !email) {
      alert("Full Name and Email cannot be empty!");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("fullName", fullName);
      formData.append("email", email);

      if (preview instanceof File) formData.append("image", preview);
      else if (preview === "remove") formData.append("removeImage", "true");

      const res = await axios.put(`http://localhost:5000/api/auth/${userId}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

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

  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate("/login");
  };

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

      {/* Main content */}
      <div className="flex-1 flex flex-col items-center justify-start p-4 sm:p-6 lg:p-8">
        <main className="w-full max-w-md sm:max-w-lg lg:max-w-2xl xl:max-w-3xl p-4 sm:p-6 lg:p-8">
          
          {/* Heading */}
          <div className="text-center mb-6 sm:mb-8 lg:mb-10 -mt-4">
            <motion.h2
              className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-1"
              initial={{ y: -10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.6 }}
            >
              Profile
            </motion.h2>
            <p className="text-gray-400 text-sm sm:text-base lg:text-lg max-w-2xl mx-auto leading-relaxed">
              Manage your account settings and preferences
            </p>
          </div>

          {/* Profile Card */}
          <motion.div
            className="bg-[#071124] p-6 sm:p-8 lg:p-8 rounded-xl shadow-lg"
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            {/* Avatar */}
            <div className="flex flex-col items-center mb-6 relative">
              <div className="relative w-24 h-24 sm:w-28 sm:h-28 lg:w-32 lg:h-32">
                <div className="w-full h-full rounded-full bg-[#868532] flex items-center justify-center overflow-hidden">
                  {image ? (
                    <img
                      src={image}
                      alt="avatar"
                      className="w-full h-full object-cover rounded-full"
                    />
                  ) : (
                    <span className="text-4xl lg:text-5xl font-bold">
                      {fullName ? fullName.charAt(0) : "?"}
                    </span>
                  )}
                </div>

                {/* Editing Options */}
                {isEditing && (
                  <>
                    <label className="absolute bottom-0 right-0 bg-[#868532] p-1 rounded-full cursor-pointer hover:bg-[#6f6c29] transition">
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
                        className="absolute top-0 right-0 bg-red-600 p-1 rounded-full hover:bg-red-800 transition"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </>
                )}
              </div>
            </div>

            {/* Name & Email */}
            <div className="text-center mt-2 mb-2">
              <h3 className="text-lg sm:text-xl font-semibold">{fullName || "Your Name"}</h3>
              <p className="text-gray-400 text-sm sm:text-base">{email || "your@email.com"}</p>
            </div>

            {/* Full Name */}
            <label className="block text-sm font-medium mb-1">Full Name</label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              disabled={!isEditing}
              className={`w-full p-2 lg:p-3 rounded-md mb-4 focus:outline-none ${
                isEditing ? "bg-white text-black" : "bg-gray-300 text-gray-700 cursor-not-allowed"
              }`}
            />

            {/* Email */}
            <label className="block text-sm font-medium mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={!isEditing}
              className={`w-full p-2 lg:p-3 rounded-md mb-6 focus:outline-none ${
                isEditing ? "bg-white text-black" : "bg-gray-300 text-gray-700 cursor-not-allowed"
              }`}
            />

            {/* Buttons */}
            {!isEditing ? (
  <Button onClick={handleEdit} variant="primary" className="w-full lg:py-3">
    Edit Profile
  </Button>
) : (
  <div className="flex gap-3">
    <Button onClick={handleSave} variant="primary" className="lg:py-3">
      Save
    </Button>
    <Button onClick={handleCancel} variant="secondary" className="lg:py-3">
      Cancel
    </Button>
  </div>
            )}
          </motion.div>
        </main>
      </div>
    </motion.div>
  );
};

export default Profile;
