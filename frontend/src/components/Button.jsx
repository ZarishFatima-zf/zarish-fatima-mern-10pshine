import React from "react";
import { motion } from "framer-motion";

const Button = ({
  children,
  onClick,
  type = "button",
  variant = "primary", 
  className = "",
  disabled = false,
  ...props
}) => {
  // Variant styles
  const variants = {
    primary: "bg-[#868532] text-white hover:bg-[#6f6c29]",
    secondary: "bg-gray-500 text-white hover:bg-gray-600",
    danger: "border border-red-500 text-red-500 hover:bg-red-600 hover:text-white",
  };

  return (
    <motion.button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={` text-lg flex-1 py-2 rounded-md font-semibold transition ${variants[variant]} ${className}`}
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.97 }}
      {...props}
    >
      {children}
    </motion.button>
  );
};

export default Button;
