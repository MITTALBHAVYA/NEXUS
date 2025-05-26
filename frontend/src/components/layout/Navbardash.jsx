import { useState } from 'react';
import { motion } from 'framer-motion';
import UserButton from "../ui/UserButton.jsx";
import PropTypes from 'prop-types';

const Navbardash = ({ title = " " }) => {
  return (
    <nav className="bg-white/90 backdrop-blur-sm border-b border-gray-100">
      <div className="container mx-auto px-4 py-2">
        <div className="flex items-center justify-between">
          {/* Title Section */}
          <div className="flex items-center">
            <motion.h1 
              className="text-xl md:text-2xl font-bold text-[#0faab8]"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              {title}
            </motion.h1>
          </div>
          
          {/* User Button */}
          <div className="flex items-center">
            <UserButton />
          </div>
        </div>
      </div>
    </nav>
  );
};

Navbardash.propTypes = {
  title: PropTypes.string,
};

export default Navbardash;
