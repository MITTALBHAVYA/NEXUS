import UploadFile from "./UploadFile";
import { motion } from "framer-motion";
import { X } from "lucide-react";
import PropTypes from 'prop-types';

const UploadFileDialog = ({ isOpen, onClose }) => {
    if (!isOpen) return null;
    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 w-full flex justify-center items-center p-4 z-50"
            onClick={onClose}
        >
            <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="w-full max-w-md bg-white rounded-2xl shadow-xl"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="p-6">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-2xl font-bold text-[#082a3f] flex items-center">
                            <img
                                alt="upload-icon"
                                src="/images/uploadIcon.png"
                                width={24}
                                height={24}
                                className="mr-2"
                            />
                            Upload a File
                        </h2>
                        <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
                            <X size={24} />
                        </button>
                    </div>
                    <p className="text-gray-600 mb-6">
                        Select a CSV or Excel file to upload and analyze.
                    </p>
                    <UploadFile />
                </div>
            </motion.div>
        </motion.div>
    );
}

UploadFileDialog.propTypes = {
    isOpen: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
};

export default UploadFileDialog;
