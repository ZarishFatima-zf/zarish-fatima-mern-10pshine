// import React from "react";
// import { useFormik } from "formik";
// import { useParams, useNavigate } from "react-router-dom";
// import Button from "../components/Button"; 
// const ForgetPassword = () => {
//   const { token } = useParams(); 
//   const navigate = useNavigate();

//   const formik = useFormik({
//     initialValues: token ? { password: "" } : { email: "" },
//     onSubmit: async (values, { setSubmitting, setStatus }) => {
//       try {
//         if (token) {
//           const res = await fetch(`http://localhost:5000/api/auth/reset-password/${token}`, {
//             method: "POST",
//             headers: { "Content-Type": "application/json" },
//             body: JSON.stringify(values),
//           });
//           const data = await res.json();
//           setStatus(data.message);

//           if (res.ok) {
//             setTimeout(() => navigate("/login"), 2000);
//           }
//         } else {
//           const res = await fetch("http://localhost:5000/api/auth/forgot-password", {
//             method: "POST",
//             headers: { "Content-Type": "application/json" },
//             body: JSON.stringify(values),
//           });
//           const data = await res.json();
//           setStatus(data.message);
//         }
//       } catch (err) {
//         console.error(err);
//         setStatus("Something went wrong");
//       } finally {
//         setSubmitting(false);
//       }
//     },
//   });

//   return (
//     <div className="flex items-center justify-center h-screen bg-[#0A162D] text-white">
//       <form
//         onSubmit={formik.handleSubmit}
//         className="bg-gray-800 p-6 rounded-xl space-y-4 w-96 shadow-lg"
//       >
//         <h2 className="text-xl font-bold">
//           {token ? "Reset Password" : "Forgot Password"}
//         </h2>

//         {token ? (
//           <input
//             type="password"
//             name="password"
//             placeholder="Enter new password"
//             onChange={formik.handleChange}
//             value={formik.values.password}
//             className="w-full p-2 rounded text-black"
//           />
//         ) : (
//           <input
//             type="email"
//             name="email"
//             placeholder="Enter your email"
//             onChange={formik.handleChange}
//             value={formik.values.email}
//             className="w-full p-2 rounded text-black"
//           />
//         )}

//       <Button
//     type="submit"
//     disabled={formik.isSubmitting}
//     variant="primary"
//     className="w-full py-2 text-lg"
//   >
//     {formik.isSubmitting
//       ? token
//         ? "Resetting..."
//         : "Sending..."
//       : token
//       ? "Reset Password"
//       : "Send Reset Link"}
//   </Button>

//         {formik.status && (
//           <p className="text-sm text-green-400 text-center">{formik.status}</p>
//         )}
//       </form>
//     </div>
//   );
// };

// export default ForgetPassword;
import React, { useState } from "react";
import { useFormik } from "formik";
import { useParams, useNavigate } from "react-router-dom";
import { Eye, EyeOff } from 'lucide-react';

import Button from "../components/Button";

const ForgetPassword = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);

  const formik = useFormik({
    initialValues: token ? { password: "" } : { email: "" },
    validate: (values) => {
      const errors = {};
      if (token) {
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{6,}$/;
        if (!values.password) {
          errors.password = "Password is required";
        } else if (!passwordRegex.test(values.password)) {
          errors.password =
            "Password must be at least 6 characters, include uppercase, lowercase, and a number";
        }
      } else {
        if (!values.email) {
          errors.email = "Email is required";
        } else if (!/\S+@\S+\.\S+/.test(values.email)) {
          errors.email = "Invalid email address";
        }
      }
      return errors;
    },

    onSubmit: async (values, { setSubmitting, setStatus }) => {
      try {
        if (token) {
          const res = await fetch(
            `http://localhost:5000/api/auth/reset-password/${token}`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(values),
            }
          );
          const data = await res.json();
          setStatus(data.message);
          if (res.ok) setTimeout(() => navigate("/login"), 2000);
        } else {
          const res = await fetch(
            "http://localhost:5000/api/auth/forgot-password",
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(values),
            }
          );
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
        <h2 className="text-xl font-bold text-center">
          {token ? "Reset Password" : "Forgot Password"}
        </h2>

        {token ? (
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              placeholder="Enter new password"
              onChange={formik.handleChange}
              value={formik.values.password}
              className="w-full p-2 rounded text-black"
            />
            <span
              className="absolute right-3 top-2 cursor-pointer text-gray-600"
              onClick={() => setShowPassword(!showPassword)}
            >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </span>
            {formik.errors.password && (
              <p className="text-red-400 text-sm">{formik.errors.password}</p>
            )}
          </div>
        ) : (
          <div>
            <input
              type="email"
              name="email"
              placeholder="Enter your email"
              onChange={formik.handleChange}
              value={formik.values.email}
              className="w-full p-2 rounded text-black"
            />
            {formik.errors.email && (
              <p className="text-red-400 text-sm">{formik.errors.email}</p>
            )}
          </div>
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