import { useEffect, useState } from "react";
import {
  downloadDataFile,
  deleteDataFile,
} from "../app/services/datafileSlice.js";
import { deleteDBconfig } from "../app/services/dbSlice.js";
import { getDatasource } from "../app/services/datasourceSlice.js";
import DatasourceLayout from "../components/layout/DatasourceLayout.jsx";
import UploadFileDialog from "../components/ui/UploadFileDialog.jsx";
import AddDBConfig from "../components/ui/AddDBConfig.jsx";
import DBSelectDialog from "../components/ui/DBSelectDialog.jsx";
import { useDispatch, useSelector } from "react-redux";

import {
  Table,
  TableBody,
  TableRow,
  TableCell,
  TableHead,
  Fade,
  Tooltip,
  IconButton,
} from "@mui/material";


// import DownloadIcon from "@mui/icons-material/Download";
// import DeleteIcon from "@mui/icons-material/Delete";
// import AddIcon from "@mui/icons-material/Add";
// import StorageIcon from "@mui/icons-material/Storage";
// import InsertDriveFileIcon from "@mui/icons-material/InsertDriveFile";
// import DescriptionIcon from "@mui/icons-material/Description";

import { Download as DownloadIcon } from "@mui/icons-material";
import { Delete as DeleteIcon } from "@mui/icons-material";
import { Add as AddIcon } from "@mui/icons-material";
import { Storage as StorageIcon } from "@mui/icons-material";
import { InsertDriveFile as InsertDriveFileIcon } from "@mui/icons-material";
import { Description as DescriptionIcon } from "@mui/icons-material";

