import { useEffect, useState } from "react";
import { downloadDataFile, deleteDataFile } from "../app/services/datafileSlice.js";
import { deleteDBconfig } from "../app/services/dbSlice.js";
import { getDatasource } from "../app/services/datasourceSlice.js";
import DatasourceLayout from "../components/layout/DatasourceLayout.jsx";
import UploadFileDialog from "../components/ui/UploadFileDialog.jsx";
import AddDBConfig from "../components/ui/AddDBConfig.jsx";
import DBSelectDialog from "../components/ui/DBSelectDialog.jsx";
import { useDispatch, useSelector } from "react-redux";
import { Table,TableBody,TableRow,TableCell,TableHead } from "@mui/material";

const DatasourcePage = () => {
    const dispatch = useDispatch();
    const [downloadingDocId, setDownloadingDocId] = useState(null);
    const [deletingDocId, setDeletingDocId] = useState(null);
    const [showUploadDialog, setShowUploadDialog] = useState(false);
    const [showAddDBConfig, setShowAddDBConfig] = useState(false);
    const [showDBSelectDialog, setShowDBSelectDialog] = useState(false);
    const [selectedDB, setSelectedDB] = useState("");

    const { token } = useSelector((state) => state.auth);
    const {user_docs,db_configs} = useSelector((state) => state.datasource);
    useEffect(()=>{
        dispatch(getDatasource({ token }));
    },[dispatch, token]);
    const downloadFile = ({ document_id, file_type, docName, setDownloadingDocId }) => {
        try {
            setDownloadingDocId(document_id);
            const blob = dispatch(downloadDataFile({ token, document_id, file_type }));
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = docName;
            document.body.appendChild(a);
            a.click();
            a.remove();
            window.URL.revokeObjectURL(url);
        }
        catch (error) {
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
    }

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
            <div className="flex flex-row">
      <div className="w-[35%] h-fit p-12 flex flex-col gap-4 items-center justify-center relative border border-[#aeaeae] bg-[#f2f2f2] rounded-md">
        <div className="relative h-[100px] flex justify-center items-center gap-2.5 px-[26px] rounded-[10px]">
          <svg
            width={7}
            height={87}
            viewBox="0 0 87 87"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="w-[87px] h-[87px]"
            preserveAspectRatio="none"
          >
            <circle cx="43.5" cy="43.5" r="43.5" fill="#E1E1E1" />
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M44.2556 45.8787H46.6108C47.1689 45.8787 47.6318 45.425 47.6318 44.8612C47.6318 44.2838 47.1689 43.83 46.6108 43.83H44.2556V41.4513C44.2556 40.8875 43.8063 40.4338 43.2481 40.4338C42.69 40.4338 42.2271 40.8875 42.2271 41.4513V43.83H39.8855C39.3274 43.83 38.8645 44.2838 38.8645 44.8612C38.8645 45.425 39.3274 45.8787 39.8855 45.8787H42.2271V48.2575C42.2271 48.8213 42.69 49.275 43.2481 49.275C43.8063 49.275 44.2556 48.8213 44.2556 48.2575V45.8787ZM53.5898 39.4102C53.9098 39.4065 54.2583 39.4025 54.5749 39.4025C54.9152 39.4025 55.1875 39.6775 55.1875 40.0212V51.0763C55.1875 54.4862 52.4511 57.25 49.0613 57.25H38.2382C34.6986 57.25 31.8125 54.3487 31.8125 50.7738V35.9513C31.8125 32.5413 34.5625 29.75 37.9524 29.75H45.2222C45.5761 29.75 45.8484 30.0388 45.8484 30.3825V34.81C45.8484 37.3263 47.9041 39.3888 50.3954 39.4025C50.9773 39.4025 51.4904 39.4068 51.9393 39.4107C52.2886 39.4136 52.5991 39.4163 52.8731 39.4163C53.0669 39.4163 53.3181 39.4134 53.5898 39.4102ZM53.9637 37.4035C52.8447 37.4077 51.5255 37.4035 50.5766 37.3939C49.0709 37.3939 47.8307 36.1413 47.8307 34.6205V30.996C47.8307 30.4034 48.5427 30.1092 48.9498 30.5368C49.6867 31.3107 50.6996 32.3747 51.7077 33.4337C52.7127 34.4894 53.713 35.5402 54.4307 36.2939C54.8282 36.7105 54.5369 37.4022 53.9637 37.4035Z"
              fill="#082a3f"
            />
          </svg>
        </div>
        <div className="w-full flex justify-center">
          <div
            className="cursor-pointer flex justify-center items-center gap-2.5 px-[26px] py-[13px] rounded-[10px] bg-[#082a3f]"
            onClick={toggleUploadDialog}
          >
            <p className="flex-grow-0 flex-shrink-0 text-base text-left text-white">
              Add A File
            </p>
          </div>
        </div>
        <div className="w-full flex justify-center">
          <div
            className="cursor-pointer flex justify-center items-center gap-2.5 px-[26px] py-[13px] rounded-[10px] bg-[#082a3f]"
            onClick={openDBSelectDialog}
          >
            <p className="flex-grow-0 flex-shrink-0 text-base text-left text-white">
              Add Database Connection
            </p>
          </div>
        </div>
      
      </div>
      <div className="w-[60%] flex items-center justify-center relative right-[0px] bg-[#F6F6FB] mt-1">
        <img
          src="/images/SaasBanner2.png"
          alt="saas_banner"
          width={1400}
          height={100}
        />
      </div>
      </div>
      <div className="w-[101%] right-5 px-10 py-10 flex flex-row gap-10 items-start justify-center relative bg-[#F6F6FB]">
        <div className="w-full">
          <div className="bg-white w-full shadow-lg rounded-2xl p-6">
            <h2 className="text-xl font-bold mb-4">CSV/Excel</h2>
            {user_docs.length > 0 ? (
              <div className="overflow-x-auto">
                <Table className="bg-white rounded-2xl w-full">
                  <TableHead className="bg-gray-200">
                    <TableRow>
                      <th className="p-4">No.</th>
                      <th className="p-4">File Name</th>
                      <th className="p-4">Created</th>
                      <th className="p-4 cursor-pointer">Download</th>
                      <th className="p-4 text-right">Delete</th>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {user_docs.map((doc, index) => (
                      <TableRow
                        key={doc.id}
                        className={`${
                          index % 2 === 0 ? "bg-gray-100" : "bg-white"
                        } hover:bg-gray-200`}
                      >
                        <TableCell className="p-4">{index + 1}</TableCell>
                        <TableCell className="p-4 text-[#082a3f] underline">
                          <a
                            href={`/c/${doc.chat_uuid}?document_id=${doc.id}&type=${doc.document_type}`}
                            className="block max-w-[200px] overflow-hidden text-ellipsis whitespace-nowrap"
                          >
                            {doc.document_name}
                          </a>
                        </TableCell>
                        <TableCell className="p-4">
                          {new Date(doc.created_at).toLocaleDateString()} |{" "}
                          {new Date(doc.created_at).toLocaleTimeString()}
                        </TableCell>
                        <TableCell
                          className="p-4 cursor-pointer"
                          onClick={() =>
                            downloadFile(
                              doc.id,
                              doc.document_type,
                              doc.document_name,
                              setDownloadingDocId,
                            )
                          }
                        >
                          {downloadingDocId === doc.id ? (
                            <span>Downloading...</span>
                          ) : (
                            <img
                              alt="chatIcon"
                              src="/images/downloadIcon.png"
                              width={20}
                              height={20}
                            />
                          )}
                        </TableCell>
                        <TableCell
                          className="p-4 cursor-pointer text-right"
                          onClick={() =>
                            deleteFile(
                              doc.id,
                              doc.document_type,
                              setDeletingDocId,
                            )
                          }
                        >
                          {deletingDocId === doc.id ? (
                            <span>Deleting...</span>
                          ) : (
                            <img
                              alt="deleteIcon"
                              src="/images/deleteIcon.png"
                              width={20}
                              height={20}
                            />
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <p className="text-center text-gray-500">No Files</p>
            )}
          </div>
        </div>
        <div className="w-full">
          <div className="bg-white w-full shadow-lg rounded-2xl p-6">
            <h2 className="text-xl font-bold mb-4">Database</h2>
            {db_configs.length > 0 ? (
              <div className="overflow-x-auto">
                <Table className="bg-white rounded-2xl w-full">
                  <TableHead className="bg-gray-200">
                    <TableRow>
                      <th className="p-4">No.</th>
                      <th className="p-4">DB Type</th>
                      <th className="p-4">Database Name</th>
                      <th className="p-4">Created</th>
                      <th className="p-4 cursor-pointer">Download</th>
                      <th className="p-4 text-right">Delete</th>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {db_configs.map((config, index) => (
                      <TableRow
                        key={config.id}
                        className={`${
                          index % 2 === 0 ? "bg-gray-100" : "bg-white"
                        } hover:bg-gray-200`}
                      >
                        <TableCell className="p-4">{index + 1}</TableCell>
                        <TableCell className="p-4">{config.db_type}</TableCell>
                        <TableCell className="p-4 text-[#082a3f] underline">
                          <a
                            href={`/c/${config?.chat_uuid}?document_id=${config?.id}&type=db`}
                            className="block max-w-[200px] overflow-hidden text-ellipsis whitespace-nowrap"
                          >
                            {config.db_name}
                          </a>
                        </TableCell>
                        <TableCell className="p-4">
                          {new Date(config.created_at).toLocaleDateString()} |{" "}
                          {new Date(config.created_at).toLocaleTimeString()}
                        </TableCell>
                        <TableCell
                          className="p-4 cursor-pointer"
                          onClick={() =>
                            downloadFile(
                              config.id,
                              "db",
                              config.db_name,
                              setDownloadingDocId,
                            )
                          }
                        >
                          {downloadingDocId === config.id ? (
                            <span>Downloading...</span>
                          ) : (
                            <img
                              alt="chatIcon"
                              src="/images/downloadIcon.png"
                              width={20}
                              height={20}
                            />
                          )}
                        </TableCell>
                        <TableCell
                          className="p-4 cursor-pointer text-right"
                          onClick={() =>
                            deleteDBConfig(config.id,setDeletingDocId)
                          }
                        >
                          {deletingDocId === config.id ? (
                            <span>Deleting...</span>
                          ) : (
                            <img
                              alt="deleteIcon"
                              src="/images/deleteIcon.png"
                              width={20}
                              height={20}
                            />
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <p className="text-center text-gray-500">No Databases</p>
            )}
          </div>
        </div>
      </div>
      <UploadFileDialog isOpen={showUploadDialog} onClose={() => setShowUploadDialog(false)} />
      {showAddDBConfig && (
        <div
          className="fixed inset-0 pl-[20rem] bg-black bg-opacity-50 w-full flex justify-center items-centerz z-[55]"
          onClick={() => setShowAddDBConfig(false)}
        >
          <div
            className="w-[46%] h-[169px] bg-transparent rounded-[20px]"
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
        </DatasourceLayout>
    )
}

export default DatasourcePage
