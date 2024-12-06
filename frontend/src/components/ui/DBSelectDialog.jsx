import { motion } from "framer-motion";
import {X} from 'lucide-react';
import PropTypes from 'prop-types';

const DBSelectDialog = ({isOpen,onClose,onDBClick}) => {
  if(!isOpen)return null;
  return(
    <motion.div
      initial={{ display: 'none' }}
      animate={{ display: 'flex' }}
      exit={{ display: 'none' }}
      className="fixed inset-0 bg-black bg-opacity-50 w-full flex justify-center items-center p-4 z-[55]"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="w-full max-w-2xl bg-white rounded-2xl shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-[#082a3f] flex items-center">
              <img
                alt="database-icon"
                src="/images/database-connection.svg"
                width={28}
                height={28}
                className="mr-3"
              />
              Select Your Database
            </h2>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
              <X size={28} />
            </button>
          </div>
          <div className="flex justify-center gap-12">
            <button
              onClick={() => onDBClick("MySQL")}
              className="flex flex-row items-center px-3 py-5 bg-[#f0f0f0] rounded-lg hover:bg-[#e0e0e0] transition text-black"
            >
              <img
                alt="MySQL"
                src="/images/mysql-original.svg"
                width={35}
                height={35}
                className="mr-3"
              />
              <span className="text-lg">MySQL</span>
            </button>
            <button
              onClick={() => onDBClick("SQLite")}
              className="flex flex-row items-center px-3 py-5 bg-[#f0f0f0] rounded-lg hover:bg-[#e0e0e0] transition text-black"
            >
              <img
                alt="SQLite"
                src="/images/sqlite.svg"
                width={50}
                height={50}
                className="mr-3"
              />
              <span className="text-lg">SQLite</span>
            </button>
            <button
              onClick={() => onDBClick("PostgreSQL")}
              className="flex flex-row items-center px-3 py-6 pr-10 bg-[#f0f0f0] rounded-lg hover:bg-[#e0e0e0] transition text-black"
            >
              <img
                alt="PostgreSQL"
                src="/images/postgresql.svg"
                width={32}
                height={32}
                className="mr-3"
              />
              <span className="text-lg">PostgreSQL</span>
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}
DBSelectDialog.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onDBClick: PropTypes.func.isRequired,
};

export default DBSelectDialog;
