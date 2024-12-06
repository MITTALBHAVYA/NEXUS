import { useState } from "react";
import { uploadDataFile } from "../../app/services/datafileSlice";
import { useDispatch, useSelector } from "react-redux";
import { motion } from 'framer-motion';
import { Upload, CheckCircle, AlertCircle } from 'lucide-react';
import { useNavigate } from "react-router-dom";

const UploadFile = () => {
  const [file, setFile] = useState();
  const [isLoading, setIsLoading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState("idle");
  const {  error } = useSelector((state) => state.datafile);
  const { token } = useSelector((state) => state.auth);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleFileChange = (event) => {

    if (event.target.files && event.target.files[0]) {
      setFile(event.target.files[0]);
    }
  };

const validateAndPrepareFile = (file, setIsLoading, setUploadStatus) => {
  if (!file) return false;
  
  setIsLoading(true);

  const file_type = file.name.split('.').pop()?.toLowerCase();
  if (!file_type) {
    console.error("Invalid file type.");
    setUploadStatus("error");
    return false;
  }

  console.log("file is ", file);
  const formData = new FormData();
  formData.append("file", new File([file], file.name, { type: "text/csv" }));  
  console.log("form data is: ", formData);

  return { formData, file_type };
};

const handleUpload = async () => {
  // Step 1: Validate file and prepare form data
  const preparationResult = validateAndPrepareFile(file, setIsLoading, setUploadStatus);
  if (!preparationResult) return; // Exit if validation fails

  const { formData, file_type } = preparationResult;

  // Step 2: Proceed with the upload process
  try {
    const data = await dispatch(uploadDataFile({ token, formData, file_type })).unwrap();

    if (data.chat_uuid && data.document_id && data.document_type) {
      setUploadStatus("success");
      setTimeout(() => {
        navigate(
          `/c/${data.chat_uuid}?document_id=${data.document_id}&type=${data.document_type}&token=${token}`
        );
      }, 1500);
    } else {
      setUploadStatus("error");
      console.error("Navigation parameters are invalid.");
    }
  } catch (error) {
    setUploadStatus("error");
    setIsLoading(false);
    console.error("File upload failed:", error);
  }finally{
    setIsLoading(false);
  }
};


  return (
    <div className="w-full max-w-md mx-auto">
      <div className="mb-4">
        <input type="file"
          onChange={handleFileChange}
          accept=".csv,.xlsx,.xls"
          className="hidden"
          id="file-upload" />
        <label htmlFor="file-upload" className="cursor-pointer flex items-center justify-center px-4 py-2 bg-white text-[#082a3f] rounded-md border-2 border-[#082a3f] hover:bg-[#082a3f] hover:text-white transition-colors duration-300">
          <Upload className="mr-2" size={20} />
          {file ? file.name : "Choose a file"}
        </label>
      </div>
      <motion.div
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}>
        <button onClick={handleUpload}
          disabled={!file || isLoading}
          className="w-full bg-[#082a3f] hover:bg-[#112e42] text-white font-bold py-2 px-4 rounded-md transition-colors duration-300"
        >
          {isLoading ? "Uploading..." : "Upload File"}
        </button>
      </motion.div>
      {uploadStatus === "success" && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4 flex items-center text-green-500"
        >
          <CheckCircle className="mr-2" size={20} />
          Upload successful! Redirecting...
        </motion.div>
      )}
      {uploadStatus === "error" && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4 flex items-center text-red-500"
        >
          <AlertCircle className="mr-2" size={20} />
          {typeof error === "string" ? error : "An unknown error occurred."}
        </motion.div>
      )}
    </div>
  );
};

export default UploadFile;
