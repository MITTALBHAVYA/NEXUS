import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { register } from '../../app/services/authSlice.js';
import { Link, useNavigate } from 'react-router-dom';
import PageLayout from '../layout/PageLayout.jsx';
import Navbar from '../layout/Navbar.jsx';
import { MdErrorOutline, MdOutlineMailOutline, MdLock, MdPerson } from 'react-icons/md';
import { FcGoogle } from 'react-icons/fc';

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
      try {
        await dispatch(register(formData)).unwrap();
        navigate('/auth/login');
      } catch (err) {
        console.error("Registration failed:", err);
      }
    }
  };

  const registerWithGoogle = () => {
    navigate("/auth/google");
  };

  return (
    <PageLayout>
      <Navbar variant="simple" />
      <div className="flex items-center justify-center min-h-[80vh] px-4">
        <div className="w-full max-w-md bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="bg-gradient-to-r from-indigo-600 to-blue-500 py-6 px-8">
            <h1 className="text-white text-2xl font-medium">Create Account</h1>
            <p className="text-blue-100 text-sm mt-1">Join Nexus to get started</p>
          </div>
          
          <div className="px-8 py-6">
            <button
              className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors mb-6"
              onClick={registerWithGoogle}
            >
              <FcGoogle size={20} />
              <span className="text-gray-700 font-medium">Sign up with Google</span>
            </button>
            
            <div className="flex items-center my-4">
              <div className="flex-grow h-px bg-gray-200"></div>
              <span className="px-3 text-gray-500 text-sm">or</span>
              <div className="flex-grow h-px bg-gray-200"></div>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <MdPerson className="text-gray-400" size={20} />
                </div>
                <input
                  id="name"
                  name="name"
                  type="text"
                  required
                  placeholder="Username"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                {errors.name && (
                  <p className="text-red-500 text-xs mt-1 ml-2">{errors.name}</p>
                )}
              </div>
              
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <MdOutlineMailOutline className="text-gray-400" size={20} />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  placeholder="Email address"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                {errors.email && (
                  <p className="text-red-500 text-xs mt-1 ml-2">{errors.email}</p>
                )}
              </div>
              
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <MdLock className="text-gray-400" size={20} />
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  placeholder="Password"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                {errors.password && (
                  <p className="text-red-500 text-xs mt-1 ml-2">{errors.password}</p>
                )}
              </div>
              
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <MdLock className="text-gray-400" size={20} />
                </div>
                <input
                  id="confirm_password"
                  name="confirm_password"
                  type="password"
                  required
                  placeholder="Confirm Password"
                  value={formData.confirm_password}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                {errors.confirm_password && (
                  <p className="text-red-500 text-xs mt-1 ml-2">{errors.confirm_password}</p>
                )}
              </div>
              
              {error && (
                <div className="flex items-center text-red-600 text-sm bg-red-50 rounded-lg px-4 py-3">
                  <MdErrorOutline className="flex-shrink-0 mr-2" size={18} />
                  <span>{error}</span>
                </div>
              )}
              
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 px-4 bg-gradient-to-r from-indigo-600 to-blue-500 text-white font-medium rounded-lg hover:from-indigo-700 hover:to-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all disabled:opacity-70"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Creating account...
                  </div>
                ) : (
                  "Create account"
                )}
              </button>
            </form>
            
            <div className="text-center mt-6">
              <p className="text-gray-600 text-sm">
                Already have an account?{" "}
                <Link to="/auth/login" className="text-blue-600 font-medium hover:text-blue-800">
                  Sign in
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </PageLayout>
  );
};

export default Register;