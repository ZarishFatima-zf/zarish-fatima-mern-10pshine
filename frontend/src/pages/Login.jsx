import React from 'react';
import { motion } from 'framer-motion';
import { useFormik } from 'formik';
import { useNavigate } from 'react-router-dom';
import Button from '../components/Button';
import FormField from '../components/FormField';

const Login = () => {
  const navigate = useNavigate();

  const validate = (values) => {
    const errors = {};
    if (!values.email) errors.email = 'Email is required';
    else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(values.email))
      errors.email = 'Invalid email address';
    if (!values.password) errors.password = 'Password is required';
    return errors;
  };

  const formik = useFormik({
    initialValues: { email: '', password: '' },
    validate,

  onSubmit: async (values, { setSubmitting, setErrors }) => {
    try {
      const res = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      const data = await res.json();

      if (!res.ok) {
        setErrors({ email: data.message });
      } else {
        localStorage.setItem("user", JSON.stringify(data.user));
       navigate("/dashboard");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  },
});



  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.15, delayChildren: 0.2 } },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { duration: 0.5, ease: 'easeOut' } },
  };

  return (
    <div className="fixed inset-0 overflow-hidden bg-[#0A162D] flex">
      <motion.div
        className="hidden lg:flex lg:w-1/2 items-center justify-center relative"
        initial={{ x: -150, opacity: 0, scale: 0.95 }}
        animate={{ x: 0, opacity: 1, scale: 1 }}
        transition={{ duration: 1, ease: 'easeOut' }}
      >
        <motion.img
          src="/src/images/notebook.png"
          alt="Notebook illustration"
          className="w-full h-full object-contain"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2 }}
        />
      </motion.div>

      <div className="flex-1 flex items-center justify-center p-8">
        <motion.div
          className="w-full max-w-md mx-auto"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.div variants={itemVariants} className="text-left mb-8">
            <motion.h1
              className="text-4xl font-bold text-white mb-3"
              initial={{ y: -30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.7 }}
            >
              Welcome To Notezy
            </motion.h1>
            <motion.p
              className="text-gray-400 mt-2"
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.7, delay: 0.2 }}
            >
              Keep your thoughts safe — Login to continue
            </motion.p>
          </motion.div>

          <motion.form onSubmit={formik.handleSubmit} variants={itemVariants} className="space-y-5">
            <FormField
              label="Email"
              name="email"
              type="email"
              placeholder="Enter your email address"
              formik={formik}
              className="focus-within:scale-105 transition-transform duration-200"
            />
            <FormField
              label="Password"
              name="password"
              type="password"
              placeholder="Enter your password"
              formik={formik}
              className="focus-within:scale-105 transition-transform duration-200"
            />
            <motion.div className="mt-6" variants={itemVariants}>
              <Button
                type="submit"
                disabled={formik.isSubmitting}
                variant="primary"
                className="bg-[#868532] hover:bg-[#6f6c29] text-white text-lg"
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
              >
                {formik.isSubmitting ? 'Logging in...' : 'Login'}
              </Button>
            </motion.div>
          </motion.form>

          <motion.div className="mt-6 text-center space-y-4" variants={itemVariants}>
            <motion.p
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="text-gray-400"
            >
              Don&apos;t have an account?{' '}
              <button
                onClick={() => navigate('/signup')}
                className="text-[#868532] hover:text-[#6f6c29] font-medium transition-colors duration-200"
              >
                Create an account
              </button>
            </motion.p>
           <motion.button
            type="button"  
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            onClick={() => navigate('/forgot-password')}
            className="text-gray-500 hover:text-gray-400 text-sm transition-colors duration-200"
          > Forgot your password?
</motion.button>
     </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default Login;
