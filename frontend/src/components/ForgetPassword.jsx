import React from "react";
import { useFormik } from "formik";
import { useParams, useNavigate } from "react-router-dom";

const PasswordPage = () => {
  const { token } = useParams(); // if exists → reset mode
  const navigate = useNavigate();

  const formik = useFormik({
    initialValues: token ? { password: "" } : { email: "" },
    onSubmit: async (values, { setSubmitting, setStatus }) => {
      try {
        if (token) {
          // 🔹 Reset Password
          const res = await fetch(`http://localhost:5000/api/auth/reset-password/${token}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(values),
          });
          const data = await res.json();
          setStatus(data.message);

          if (res.ok) {
            setTimeout(() => navigate("/login"), 2000);
          }
        } else {
          // 🔹 Forgot Password
          const res = await fetch("http://localhost:5000/api/auth/forgot-password", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(values),
          });
          const data = await res.json();
          setStatus(data.message);
        }
      } catch (err) {
        console.error(err);
        setStatus("Something went wrong");
      } finally {
        setSubmitting(false);
      }
    },
  });

  return (
    <div className="flex items-center justify-center h-screen bg-[#0A162D] text-white">
      <form
        onSubmit={formik.handleSubmit}
        className="bg-gray-800 p-6 rounded-xl space-y-4 w-96 shadow-lg"
      >
        {/* Heading */}
        <h2 className="text-xl font-bold">
          {token ? "Reset Password" : "Forgot Password"}
        </h2>

        {/* Input */}
        {token ? (
          <input
            type="password"
            name="password"
            placeholder="Enter new password"
            onChange={formik.handleChange}
            value={formik.values.password}
            className="w-full p-2 rounded text-black"
          />
        ) : (
          <input
            type="email"
            name="email"
            placeholder="Enter your email"
            onChange={formik.handleChange}
            value={formik.values.email}
            className="w-full p-2 rounded text-black"
          />
        )}

        {/* Button */}
        <button
          type="submit"
          disabled={formik.isSubmitting}
          className="bg-[#868532] hover:bg-[#6f6c29] p-2 rounded w-full"
        >
          {formik.isSubmitting
            ? token
              ? "Resetting..."
              : "Sending..."
            : token
            ? "Reset Password"
            : "Send Reset Link"}
        </button>

        {/* Status Message */}
        {formik.status && (
          <p className="text-sm text-green-400 text-center">{formik.status}</p>
        )}
      </form>
    </div>
  );
};

export default PasswordPage;