const DatasourcePage = () => {
  const dispatch = useDispatch();
  const [downloadingDocId, setDownloadingDocId] = useState(null);
  const [deletingDocId, setDeletingDocId] = useState(null);
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [showAddDBConfig, setShowAddDBConfig] = useState(false);
  const [showDBSelectDialog, setShowDBSelectDialog] = useState(false);
  const [selectedDB, setSelectedDB] = useState("");

  const { token } = useSelector((state) => state.auth);
  const { user_docs, db_configs } = useSelector((state) => state.datasource);

  useEffect(() => {
    dispatch(getDatasource({ token }));
  }, [dispatch, token]);

  const downloadFile = ({
    document_id,
    file_type,
    docName,
    setDownloadingDocId,
  }) => {
    try {
      setDownloadingDocId(document_id);
      const blob = dispatch(
        downloadDataFile({ token, document_id, file_type })
      );
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = docName;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.log("Error downloading file : ", error);
    } finally {
      setDownloadingDocId(null);
    }
  };

  const deleteFile = ({ document_id, file_type, setDeletingDocId }) => {
    try {
      setDeletingDocId(document_id);
      dispatch(deleteDataFile({ token, document_id, file_type }));
    } catch (error) {
      console.log("Error deleting file : ", error);
    } finally {
      setDeletingDocId(null);
    }
  };

  const deleteDBConfig = ({ db_config_id, setDeletingDocId }) => {
    try {
      setDeletingDocId(db_config_id);
      dispatch(deleteDBconfig({ token, db_config_id }));
    } catch (error) {
      console.log("Error deleting DB config : ", error);
    } finally {
      setDeletingDocId(null);
    }
  };

  const toggleUploadDialog = () => {
    setShowUploadDialog(!showUploadDialog);
  };

  const closeAddDBConfig = () => {
    setShowAddDBConfig(false);
  };

  const handleDBClick = ({ file_type }) => {
    setSelectedDB(file_type);
    setShowDBSelectDialog(false);
    setShowAddDBConfig(true);
  };

  const openDBSelectDialog = () => {
    setShowDBSelectDialog(true);
  };

  return (
    <DatasourceLayout>
      <div className="flex flex-col space-y-8 px-6 py-8 w-full bg-gradient-to-b from-gray-50 to-gray-100 min-h-screen">
        {/* Header Section with Welcome Message */}
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-2 font-['Poppins',sans-serif]">
            Your Data Sources
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Connect databases or upload files to start analyzing your data with
            AI-powered insights.
          </p>
        </div>

        {/* Action Cards Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {/* File Upload Card */}
          <div className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden">
            <div className="p-6 flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mb-4">
                <InsertDriveFileIcon
                  fontSize="large"
                  className="text-blue-500"
                />
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">
                Upload Files
              </h3>
              <p className="text-gray-600 mb-4">
                Upload CSV, Excel, or other data files for analysis.
              </p>
              <button
                onClick={toggleUploadDialog}
                className="flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-300 shadow-sm"
              >
                <AddIcon className="mr-2" fontSize="small" />
                Add a File
              </button>
            </div>
          </div>

          {/* Database Connection Card */}
          <div className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden">
            <div className="p-6 flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mb-4">
                <StorageIcon fontSize="large" className="text-green-500" />
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">
                Connect Database
              </h3>
              <p className="text-gray-600 mb-4">
                Connect to your database for direct query and analysis.
              </p>
              <button
                onClick={openDBSelectDialog}
                className="flex items-center justify-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-300 shadow-sm"
              >
                <AddIcon className="mr-2" fontSize="small" />
                Add Database
              </button>
            </div>
          </div>
        </div>

        {/* Files and Databases Tables Section */}
        <div className="space-y-8 max-w-6xl mx-auto w-full">
          {/* Files Table */}
          <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100">
            <div className="px-6 py-4 border-b border-gray-100">
              <div className="flex items-center space-x-2">
                <DescriptionIcon className="text-blue-500" />
                <h2 className="text-xl font-semibold text-gray-800">
                  Your Files
                </h2>
              </div>
            </div>

            {user_docs.length > 0 ? (
              <div className="overflow-x-auto">
                <Table className="w-full">
                  <TableHead>
                    <TableRow>
                      <TableCell className="font-semibold text-gray-700 border-b">
                        No.
                      </TableCell>
                      <TableCell className="font-semibold text-gray-700 border-b">
                        File Name
                      </TableCell>
                      <TableCell className="font-semibold text-gray-700 border-b">
                        Created
                      </TableCell>
                      <TableCell
                        className="font-semibold text-gray-700 border-b"
                        align="center"
                      >
                        Actions
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {user_docs.map((doc, index) => (
                      <TableRow
                        key={doc.id}
                        className="hover:bg-gray-50 transition-colors duration-150"
                      >
                        <TableCell className="text-gray-600">
                          {index + 1}
                        </TableCell>
                        <TableCell>
                          <a
                            href={`/c/${doc.chat_uuid}?document_id=${doc.id}&type=${doc.document_type}`}
                            className="text-blue-600 hover:text-blue-800 font-medium block max-w-[200px] overflow-hidden text-ellipsis whitespace-nowrap"
                          >
                            {doc.document_name}
                          </a>
                        </TableCell>
                        <TableCell className="text-gray-600">
                          {new Date(doc.created_at).toLocaleDateString()} |{" "}
                          {new Date(doc.created_at).toLocaleTimeString()}
                        </TableCell>
                        <TableCell align="center">
                          <div className="flex justify-center space-x-2">
                            <Tooltip
                              title="Download"
                              arrow
                              TransitionComponent={Fade}
                              TransitionProps={{ timeout: 600 }}
                            >
                              <IconButton
                                size="small"
                                onClick={() =>
                                  downloadFile({
                                    document_id: doc.id,
                                    file_type: doc.document_type,
                                    docName: doc.document_name,
                                    setDownloadingDocId,
                                  })
                                }
                                disabled={downloadingDocId === doc.id}
                                className="text-blue-500 hover:text-blue-700"
                              >
                                {downloadingDocId === doc.id ? (
                                  <span className="inline-block w-5 h-5 border-2 border-t-blue-500 border-blue-200 rounded-full animate-spin"></span>
                                ) : (
                                  <DownloadIcon fontSize="small" />
                                )}
                              </IconButton>
                            </Tooltip>
                            <Tooltip
                              title="Delete"
                              arrow
                              TransitionComponent={Fade}
                              TransitionProps={{ timeout: 600 }}
                            >
                              <IconButton
                                size="small"
                                onClick={() =>
                                  deleteFile({
                                    document_id: doc.id,
                                    file_type: doc.document_type,
                                    setDeletingDocId,
                                  })
                                }
                                disabled={deletingDocId === doc.id}
                                className="text-red-500 hover:text-red-700"
                              >
                                {deletingDocId === doc.id ? (
                                  <span className="inline-block w-5 h-5 border-2 border-t-red-500 border-red-200 rounded-full animate-spin"></span>
                                ) : (
                                  <DeleteIcon fontSize="small" />
                                )}
                              </IconButton>
                            </Tooltip>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="p-8 text-center text-gray-500 bg-gray-50 bg-opacity-50">
                <DescriptionIcon
                  className="text-gray-400 mb-2"
                  style={{ fontSize: 48 }}
                />
                <p>No files uploaded yet. Add a file to get started.</p>
              </div>
            )}
          </div>

          {/* Databases Table */}
          <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100">
            <div className="px-6 py-4 border-b border-gray-100">
              <div className="flex items-center space-x-2">
                <StorageIcon className="text-green-500" />
                <h2 className="text-xl font-semibold text-gray-800">
                  Your Database Connections
                </h2>
              </div>
            </div>

            {db_configs.length > 0 ? (
              <div className="overflow-x-auto">
                <Table className="w-full">
                  <TableHead>
                    <TableRow>
                      <TableCell className="font-semibold text-gray-700 border-b">
                        No.
                      </TableCell>
                      <TableCell className="font-semibold text-gray-700 border-b">
                        DB Type
                      </TableCell>
                      <TableCell className="font-semibold text-gray-700 border-b">
                        Database Name
                      </TableCell>
                      <TableCell className="font-semibold text-gray-700 border-b">
                        Created
                      </TableCell>
                      <TableCell
                        className="font-semibold text-gray-700 border-b"
                        align="center"
                      >
                        Actions
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {db_configs.map((config, index) => (
                      <TableRow
                        key={config.id}
                        className="hover:bg-gray-50 transition-colors duration-150"
                      >
                        <TableCell className="text-gray-600">
                          {index + 1}
                        </TableCell>
                        <TableCell className="text-gray-600">
                          <span className="px-2 py-1 bg-green-50 text-green-700 rounded-full text-xs font-medium">
                            {config.db_type}
                          </span>
                        </TableCell>
                        <TableCell>
                          <a
                            href={`/c/${config?.chat_uuid}?document_id=${config?.id}&type=db`}
                            className="text-blue-600 hover:text-blue-800 font-medium block max-w-[200px] overflow-hidden text-ellipsis whitespace-nowrap"
                          >
                            {config.db_name}
                          </a>
                        </TableCell>
                        <TableCell className="text-gray-600">
                          {new Date(config.created_at).toLocaleDateString()} |{" "}
                          {new Date(config.created_at).toLocaleTimeString()}
                        </TableCell>
                        <TableCell align="center">
                          <div className="flex justify-center space-x-2">
                            <Tooltip
                              title="Delete"
                              arrow
                              TransitionComponent={Fade}
                              TransitionProps={{ timeout: 600 }}
                            >
                              <IconButton
                                size="small"
                                onClick={() =>
                                  deleteDBConfig({
                                    db_config_id: config.id,
                                    setDeletingDocId,
                                  })
                                }
                                disabled={deletingDocId === config.id}
                                className="text-red-500 hover:text-red-700"
                              >
                                {deletingDocId === config.id ? (
                                  <span className="inline-block w-5 h-5 border-2 border-t-red-500 border-red-200 rounded-full animate-spin"></span>
                                ) : (
                                  <DeleteIcon fontSize="small" />
                                )}
                              </IconButton>
                            </Tooltip>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="p-8 text-center text-gray-500 bg-gray-50 bg-opacity-50">
                <StorageIcon
                  className="text-gray-400 mb-2"
                  style={{ fontSize: 48 }}
                />
                <p>
                  No database connections set up yet. Add a database connection
                  to get started.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Modal Dialogs */}
        <UploadFileDialog
          isOpen={showUploadDialog}
          onClose={toggleUploadDialog}
        />

        {showAddDBConfig && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 w-full flex justify-center items-center z-[55]"
            onClick={() => setShowAddDBConfig(false)}
          >
            <div
              className="w-full max-w-md bg-white rounded-xl shadow-xl overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <AddDBConfig
                showDBConfig={showAddDBConfig}
                title={selectedDB}
                onClose={closeAddDBConfig}
              />
            </div>
          </div>
        )}

        <DBSelectDialog
          isOpen={showDBSelectDialog}
          onClose={() => setShowDBSelectDialog(false)}
          onDBClick={handleDBClick}
        />
      </div>
    </DatasourceLayout>
  );
};

export default DatasourcePage;
