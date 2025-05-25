import { useState } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { FaChartBar, FaClipboardList } from 'react-icons/fa';
import { HiOutlineMenuAlt3, HiOutlineX } from 'react-icons/hi';
import { motion } from 'framer-motion';

const Navbar = ({ variant = 'simple' }) => {
  const [menuOpen, setMenuOpen] = useState(false);

  const Logo = () => (
    <motion.div 
      className="nexuslogo font-bold tracking-wider flex items-center"
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Link to="/" className="text-shadow-md text-[1.8rem] lg:text-[2.2rem] flex items-center nexuslogolink">
        <span className="bg-gradient-to-r from-[#0faab8] to-[#133044] bg-clip-text text-transparent font-bold">NEXUS</span>
      </Link>
    </motion.div>
  );

  const DesktopNav = () => {
    switch (variant) {
      case 'simple':
        return null;
      case 'signin':
        return (
          <motion.div 
            className="hidden lg:flex items-center"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Link 
              to="/auth/register" 
              className="bg-gradient-to-r from-[#0faab8] to-[#133044] text-white px-4 py-1.5 rounded-md text-sm font-medium hover:shadow-md transition-all"
            >
              Create an account
            </Link>
          </motion.div>
        );
      case 'landing':
        return (
          <motion.div 
            className="hidden lg:flex items-center space-x-4"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Link 
              to="/dashboard" 
              className="text-[#133044] hover:text-[#0faab8] transition-colors flex items-center"
            >
              <FaChartBar className="w-4 h-4 mr-1.5" />
              <span className="font-medium text-sm">Dashboard</span>
            </Link>
            <Link 
              to="/insights" 
              className="text-[#133044] hover:text-[#0faab8] transition-colors flex items-center"
            >
              <FaClipboardList className="w-4 h-4 mr-1.5" />
              <span className="font-medium text-sm">Insights</span>
            </Link>
            <Link 
              to="/auth/login" 
              className="bg-gradient-to-r from-[#0faab8] to-[#133044] text-white px-4 py-1.5 rounded-md text-sm font-medium hover:shadow-md transition-all"
            >
              Sign In
            </Link>
          </motion.div>
        );
      default:
        return null;
    }
  };

  const MobileMenu = () => {
    if (!menuOpen) return null;

    const getMobileMenuContent = () => {
      switch (variant) {
        case 'simple':
          return null;
        case 'signin':
          return (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Link
                to="/auth/register"
                className="text-[#133044] text-sm font-medium py-2 px-4 rounded-md bg-white hover:bg-gray-50 transition-colors w-full flex justify-center items-center border border-[#0faab8]"
                onClick={() => setMenuOpen(false)}
              >
                Create an account
              </Link>
            </motion.div>
          );
        case 'landing':
          return (
            <div className="flex flex-col space-y-3">
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.1 }}
              >
                <Link
                  to="/dashboard"
                  className="text-[#133044] text-sm font-medium py-2 px-4 rounded-md hover:bg-gray-100 transition-colors w-full flex items-center"
                  onClick={() => setMenuOpen(false)}
                >
                  <FaChartBar className="w-4 h-4 mr-2" />
                  Dashboard
                </Link>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.2 }}
              >
                <Link
                  to="/insights"
                  className="text-[#133044] text-sm font-medium py-2 px-4 rounded-md hover:bg-gray-100 transition-colors w-full flex items-center"
                  onClick={() => setMenuOpen(false)}
                >
                  <FaClipboardList className="w-4 h-4 mr-2" />
                  Insights
                </Link>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.3 }}
              >
                <Link
                  to="/auth/login"
                  className="bg-gradient-to-r from-[#0faab8] to-[#133044] text-white text-sm font-medium py-2 px-4 rounded-md transition-colors w-full flex justify-center"
                  onClick={() => setMenuOpen(false)}
                >
                  Sign In
                </Link>
              </motion.div>
            </div>
          );
        default:
          return null;
      }
    };

    const menuContent = getMobileMenuContent();
    if (!menuContent) return null;

    return (
      <motion.div
        initial={{ opacity: 0, height: 0 }}
        animate={{ opacity: 1, height: 'auto' }}
        exit={{ opacity: 0, height: 0 }}
        transition={{ duration: 0.3 }}
        className="absolute top-full left-0 right-0 bg-white flex flex-col items-center py-4 px-3 space-y-3 rounded-b-md shadow-md lg:hidden z-50"
      >
        {menuContent}
      </motion.div>
    );
  };

  return (
    <nav className="sticky top-0 left-0 right-0 z-30 bg-white/80 backdrop-blur-sm px-4 py-2 flex items-center justify-between w-full border-b border-gray-100">
      <Logo />
      <DesktopNav />
      {variant !== 'simple' && (
        <motion.button
          className="lg:hidden text-[#133044] text-xl hover:text-[#0faab8] transition-colors"
          onClick={() => setMenuOpen(!menuOpen)}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          {menuOpen ? <HiOutlineX /> : <HiOutlineMenuAlt3 />}
        </motion.button>
      )}
      <MobileMenu />
    </nav>
  );
};

Navbar.propTypes = {
  variant: PropTypes.oneOf(['simple', 'signin', 'landing']),
};

export default Navbar;
