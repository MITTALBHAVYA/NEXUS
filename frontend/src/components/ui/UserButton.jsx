import  { useState, useRef, useEffect } from 'react';
import { useDispatch, useSelector } from "react-redux";
import { logout } from "../../app/services/authSlice";
import { resetUserState } from "../../app/services/userSlice";
import { useNavigate } from "react-router-dom";
import { User, LogOut, Settings, HelpCircle } from 'lucide-react';

const UserButton = () => {
  const {  name, email } = useSelector((state) => state.user);
  const [isPopUp, setIsPopUp] = useState(false);
  const popupRef = useRef(null);
  const buttonRef = useRef(null);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // Handle click outside to close popup
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        popupRef.current && 
        !popupRef.current.contains(event.target) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target)
      ) {
        setIsPopUp(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleLogout = () => {
    dispatch(logout());
    dispatch(resetUserState());
    navigate("/");
  };

  const handlePopUp = () => {
    setIsPopUp(!isPopUp);
  };

  const getUserInitials = () => {
    if (name) {
      const initials = name.split(' ')
        .map(word => word[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
      return initials;
    }
    return '@';
  };

  return (
    <div className="relative">
      {/* User Button */}
      <button
        ref={buttonRef}
        className="w-10 h-10 bg-gradient-to-br from-[#0faab8] to-[#133044] text-white 
        border-2 border-white shadow-lg hover:shadow-xl transition-all duration-300 
        rounded-full flex items-center justify-center 
        transform hover:scale-105 active:scale-95 
        focus:outline-none focus:ring-2 focus:ring-cyan-300"
        onClick={handlePopUp}
        aria-label="User Profile"
      >
        <span className="font-bold text-sm">{getUserInitials()}</span>
      </button>

      {/* Popup */}
      {isPopUp && (
        <div 
          ref={popupRef}
          className="absolute top-14 right-0 w-72 bg-white 
          rounded-xl shadow-2xl border border-gray-200 
          transition-all duration-300 ease-in-out 
          animate-fade-in-down z-50"
        >
          {/* User Profile Header */}
          <div className="bg-gradient-to-r from-[#0faab8] to-[#133044] 
            text-white p-4 rounded-t-xl flex items-center space-x-4">
            <div className="w-12 h-12 bg-white/20 rounded-full 
              flex items-center justify-center text-xl font-bold">
              {getUserInitials()}
            </div>
            <div>
              <h3 className="text-lg font-semibold truncate max-w-[200px]">
                {name.toUpperCase() || "User"}
              </h3>
              <p className="text-6 opacity-75 truncate max-w-[200px]">
                {email || "N/A"}
              </p>
            </div>
          </div>

          {/* Popup Menu Items */}
          <div className="p-2">
            <button 
              onClick={() => navigate('/profile')}
              className="w-full flex items-center p-3 hover:bg-gray-100 
              rounded-lg transition-colors group"
            >
              <User className="mr-3 text-[#133044] group-hover:text-[#0faab8]" />
              <span className="text-[#133044]">Profile</span>
            </button>
            <button 
              onClick={() => navigate('/settings')}
              className="w-full flex items-center p-3 hover:bg-gray-100 
              rounded-lg transition-colors group"
            >
              <Settings className="mr-3 text-[#133044] group-hover:text-[#0faab8]" />
              <span className="text-[#133044]">Settings</span>
            </button>
            <button 
              onClick={() => navigate('/help')}
              className="w-full flex items-center p-3 hover:bg-gray-100 
              rounded-lg transition-colors group"
            >
              <HelpCircle className="mr-3 text-[#133044] group-hover:text-[#0faab8]" />
              <span className="text-[#133044]">Help</span>
            </button>

            {/* Logout Button */}
            <div className="border-t mt-2 pt-2">
              <button
                onClick={handleLogout}
                className="w-full bg-[#660000] text-white py-2 px-4 
                rounded-lg hover:bg-[#ff0800] transition-colors 
                flex items-center justify-center space-x-2"
              >
                <LogOut size={18} />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserButton;