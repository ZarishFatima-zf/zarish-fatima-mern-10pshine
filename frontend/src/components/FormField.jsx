import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Eye, EyeOff } from 'lucide-react';


const FormField = ({
  label,
  name,
  type = 'text',
  placeholder,
  formik,
  className = '',
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const hasError = formik.touched[name] && formik.errors[name];

  const inputType = type === 'password' && showPassword ? 'text' : type;

  return (
    <motion.div
      className={`mb-4 ${className}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Label */}
      <label
        htmlFor={name}
        className="block text-sm font-medium text-gray-300 mb-3"
      >
        {label}
      </label>

      {/* Input Wrapper */}
      <div className="relative">
        <motion.input
          id={name}
          name={name}
          type={inputType}
          placeholder={placeholder}
          className={`w-full px-4 py-3 rounded-lg text-white placeholder-gray-400 bg-slate-800 border-2 transition-all duration-200 focus:outline-none
            ${hasError
              ? 'border-red-500 focus:border-red-400'
              : 'border-slate-600 focus:border-[#868532]'
            }`}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          value={formik.values[name]}
          whileFocus={{ scale: 1.01 }}
          transition={{ duration: 0.2 }}
        />

        {type === 'password' && (
          <button
            type="button"
            onClick={() => setShowPassword((prev) => !prev)}
            className="absolute inset-y-0 right-3 flex items-center text-gray-400 hover:text-gray-400"
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        )}
      </div>

      {hasError && (
        <motion.p
          className="mt-2 text-sm text-red-400"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
        >
          {formik.errors[name]}
        </motion.p>
      )}
    </motion.div>
  );
};

export default FormField;
