import React from 'react';
import { motion } from 'framer-motion';

const Button = ({ 
  children, 
  onClick, 
  type = 'button',
  variant = 'primary',
  className = '',
  disabled = false,
  ...props 
}) => {
  const baseClasses = 'w-full py-4 px-6 rounded-lg font-medium text-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900';
  
  const variants = {
    primary: 'bg-[#868532] hover:bg-[#6f6c29] text-white focus:ring-[#868532] shadow-lg shadow-[#868532]/30',
    secondary: 'bg-slate-700 hover:bg-slate-600 text-white focus:ring-slate-500',
    danger: 'border-2 border-[#868532] text-[#868532] hover:bg-[#868532] hover:text-white focus:ring-[#868532]',
  };


  const buttonClasses = `${baseClasses} ${variants[variant]} ${className} ${
    disabled ? 'opacity-50 cursor-not-allowed' : ''
  }`;

  const buttonVariants = {
    hover: { 
      scale: 1.02,
      transition: { duration: 0.2, ease: "easeInOut" }
    },
    tap: { 
      scale: 0.98,
      transition: { duration: 0.1 }
    },
    initial: { scale: 1 }
  };

  return (
    <motion.button
      className={buttonClasses}
      onClick={onClick}
      type={type}
      disabled={disabled}
      variants={buttonVariants}
      initial="initial"
      whileHover={!disabled ? "hover" : "initial"}
      whileTap={!disabled ? "tap" : "initial"}
      {...props}
    >
      <motion.span
        initial={{ opacity: 0, y: 5 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.3 }}
      >
        {children}
      </motion.span>
    </motion.button>
  );
};

export default Button;