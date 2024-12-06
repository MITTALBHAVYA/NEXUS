import { createDBconfig, testDBconfig } from "../../app/services/dbSlice";
import { motion } from "framer-motion";
import { X, Server, Lock } from "lucide-react";
import { useState } from "react";
import PropTypes from "prop-types";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

const AddDBConfig = ({ dbType, showDBConfig, onClose }) => {
  const [dbConfig, setDBConfig] = useState({
    hostname: "",
    port: "",
    username: "",
    password: "",
    dbname: "",
  });
  const [db_type, setDbType] = useState(dbType);
  const [isAddButtonEnabled, setIsAddButtonEnabled] = useState(false);
  const [testButtonColor, setTestButtonColor] = useState("newChat");
  const [testButtonMessage, setTestButtonMessage] = useState("Test Connection");

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { token } = useSelector((state) => state.auth);
  const { isLoading, error, chat_uuid, db_config_id, testStatus } = useSelector(
    (state) => state.db
  );

  const handleInputChange = (field) => (e) => {
    setDBConfig((prev) => ({
      ...prev,
      [field]: e.target.value,
    }));
  };

  const addDatabase = async () => {
    const requiredConfig = {
      db_type,
      dbConfig,
    };
    dispatch(createDBconfig({ token, requiredConfig }));

    if (!isLoading) {
      if (!error) {
        navigate(
          `/c/${chat_uuid}?document_id=${db_config_id}&type=db&token=${token}`
        );
      } else {
        console.error(error);
      }
    }
  };

  const testDatabaseConnection = async () => {
    const requiredConfig = {
      db_type,
      dbConfig,
    };
    dispatch(testDBconfig({ token, requiredConfig }));

    if (!isLoading) {
      if (!error) {
        if (testStatus === "success") {
          setIsAddButtonEnabled(true);
          setTestButtonColor("success");
          setTestButtonMessage("Connection Successful");
        } else {
          setTestButtonColor("error");
          setTestButtonMessage("Test Failed, Try Again");
          setTimeout(() => {
            setTestButtonMessage("Test Connection");
            setTestButtonColor("newChat");
          }, 3000);
        }
      } else {
        console.error("Error:", error);
        setTestButtonColor("error");
        setTestButtonMessage("Test Failed, Try Again");
        setTimeout(() => {
          setTestButtonMessage("Test Connection");
          setTestButtonColor("newChat");
        }, 3000);
      }
    }
  };

  if (!showDBConfig) return null;

  return (
    <motion.div
      initial={{ display: "none" }}
      animate={{ display: "flex" }}
      exit={{ display: "none" }}
      className="fixed inset-0 bg-black bg-opacity-50 w-full flex justify-center items-center p-4 z-[55]"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="w-full max-w-5xl bg-white rounded-2xl shadow-xl"
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
              Configure {dbType} Database
            </h2>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
              <X size={28} />
            </button>
          </div>

          <div className="space-y-8">
            {/* Server Section */}
            <div>
              <h3 className="text-lg font-semibold text-[#082a3f] mb-4 flex items-center">
                <Server className="mr-2" size={20} />
                Server
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Hostname
                  </label>
                  <input
                    value={dbConfig.hostname}
                    onChange={handleInputChange("hostname")}
                    placeholder="Enter hostname"
                    className="w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Port
                  </label>
                  <input
                    value={dbConfig.port}
                    onChange={handleInputChange("port")}
                    placeholder="Enter port"
                    className="w-full"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Database
                  </label>
                  <input
                    value={dbConfig.dbname}
                    onChange={handleInputChange("dbname")}
                    placeholder="Enter database name"
                    className="w-full"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    DB Type
                  </label>
                  <input
                    value={db_type}
                    onChange={(e) => setDbType(e.target.value)}
                    placeholder="Enter DB type"
                    className="w-full"
                    disabled
                  />
                </div>
              </div>
            </div>

            {/* Authentication Section */}
            <div>
              <h3 className="text-lg font-semibold text-[#082a3f] mb-4 flex items-center">
                <Lock className="mr-2" size={20} />
                Authentication
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Username
                  </label>
                  <input
                    value={dbConfig.username}
                    onChange={handleInputChange("username")}
                    placeholder="Enter username"
                    className="w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Password
                  </label>
                  <input
                    type="password"
                    value={dbConfig.password}
                    onChange={handleInputChange("password")}
                    placeholder="Enter password"
                    className="w-full"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 flex justify-between items-center">
            <button
              className={`px-8 flex flex-row items-center justify-center py-2 text-sm w-fit ${
                testButtonColor === "success"
                  ? "bg-green-500"
                  : testButtonColor === "error"
                  ? "bg-red-500"
                  : "bg-[#082a3f]"
              } text-white`}
              onClick={testDatabaseConnection}
            >
              {testButtonMessage}
            </button>
            <div className="flex space-x-4">
              <button
                className="px-4 py-2 bg-gray-300 text-black rounded"
                onClick={onClose}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 bg-blue-500 text-white rounded disabled:bg-gray-300"
                onClick={addDatabase}
                disabled={!isAddButtonEnabled}
              >
                Add Database
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

AddDBConfig.propTypes = {
  dbType: PropTypes.string.isRequired,
  showDBConfig: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
};

export default AddDBConfig;
