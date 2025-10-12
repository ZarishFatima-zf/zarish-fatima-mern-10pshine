import React from "react";
import { useFormik } from "formik";
import { useParams, useNavigate } from "react-router-dom";
import Button from "../components/Button"; 
const ForgetPassword = () => {
  const { token } = useParams(); 
  const navigate = useNavigate();

  const formik = useFormik({
    initialValues: token ? { password: "" } : { email: "" },
    onSubmit: async (values, { setSubmitting, setStatus }) => {
      try {
        if (token) {
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
        <h2 className="text-xl font-bold">
          {token ? "Reset Password" : "Forgot Password"}
        </h2>

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

      <Button
    type="submit"
    disabled={formik.isSubmitting}
    variant="primary"
    className="w-full py-2 text-lg"
  >
    {formik.isSubmitting
      ? token
        ? "Resetting..."
        : "Sending..."
      : token
      ? "Reset Password"
      : "Send Reset Link"}
  </Button>

        {formik.status && (
          <p className="text-sm text-green-400 text-center">{formik.status}</p>
        )}
      </form>
    </div>
  );
};

export default ForgetPassword;