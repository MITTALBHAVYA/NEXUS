// Register.jsx
import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { register } from '../../app/services/authSlice.js';
import { Link, useNavigate } from 'react-router-dom';
import PageLayout from '../layout/PageLayout.jsx';
import Navbar from '../layout/Navbar.jsx';
import { MdErrorOutline } from 'react-icons/md';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirm_password: '',
  });
  const [errors, setErrors] = useState({});
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isLoading, error } = useSelector((state) => state.auth);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name) newErrors.name = 'Username is required';
    if (!formData.email) newErrors.email = 'Email is required';
    if (!formData.password) newErrors.password = 'Password is required';
    if (formData.password !== formData.confirm_password) {
      newErrors.confirm_password = 'Passwords do not match';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (validateForm()) {
      const result = dispatch(register(formData)); // Use formData directly
      if (!isLoading) {
        if (!result.error) {
          navigate('/auth/login');
        }
      }
    }
  };

  return (
    <PageLayout>
      <Navbar variant="simple" />
      <div className="relative flex flex-row items-center justify-center mt-[4rem]">
        <div className="centered-container relative bg-gradient-to-br from-[#d63f0a] via-[#334155] to-[#aeaeae] w-[32rem] rounded-none md:w-[45rem] md:rounded-[10rem] p-8">
          <h1>SIGN UP</h1>
          <p>We suggest using the email address that you use at work</p>
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <input
                id="name"
                name="name"
                type="text"
                required
                placeholder="Username"
                value={formData.name}
                onChange={handleChange}
                className="w-full px-4 py-3 text-gray-800 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#FFB409]"
              />
              {errors.name && (
                <p className="text-red-500 text-xs mt-1">{errors.name}</p>
              )}
            </div>
            <div className="mb-6">
              <input
                id="email"
                name="email"
                type="email"
                required
                placeholder="Email address"
                value={formData.email}
                onChange={handleChange}
                className="w-full px-4 py-3 text-gray-800 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#FFB409]"
              />
              {errors.email && (
                <p className="text-red-500 text-xs mt-1">{errors.email}</p>
              )}
            </div>
            <div className="mb-6">
              <input
                id="password"
                name="password"
                type="password"
                required
                placeholder="Password"
                value={formData.password}
                onChange={handleChange}
                className="w-full px-4 py-3 text-gray-800 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#FFB409]"
              />
              {errors.password && (
                <p className="text-red-500 text-xs mt-1">{errors.password}</p>
              )}
            </div>
            <div className="mb-6">
              <input
                id="confirm_password"
                name="confirm_password"
                type="password"
                required
                placeholder="Confirm Password"
                value={formData.confirm_password}
                onChange={handleChange}
                className="w-full px-4 py-3 text-gray-800 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#FFB409]"
              />
              {errors.confirm_password && (
                <p className="text-red-500 text-xs mt-1">{errors.confirm_password}</p>
              )}
            </div>

            {/* Global error message */}
            {error && (
              <div className="flex items-center justify-center text-red-700 text-sm border border-red-300 bg-red-100 rounded-lg px-4 py-3 mt-3 shadow-md">
                <MdErrorOutline className="text-white bg-red-500 rounded-full p-1 mr-2" size={30} />
                <span className="font-bold">{error}</span>
              </div>
            )}

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-2 py-3 px-6 text-white font-bold rounded-full bg-gradient-to-r from-[#FFB409] to-[#FFA726] shadow-md hover:shadow-lg hover:scale-105 transition-transform"
              >
                <span>
                  {isLoading ? 'Creating account...' : 'Create account'}
                </span>
              </button>
            </div>
          </form>

          <div className="mt-4">
            <Link
              to="/auth/login"
              className="text-sm text-blue-500 hover:text-blue-700"
            >
              Already have an account? Log In
            </Link>
          </div>
        </div>
      </div>
    </PageLayout>
  );
};

export default Register;
