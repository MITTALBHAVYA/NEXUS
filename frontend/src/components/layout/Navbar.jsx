import { useState } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { FaChartBar, FaClipboardList } from 'react-icons/fa';
import { HiOutlineMenuAlt3, HiOutlineX } from 'react-icons/hi';

const Navbar = ({ variant = 'simple' }) => {
  const [menuOpen, setMenuOpen] = useState(false);

  const Logo = () => (
    <div className="nexuslogo text-white font-bold tracking-wider flex items-center">
      <Link to="/" className="text-shadow-md text-[3rem] lg:text-[3rem] flex items-center nexuslogolink">
        <img src="/images/Nexus_logo_white1.png" alt="Nexus Logo" className="logo-image w-[6rem] h-[6rem]" />
        NEXUS
      </Link>
    </div>
  );

  const DesktopNav = () => {
    switch (variant) {
      case 'simple':
        return null;
      case 'signin':
        return (
          <div className="hidden lg:flex flex-col items-center space-x-8">
            <span className="text-white font-bold tracking-wider" style={{ fontFamily: 'Quicksand, sans-serif', letterSpacing: '0.6px' }}>
              New to NEXUS?
            </span>
            <Link to="/auth/register" className="signuplink">Create an account</Link>
          </div>
        );
      case 'landing':
        return (
          <div className="hidden lg:flex items-center space-x-8">
            <Link to="/dashboard" className="flex items-center text-[#aa2701] hover:text-[#252e3d] text-[2rem] lg:text-[3rem]">
              <FaChartBar className="w-6 h-6 lg:w-8 lg:h-8 mr-3 lg:mr-4" />
              <span className="text-shadow-md text-lg lg:text-2xl">Dashboard</span>
            </Link>
            <Link to="/insights" className="flex items-center text-[#aa2701] hover:text-[#252e3d] text-[2rem] lg:text-[3rem]">
              <FaClipboardList className="w-6 h-6 lg:w-8 lg:h-8 mr-3 lg:mr-4" />
              <span className="text-shadow-md text-lg lg:text-2xl">Insights</span>
            </Link>
            <Link to="/auth/login" className="border-4 border-white text-white bg-[#252e3d] rounded-lg px-6 py-3 lg:px-8 lg:py-4 font-bold text-lg lg:text-2xl hover:bg-[#f15626] hover:text-white transition duration-300">
              SIGN IN
            </Link>
          </div>
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
            <Link
              to="/auth/register"
              className="text-white text-xl font-semibold py-4 px-8 rounded-md hover:bg-[#f15626] hover:text-white transition duration-300 transform hover:scale-105"
              onClick={() => setMenuOpen(false)}
            >
              Create an account
            </Link>
          );
        case 'landing':
          return (
            <>
              <Link
                to="/dashboard"
                className="text-white text-2xl font-semibold py-4 px-8 rounded-md hover:bg-[#f15626] hover:text-white transition duration-300 transform hover:scale-105"
                onClick={() => setMenuOpen(false)}
              >
                Dashboard
              </Link>
              <Link
                to="/insights"
                className="text-white text-2xl font-semibold py-4 px-8 rounded-md hover:bg-[#f15626] hover:text-white transition duration-300 transform hover:scale-105"
                onClick={() => setMenuOpen(false)}
              >
                Insights
              </Link>
              <Link
                to="/auth/login"
                className="text-white text-2xl font-semibold py-4 px-8 rounded-md hover:bg-[#f15626] hover:text-white transition duration-300 transform hover:scale-105"
                onClick={() => setMenuOpen(false)}
              >
                Sign In
              </Link>
            </>
          );
        default:
          return null;
      }
    };

    const menuContent = getMobileMenuContent();
    if (!menuContent) return null;

    return (
      <div className="absolute top-full left-0 right-0 bg-gradient-to-br from-[#000000cc] to-[#1f1f1fcc] backdrop-blur-md flex flex-col items-center py-8 space-y-6 rounded-b-lg shadow-lg lg:hidden transition-all duration-500 ease-in-out transform">
        {menuContent}
      </div>
    );
  };

  return (
    <nav className="relative top-0 left-0 right-0 z-30 bg-transparent px-8 py-5 flex items-center justify-between w-full">
      <Logo />
      <DesktopNav />
      {variant !== 'simple' && (
        <button
          className="lg:hidden text-white text-[3rem] lg:text-[4rem] hover:text-[#f15626] transition duration-300 transform hover:scale-110"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          {menuOpen ? <HiOutlineX /> : <HiOutlineMenuAlt3 />}
        </button>
      )}
      <MobileMenu />
    </nav>
  );
};

Navbar.propTypes = {
  variant: PropTypes.oneOf(['simple', 'signin', 'landing']),
};

export default Navbar;
