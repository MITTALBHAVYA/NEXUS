import  { useState } from 'react';
import { motion } from 'framer-motion';
import { Menu, X, Bell, Search } from 'lucide-react';
import UserButton from "../ui/UserButton.jsx";

const Navbardash = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen);
    };

    return (
        <nav className="relative bg-white shadow-sm">
            <div className="container mx-auto px-4 py-3">
                <div className="flex items-center justify-between">
                    {/* Mobile Menu Toggle */}
                    <div className="md:hidden">
                        <motion.button 
                            onClick={toggleMenu}
                            whileTap={{ scale: 0.9 }}
                            className="text-gray-600 focus:outline-none"
                        >
                            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
                        </motion.button>
                    </div>

                    {/* Page Title / Search */}
                    <div className="flex-grow md:flex-grow-0 md:w-1/2 flex items-center space-x-4">
                        <div className="hidden md:block relative flex-grow">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Search size={20} className="text-gray-400" />
                            </div>
                            <input 
                                type="text" 
                                placeholder="Search..." 
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                            />
                        </div>
                        <h1 className="text-xl md:text-2xl font-semibold text-gray-800 truncate">
                            Dashboard
                        </h1>
                    </div>

                    {/* Right Side Actions */}
                    <div className="flex items-center space-x-4">
                        {/* Notifications */}
                        <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            className="relative hidden md:block"
                        >
                            <Bell size={24} className="text-gray-600" />
                            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                                3
                            </span>
                        </motion.button>

                        {/* User Button */}
                        <UserButton />
                    </div>
                </div>

                {/* Mobile Search */}
                <div className="md:hidden mt-4">
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Search size={20} className="text-gray-400" />
                        </div>
                        <input 
                            type="text" 
                            placeholder="Search..." 
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                        />
                    </div>
                </div>

                {/* Mobile Menu */}
                {isMenuOpen && (
                    <motion.div 
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3 }}
                        className="md:hidden absolute left-0 right-0 top-full bg-white shadow-lg z-50"
                    >
                        <div className="px-4 pt-4 pb-6 space-y-4">
                            <div className="flex items-center space-x-4">
                                <Bell size={24} className="text-gray-600" />
                                <span>Notifications (3)</span>
                            </div>
                            {/* Add more mobile menu items as needed */}
                        </div>
                    </motion.div>
                )}
            </div>
        </nav>
    );
};

export default Navbardash;