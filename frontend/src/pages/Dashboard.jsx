//Dashboard.jsx
// import DashboardLayout from "../components/layout/DashboardLayout";
import AutoChangingText from "../components/ui/animations/TextAnimation";
import LoadingPart from "../components/ui/animations/LoadingPart";
import AddDBConfig from "../components/ui/AddDBConfig.jsx";
import UploadFileDialog from "../components/ui/UploadFileDialog.jsx";
import DBSelectDialog from "../components/ui/DBSelectDialog.jsx";
import ChatInputSection from "../components/ui/ChatInputSection.jsx";
import { getLlmModels } from "../app/services/llmSlice.js";
// import { getSuggestions } from "../app/services/suggestionSlice.js";
import { postQuery } from "../app/services/querySlice.js";
import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

const Dashboard = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [showDialog, setShowDialog] = useState(false);
  const [showAddDBConfig, setShowAddDBConfig] = useState(false);
  const [selectedDB, setSelectedDB] = useState("");
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [selectedModel, setSelectedModel] = useState("Default");
  const [input, setInput] = useState("");
  const [showChats, setShowChats] = useState(false);
  const [chats, setChats] = useState([]);

  const { token } = useSelector((state) => state.auth);

  const raw = useMemo(() => ({
    query: input,
    data_source_id: 0,
    model: "gpt-4o",
  }), [input]);

  const randomThinker = [
    { phrase: "NEXUS Is Brewing Ideas" },
    { phrase: "NEXUS Is Analyzing Data" },
    { phrase: "NEXUS Is Generating Insights" },
    { phrase: "NEXUS Is Solving the Puzzle" },
    { phrase: "NEXUS Is Processing Information" },
    { phrase: "NEXUS Is Uncovering Patterns" },
    { phrase: "NEXUS Is Calculating Solutions" },
    { phrase: "NEXUS Is Formulating Answers" },
  ];

  useEffect(() => {
    dispatch(getLlmModels());
  }, [dispatch]);

  const toggleUploadDialog = () => {
    setShowUploadDialog(!showUploadDialog);
  };

  const handleChange = (e) => {
    setInput(e.target.value);
  };

  const toggleDialog = () => {
    setShowDialog(!showDialog);
  };

  const handleDBClick = (dbType) => {
    setShowDialog(false);
    setSelectedDB(dbType);
    setShowAddDBConfig(true);
  };

  const handleSend = () => {
    if (input.trim() === "") return;

    const randomNumber = Math.floor(Math.random() * 8);
    setInput("");
    setShowChats(true);
    setChats([
      ...chats,
      { role: "user", content: input },
      { role: "assistant", content: `${randomThinker[randomNumber].phrase}` },
    ]);

    dispatch(postQuery({ token, requiredData: raw }))
      .unwrap()
      .then((data) => {
        if (data?.chat_uuid) {
          console.log("navigate called");
          navigate(`/c/${data.chat_uuid}?token=${token}`);
        }
      })
      .catch((error) => {
        console.error("Query failed:", error);
      });
  };

  return (
    // <DashboardLayout>
    <>
      {showChats ? (
        <>
          <div className="h-[80%] w-full flex flex-col items-start justify-start px-28 py-4">
            <div className="w-[98%] h-full relative overflow-visible">
              {chats?.map((chat, index) => (
                <div key={index}>
                  {chat.role === "user" ? (
                    <div
                      className="flex w-full h-fit p-5 flex-col justify-center items-end gap-2"
                    >
                      <div className="flex justify-end items-center relative gap-2 p-3 rounded-2xl bg-[#f4f4f4]">
                        <p className="flex-grow-0 flex-shrink-0 text-md text-left text-black">
                          {chat.content}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="flex w-[60%] h-fit p-5 flex-col justify-start items-center gap-2 relative right-10 z-[55]">
                      <LoadingPart />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </>
      ) : (
        <AutoChangingText />
      )}
      <ChatInputSection
        input={input}
        chatType="chat"
        selectedModel={selectedModel}
        handleChange={handleChange}
        handleSend={handleSend}
        handleSendCSV={() => { }}
        handleSendExcel={() => { }}
        handleSendDB={() => { }}
        toggleUploadDialog={toggleUploadDialog}
        openDBSelectDialog={toggleDialog}
        setSelectedModel={setSelectedModel}
      />

      {showDialog && (
        <DBSelectDialog
          isOpen={showDialog}
          onClose={() => setShowDialog(false)}
          onDBClick={handleDBClick}
        />
      )}

      {showUploadDialog && (
        <UploadFileDialog
          isOpen={showUploadDialog}
          onClose={() => setShowUploadDialog(false)}
        />
      )}
      {showAddDBConfig && (
        <div
          className="fixed inset-0 pl-[20rem] bg-black bg-opacity-50 w-full flex justify-center items-center z-[65]"
          onClick={() => setShowAddDBConfig(false)}
        >
          <div
            className="w-[46%] h-[169px] bg-white rounded-[20px]"
            onClick={(e) => e.stopPropagation()}
          >
            <AddDBConfig
              showDBConfig={showAddDBConfig}
              title={selectedDB}
              onClose={() => setShowAddDBConfig(false)}
            />
          </div>
        </div>
      )}
    </>
    // </DashboardLayout>
  );
};

export default Dashboard;
