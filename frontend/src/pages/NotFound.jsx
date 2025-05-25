import PageLayout from '../components/layout/PageLayout.jsx';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { HiOutlineEmojiSad } from 'react-icons/hi';

const NotFound = () => {
  return (
    <PageLayout>
      <div className="flex items-center justify-center h-screen bg-white">
        <div className="text-center max-w-md mx-auto px-4">
          {/* 404 Text with Animation */}
          <motion.div 
            className="mb-6"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-[6rem] font-bold tracking-tight bg-gradient-to-r from-[#0faab8] to-[#133044] bg-clip-text text-transparent">
              404
            </h1>
          </motion.div>

          {/* Icon */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="flex justify-center mb-8"
          >
            <HiOutlineEmojiSad className="text-gray-400 w-20 h-20" />
          </motion.div>

          {/* Error Message */}
          <motion.p 
            className="mb-8 text-xl text-gray-600"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            Oops! The page you're looking for doesn't exist.
          </motion.p>

          {/* Back to Home Button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <Link
              to="/"
              className="inline-block px-6 py-3 bg-gradient-to-r from-[#0faab8] to-[#133044] text-white text-sm font-medium rounded-md hover:shadow-lg transition-all"
            >
              Back to Home
            </Link>
          </motion.div>

          {/* Dynamic Dots Animation */}
          <div className="flex justify-center mt-12 space-x-2">
            {[...Array(5)].map((_, i) => (
              <motion.div
                key={i}
                className="w-2 h-2 rounded-full bg-[#0faab8]"
                initial={{ opacity: 0.3 }}
                animate={{ 
                  opacity: [0.3, 1, 0.3],
                  scale: [1, 1.2, 1]
                }}
                transition={{ 
                  duration: 1.5, 
                  repeat: Infinity, 
                  delay: i * 0.2,
                  ease: "easeInOut"
                }}
              />
            ))}
          </div>
        </div>
      </div>
    </PageLayout>
  );
};

export default NotFound;
