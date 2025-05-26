import { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Bell } from 'lucide-react';
import UserButton from "../ui/UserButton.jsx";
import PropTypes from 'prop-types';

const Navbardash2 = ({ title = "Dashboard" }) => {
    const [searchQuery, setSearchQuery] = useState('');

    return (
        <nav className="bg-white/90 backdrop-blur-sm border-b border-gray-100">
            <div className="container mx-auto px-4 py-2">
                <div className="flex items-center justify-between">
                    {/* Title and Search */}
                    <div className="flex items-center space-x-4">
                        <motion.h1 
                            className="text-xl font-bold bg-gradient-to-r from-[#0faab8] to-[#133044] bg-clip-text text-transparent"
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3 }}
                        >
                            {title}
                        </motion.h1>
                        
                        <div className="hidden md:block relative">
                            <div className="absolute inset-y-0 left-0 pl-2 flex items-center pointer-events-none">
                                <Search className="text-gray-400 w-4 h-4" />
                            </div>
                            <input 
                                type="text" 
                                placeholder="Search..." 
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-8 pr-3 py-1 w-56 text-sm rounded-md border border-gray-200 focus:ring-1 focus:ring-[#0faab8] focus:border-transparent transition-all"
                            />
                        </div>
                    </div>

                    {/* Right Side Items */}
                    <div className="flex items-center space-x-3">
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="relative hidden md:flex items-center justify-center w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
                        >
                            <Bell className="text-gray-600 w-4 h-4" />
                            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center text-[10px]">
                                3
                            </span>
                        </motion.button>
                        
                        <UserButton />
                    </div>
                </div>
                
                {/* Mobile Search - Shown only on mobile */}
                <div className="mt-2 md:hidden">
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-2 flex items-center pointer-events-none">
                            <Search className="text-gray-400 w-4 h-4" />
                        </div>
                        <input 
                            type="text" 
                            placeholder="Search..." 
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-8 pr-3 py-1 text-sm rounded-md border border-gray-200 focus:ring-1 focus:ring-[#0faab8] focus:border-transparent transition-all"
                        />
                    </div>
                </div>
            </div>
        </nav>
    );
};

Navbardash2.propTypes = {
    title: PropTypes.string,
};

export default Navbardash2;