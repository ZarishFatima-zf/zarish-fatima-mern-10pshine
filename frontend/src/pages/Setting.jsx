import React, { useState } from "react";
import { motion } from "framer-motion";
import Sidebar from "../components/Sidebar";
import { useNavigate } from "react-router-dom";
import { Formik, Form } from "formik";
import * as Yup from "yup";
import FormField from "../components/FormField"; 
import Button from "../components/Button";


const Settings = () => {
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);

  const validationSchema = Yup.object({
    oldPassword: Yup.string().required("Old password is required"),
  newPassword: Yup.string()
  .min(6, "Password must be at least 6 characters long")
  .matches(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{6,}$/,
    "Password must include uppercase, lowercase, and a number"
  )

  .required("New password is required"),
    confirmPassword: Yup.string()
      .oneOf([Yup.ref("newPassword"), null], "Passwords must match")
      .required("Confirm password is required"),
  });

  // ✅ Change Password Handler
  const handleChangePassword = async (values, { resetForm }) => {
    try {
      const response = await fetch("http://localhost:5000/api/auth/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: localStorage.getItem("userId"),
          oldPassword: values.oldPassword.trim(),
          newPassword: values.newPassword.trim(),
          confirmPassword: values.confirmPassword.trim(),
        }),
      });

      const data = await response.json();

      if (response.ok) {
        resetForm();
        localStorage.removeItem("userId");
        localStorage.removeItem("user");
        navigate("/login"); // 👈 Logout after password change
      } else {
        alert(data.message || "Something went wrong");
      }
    } catch (error) {
      alert("Server error. Try again later.");
    }
  };

  // ✅ Delete Account Handler
  const handleDelete = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/auth/delete-account", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: localStorage.getItem("userId") }),
      });

      await response.json();

      localStorage.removeItem("userId");
      localStorage.removeItem("user");
      navigate("/signup");
    } catch (error) {
    }
  };

  // ✅ Logout handler
  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("userId");
    navigate("/login");
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
      <main className="flex-1 mt-14 sm:mt-4 p-4 sm:p-6 md:p-8 lg:p-10 flex flex-col items-center">
        {/* Heading */}
        <div className="text-center mb-6 md:mb-10 lg:mb-12">
          <motion.h2
            className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-2 md:mb-3"
            initial={{ y: -10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6 }}
          >
    
              Settings
            </motion.h2>
          <p className="text-gray-400 text-sm sm:text-base lg:text-lg max-w-2xl mx-auto leading-relaxed">
              Manage your account password and delete account
            </p>
          </div>

          {/* Password Form */}
          <motion.div
                   className="bg-[#071124] w-full max-w-md sm:max-w-lg lg:max-w-2xl xl:max-w-3xl p-4 sm:p-6 lg:p-8 rounded-xl shadow-lg mx-auto"
                   initial={{ y: 10, opacity: 0 }}
                   animate={{ y: 0, opacity: 1 }}
                   transition={{ duration: 0.6, delay: 0.2 }}
          >
            <Formik
              initialValues={{ oldPassword: "", newPassword: "", confirmPassword: "" }}
              validationSchema={validationSchema}
              onSubmit={handleChangePassword}
            >
              {(formik) => (
                <Form>
                  <FormField
                    label="Old Password"
                    name="oldPassword"
                    type="password"
                    placeholder="Enter old password"
                    formik={formik}
                  />
                  <FormField
                    label="New Password"
                    name="newPassword"
                    type="password"
                    placeholder="Enter new password"
                    formik={formik}
                  />
                  <FormField
                    label="Confirm Password"
                    name="confirmPassword"
                    type="password"
                    placeholder="Re-enter new password"
                    formik={formik}
                  />

                  {/* Forgot Password
                  <div className="flex justify-end mb-6">
                    <motion.button
                      type="button"
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ duration: 0.5, delay: 0.4 }}
                      onClick={() => navigate("/forgot-password")}
                      className="text-gray-500 hover:text-gray-400 text-sm transition-colors"
                    >
                      Forgot your password?
                    </motion.button>
                  </div> */}

                  {/* Buttons */}
                 <div className="flex gap-4">
                        <Button type="submit" variant="primary">
                          Change Password
                        </Button>
                        <Button type="button" variant="danger" onClick={() => setShowModal(true)}>
                          Delete Account
                        </Button>
                      </div>                  
                </Form>
              )}
            </Formik>
          </motion.div>
        </main>

      {/* Delete Confirm Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <motion.div
            className="bg-[#071124] p-6 rounded-lg shadow-lg text-center w-80"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
          >
            <h3 className="text-lg font-semibold mb-4">Are you sure?</h3>
            <p className="text-gray-300 mb-6">
              This action will permanently delete your account.
            </p>
            <div className="flex gap-3 justify-center">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 bg-gray-500 rounded-md hover:bg-gray-600 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 bg-red-600 rounded-md hover:bg-red-700 transition"
              >
                Confirm
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </motion.div>
  );
};

export default Settings;
