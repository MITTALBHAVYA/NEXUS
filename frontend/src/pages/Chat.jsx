// import DashboardLayout from "../components/layout/DashboardLayout";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, } from "../components/chat/ChatComponents.jsx";
import { motion } from "framer-motion";
import LoadingAnimation from "../components/ui/animations/LoadingAnimation.jsx";
import UploadFileDialog from "../components/ui/UploadFileDialog.jsx";
import DBSelectDialog from "../components/ui/DBSelectDialog.jsx";
import AddDBConfig from "../components/ui/AddDBConfig.jsx";
import ChatInputSection from "../components/ui/ChatInputSection";
import normalizeData from "../utils/NormalizeData.js";
import Markdown from "markdown-to-jsx";
import hljs from "highlight.js/lib/core";
import javascript from "highlight.js/lib/languages/javascript"
import markdown from "highlight.js/lib/languages/markdown";
import BarChartComponent from "../components/ui/charts/BarChartComponent.jsx";
import PieChartComponent from "../components/ui/charts/PieChartComponent.jsx";
import AreaChartComponent from "../components/ui/charts/AreaChartComponent.jsx";
import LineChartComponent from "../components/ui/charts/LineChartComponent.jsx";
import RadarChartComponent from "../components/ui/charts/RadarChartComponent.jsx";
import { useParams } from "react-router-dom";
import { useCallback, useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getChart } from "../app/services/chartSlice.js";
import { getSuggestions } from "../app/services/suggestionSlice.js";
import { getChatHistory } from "../app/services/chatSlice.js";
import { postQueryv1, postQuery, postQueryv2 } from "../app/services/querySlice.js";

const Chat = () => {
  const params = useParams();
  const dispatch = useDispatch();
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [showDBSelectDialog, setShowDBSelectDialog] = useState(false);
  const [selectedModel, setSelectedModel] = useState("Default");
  const [selectedDB, setSelectedDB] = useState("");
  const [showAddDBConfig, setShowAddDBConfig] = useState(false);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [chatType, setChatType] = useState("");
  const [isSuggestionsLoading, setIsSuggestionsLoading] = useState(true);
  const [isSuggestionLoading, setIsSuggestionLoading] = useState(false);
  const [chats, setChats] = useState([]);
  const chatContainerRef = useRef(null);
  const { token } = useSelector((state) => state.auth);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { suggestions } = useSelector((state) => state.suggestion);
  const { divResponse } = useSelector((state) => state.query);
  const chatLength = chats.length;
  const lastQuery = chats.length > 0 ? chats[chats.length - 1].content : null;
  hljs.registerLanguage("javascript", javascript);
  hljs.registerLanguage("markdown", markdown);

  console.log("page loding chats here : ",chats);
  
  const toggleUploadDialog = () => {
    setShowUploadDialog(!showUploadDialog);
  };
  const handleDBClick = (dbType) => {
    setSelectedDB(dbType);
    setShowDBSelectDialog(false);
    setShowAddDBConfig(true);
  };
  const openDBSelectDialog = () => {
    setShowDBSelectDialog(true);
  };
  const closeAddDBConfig = () => {
    setShowAddDBConfig(false);
  };
  const handleChange = (e) => {
    setInput(e.target.value);
  };
  const trim = (str) => {
    return str.toString().replace(/^\s+|\s+$/g, "");
  };
  const checkChart = (data) => {
    if (data.chart_uuid !== undefined) {
      return { isTrue: true, chart_uuid: data.chart_uuid };
    } else {
      return { isTrue: false, chart_uuid: "" };
    }
  };


  const getChartData = async (chart_uuid) => {
    setIsLoading(true);

    try {
      const chat = await dispatch(getChart({ token, chart_uuid })).unwrap();
      console.log("here the data i am getting from the chart getching ", chat);
      if (chat) {
        console.log("need the breakdown : 1 ",chat.caption,"2 ",chat.data,"3 ",chat.chart_type)
        const formattedChats = 
          {
            role: "assistant",
            content: chat.caption || "", 
            isChartPresent: !!chat.data,
            chartData: chat.data || [],
            chartUuid: chat.chart_uuid || "", 
            chartType: chat.chart_type || "", 
          };
        console.log("formattedChats : ", formattedChats);
        setChats((prevChats) => [...prevChats, formattedChats]);
        setChatType(chatType);
      }
    } catch (error) {
      console.error("Error fetching chart data:", error.message || error);
    } finally {
      console.log("finally chats is : ", chats);
      setIsLoading(false);
    }
  };

  const fetchSuggestions = useCallback(async () => {
    const dataSourceId = new URLSearchParams(window.location.search).get("document_id");
    const query_type = new URLSearchParams(window.location.search).get("type");
    const dataSourceIdAsInt = dataSourceId ? Number(dataSourceId) : null;
    const suggestionQuery = {
      is_first_request: chatLength === 0,
      data_source_id: dataSourceIdAsInt,
      query_type: query_type,
      last_ques: lastQuery,
    };

    try {
      const suggestions = await dispatch(getSuggestions({ token, suggestionQuery })).unwrap();
      console.log("Suggestions received:", suggestions);
    } catch (error) {
      console.error("Error fetching suggestions:", error.message || error);
    } finally {
      setIsSuggestionsLoading(false);
    }
  }, [chatLength, dispatch, lastQuery, token]);



  const handleSuggestClick = async (suggestion) => {
    if (isLoading || isSuggestionLoading) return;

    try {
      setInput(suggestion);
      setIsSuggestionLoading(true);
      setChats((prevChats) => [...prevChats, { role: "user", content: suggestion }]);

      const urlParams = new URLSearchParams(window.location.search);
      const dataSourceId = urlParams.get("document_id");
      const dataSourceIdAsInt = dataSourceId ? Number(dataSourceId) : null;
      const query_type = urlParams.get("type") || urlParams.get("fileType") || "chat";

      const requiredData = {
        query: suggestion,
        chat_uuid: params.chat_uuid,
        data_source_id: dataSourceIdAsInt,
        model: selectedModel === "Default"
          ? "gpt-4o"
          : selectedModel.toLowerCase().replace(" ", "-"),
      };

      let queryResult;
      switch (query_type) {
        case "chat":
          queryResult = await dispatch(postQuery({ token, requiredData })).unwrap();
          break;
        case "csv":
          queryResult = await dispatch(postQueryv2({ token, requiredData })).unwrap();
          break;
        default:
          queryResult = await dispatch(postQueryv1({ token, query_type, requiredData })).unwrap();
      }
      console.log("queryResult is : ", queryResult);
      const chart_uuid = queryResult?.response?.chart_uuid;

      if (chart_uuid) {
        console.log("chart uuid :", chart_uuid);
        await getChartData(chart_uuid);
      } else {
        setChats((prevChats) => [
          ...prevChats,
          {
            role: "assistant",
            content: queryResult.response || "I couldn't generate a response.",
            isChartPresent: false
          },
        ]);
      }
      await fetchSuggestions();
    } catch (error) {
      console.error("Error handling suggestion:", error);
      setChats((prevChats) => [
        ...prevChats,
        {
          role: "assistant",
          content: "Sorry, I encountered an error processing your request.",
          isChartPresent: false
        },
      ]);
    } finally {
      setIsSuggestionLoading(false);
      setInput("");
    }
  };

  const fetchChats = useCallback(async () => {
    try {
      fetchSuggestions();
      const data = await dispatch(getChatHistory({ token, chat_uuid: params.chat_uuid })).unwrap();
      if (data?.history?.messages) {
        console.log("here is the data from fetch chats : ",data.history.messages);
        const formattedChats = data.history.messages.map((chat) => {
          let chartData = [];

          if (chat?.chart_data) {
            if (chat.extra.chart_type === "pie") {
              const total = chat.extra.chart_data.reduce((sum, item) => sum + item.value, 0);
              chartData = chat.extra.chart_data.map((item) => ({
                ...item,
                value: total > 0 ? (item.value / total) * 100 : 0,
              }));
            } else {
              chartData = chat.extra.chart_data;
            }
          }

          return {
            role: chat.role,
            content: chat.content,
            isChartPresent: !!chat.extra?.chart_data,
            chartData,
            chartUuid: chat.extra?.chart_uuid || "",
            chartType: chat.extra?.chart_type || "",
          };
        });

        setChats(formattedChats);
        setChatType(data.history.query_type);
      }
    } catch (error) {
      console.error("Error fetching chats:", error);
      setChats([]);
    }
  }, [fetchSuggestions, dispatch, token, params.chat_uuid]);


  const handleSend = async () => {
    console.log("handleSend called");
    const queryInput = input;
    console.log("using input from the state in content ,", input);
    if (!queryInput.trim()) return;
    setChats((prevChats) => [...prevChats, { role: "user", content: input }]);
    setInput("");
    setIsLoading(true);
    const response = await dispatch(postQuery({ token, requiredData: { query: queryInput, chat_uuid: params.chat_uuid } })).unwrap();
    console.log("here i am getting the response from the dispatch going to use in content", response);
    setIsLoading(false);
    setChats((prevChats) => [
      ...prevChats,
      { role: "user", content: input },
      { role: "assistant", content: response.response },
    ]);
    fetchChats();
  };

  const handleSendCSV = async () => {
    console.log("handleSendCSV called");
    const queryInput = input;
    console.log("using input from the state in content ,", input);
    if (!queryInput.trim()) return;
    setChats((prevChats) => [...prevChats, { role: "user", content: input }]);
    setInput("");
    setIsLoading(true);
    const requiredData = {
      query: queryInput,
      data_source_id: new URLSearchParams(window.location.search).get("document_id"),
      model:
        selectedModel === "Default"
          ? "gpt-4o"
          : selectedModel.toLowerCase().replace(" ", "-"),
      chat_uuid: params.chat_uuid,
    };

    try {
      const response = await dispatch(postQueryv2({ token, requiredData })).unwrap();
      console.log("here i am getting the response from the dispatchQ2(csv) going to use in content", response);
      const chartCheck = checkChart(response.response);
      console.log("here i am getting the response from the dispatch chartcheck going to use in", chartCheck);
      if (chartCheck.isTrue) {
        await getChartData(chartCheck.chart_uuid);
      } else {
        setChats((prevChats) => [
          ...prevChats,
          {
            role: "assistant",
            content: response.response
          },
        ]);
      }
      // fetchChats();
    } catch (error) {
      console.error("Error:", error);
      setIsLoading(false);
    }
  };

  const handleSendExcel = async () => {
    console.log("handleSendExcel called");
    const queryInput = input;
    console.log("using input from the state in content ,", input);
    if (!queryInput.trim()) return;
    setChats((prevChats) => [...prevChats, { role: "user", content: queryInput }]);
    setInput("");
    setIsLoading(true);
    const requiredData = {
      query: queryInput,
      data_source_id: new URLSearchParams(window.location.search).get("document_id"),
      model:
        selectedModel === "Default"
          ? "gpt-4o"
          : selectedModel.toLowerCase().replace(" ", "-"),
      chat_uuid: params.chat_uuid,
    };

    try {
      const result = await dispatch(postQueryv1({ token, query_type: "excel", requiredData })).unwrap();
      console.log("here i am getting the response from the dispatchQ1 going to use in content", result);
      const chartCheck = checkChart(result.response);
      console.log("here i am getting the response from the dispatch chartcheck going to use in", chartCheck);
      if (chartCheck.isTrue) {
        await getChartData(chartCheck.chart_uuid);
      } else {
        setChats((prevChats) => [
          ...prevChats,
          {
            role: "assistant",
            content: result.response,
            isChartPresent: false,
          },
        ]);
      }
      fetchChats();
    } catch (error) {
      console.error("Error:", error);
      setIsLoading(false);
    }
  };


  const handleSendDB = async () => {
    console.log("handleSendDB called");
    const queryInput = input;
    console.log("using input from the state in content ,", input);
    if (!queryInput.trim()) return;
    setChats((prevChats) => [...prevChats, { role: "user", content: queryInput }]);
    setInput("");
    setIsLoading(true);
    const requiredData = {
      query: queryInput,
      data_source_id: new URLSearchParams(window.location.search).get("document_id"),
      model:
        selectedModel === "Default"
          ? "gpt-4o"
          : selectedModel.toLowerCase().replace(" ", "-"),
      chat_uuid: params.chat_uuid,
    };

    try {
      const response = await dispatch(postQueryv1({ token, query_type: "db", requiredData })).unwrap();
      console.log("here i am getting the response from the dispatchQ1 going to use in content", response);
      const chartCheck = await checkChart(response.response).unwrap();
      console.log("here i am getting the response from the dispatch chartcheck going to use in", chartCheck);
      if (chartCheck.isTrue) {
        await getChartData(chartCheck.chart_uuid);
      } else {
        console.log("divresponse use in content : ", divResponse);
        setChats((prevChats) => [
          ...prevChats,
          {
            role: "assistant",
            content: response.response,
          },
        ]);
      }
      fetchChats();
    } catch (error) {
      console.error("Error:", error);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop =
        chatContainerRef.current.scrollHeight;
    }
  }, [chats]);
  useEffect(() => {
    const chatTypeFromURL =
      new URLSearchParams(window.location.search).get("type") ||
      new URLSearchParams(window.location.search).get("fileType") ||
      "";
    setChatType(chatTypeFromURL);
    fetchChats();
  }, [fetchChats]);


  return (
    <>
      <div
        className={`h-[75%] w-full flex flex-col items-start justify-center p-4 ${showUploadDialog || showAddDBConfig || showDBSelectDialog ? "opacity-50" : "opacity-100"}`}
      >
        {chats.length === 0 ? (
          <div className="flex flex-col items-center justify-center w-full">
            <Card className="w-[630px] shadow-lg">
              <CardHeader>
                <CardTitle>
                  <div className="flex flex-row gap-4 p-1">
                    <img
                      alt="chat-icon"
                      src="/images/smartSuggestionIcon.png"
                      width={100}
                      height={100}
                      className="w-8 h-8"
                    />
                    <p className="w-full text-black">Smart Suggestions</p>
                  </div>
                </CardTitle>
                <CardDescription>Start Your Journey Here.</CardDescription>
              </CardHeader>
              <CardContent className="grid gap-4">
                <div className="overflow-scroll h-[200px] pb-4">
                  {isSuggestionsLoading ? (
                    <>
                      <div className="flex flex-col space-y-3">
                        <div className="h-4 w-[250px] animate-pulse rounded-md bg-[#997be9]" />
                        <div className="h-4 w-[200px] animate-pulse rounded-md bg-[#997be9]" />
                        <div className="h-4 w-[300px] animate-pulse rounded-md bg-[#997be9]" />
                      </div>
                    </>
                  ) : (
                    suggestions?.map((notification, index) => (
                      <div
                        key={index}
                        className="mb-4 grid grid-cols-[25px_1fr] items-start pb-4 last:mb-0 last:pb-0 bg-[#F9F9F9] p-4 rounded-md"
                      >
                        <span className="flex h-2 w-2 translate-y-1 rounded-full bg-[#082a3f]" />
                        <div className="space-y-1 cursor-pointer">
                          <p
                            className="text-sm font-medium leading-none pointer-cursor"
                            onClick={() => {
                              setInput(notification);
                              handleSuggestClick(notification);
                            }}
                          >
                            {notification}
                          </p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        ) : (
          <div
            ref={chatContainerRef}
            className="w-[98%] h-full relative overflow-x-hidden overflow-y-scroll"
          >
            {chats?.map((chat, index) => (
              <>
                {chat.role === "user" ? (
                  <div
                    key={index}
                    className="flex w-full h-fit p-5 flex-col justify-center items-end gap-2"
                  >
                    <div className="flex flex-wrap justify-end items-center relative gap-2 p-4 rounded-2xl bg-[#082a3f] text-white shadow-xl">
                      <p className="flex-grow-0 w-full flex-shrink-0 text-md text-left text-wrap">
                        {chat.content}
                      </p>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="flex w-[70%] rounded-xl h-fit p-16 flex-col justify-start items-start gap-2 my-10 relative">
                      <div className="w-full flex flex-row">
                        <div className="relative w-fit h-fit">
                          <svg
                            width={40}
                            height={40}
                            viewBox="0 0 40 40"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                            className="absolute z-[4]"
                            preserveAspectRatio="xMidYMid meet"
                          >
                            <circle cx={20} cy={20} r={20} fill="#082a3f" />
                          </svg>
                          <p className="absolute z-[6] left-[12px] top-[4px] text-[22px] text-left text-white">
                            N
                          </p>
                        </div>
                        <div>
                          {chat.isChartPresent ? (
                            <p style={{ paddingLeft: "50px" }}>
                              {trim(chat.content)}
                            </p>
                          ) : (
                            ""
                          )}
                          {chat.isChartPresent ? (
                            chat.chartType === "bar" ? (
                              <BarChartComponent
                                rawData={chat.chartData}
                                data={chat.chartData?.map((item) => {
                                  const keys = Object.keys(item).filter(
                                    (key) => key !== "label"
                                  );
                                  const newData = {
                                    label: item.label,
                                    data: item,
                                    additionalLabels: {},
                                  };
                                  keys.forEach((key, index) => {
                                    if (index < 2) {
                                      (newData.additionalLabels)[
                                        `label${index + 1}`
                                      ] = {
                                        name: key,
                                        value: item[key],
                                      };
                                    }
                                  });

                                  return newData;
                                })}
                              />
                            ) : chat.chartType === "pie" ? (
                              <PieChartComponent
                                rawData={chat.chartData}
                                data={normalizeData(chat.chartData).map(
                                  (item) => {
                                    const keys = Object.keys(item).filter(
                                      (key) => key !== "label"
                                    );
                                    const newData = {
                                      label: item.label,
                                      data: item,
                                      additionalLabels: {},
                                    };
                                    keys.forEach((key, index) => {
                                      if (index < 2) {
                                        newData.additionalLabels[
                                          `label${index + 1}`
                                        ] = {
                                          name: key,
                                          value: item[key],
                                        };
                                      }
                                    });
                                    return newData;
                                  }
                                )}
                              />
                            ) : chat.chartType === "area" ? (
                              <AreaChartComponent
                                rawData={chat.chartData}
                                data={chat.chartData?.map((item) => {
                                  const keys = Object.keys(item).filter(
                                    (key) => key !== "label"
                                  );
                                  const newData = {
                                    label: item.label,
                                    data: item,
                                    additionalLabels: {},
                                  };
                                  keys.forEach((key, index) => {
                                    if (index < 2) {
                                      (newData.additionalLabels)[
                                        `label${index + 1}`
                                      ] = {
                                        name: key,
                                        value: item[key],
                                      };
                                    }
                                  });

                                  return newData;
                                })}
                              />
                            ) : chat.chartType === "line" ? (
                              <LineChartComponent
                                rawData={chat.chartData}
                                data={chat.chartData?.map((item) => {
                                  const keys = Object.keys(item).filter(
                                    (key) => key !== "label"
                                  );
                                  const newData = {
                                    label: item.label,
                                    data: item,
                                    additionalLabels: {},
                                  };
                                  keys.forEach((key, index) => {
                                    if (index < 2) {
                                      (newData.additionalLabels)[
                                        `label${index + 1}`
                                      ] = {
                                        name: key,
                                        value: item[key],
                                      };
                                    }
                                  });

                                  return newData;
                                })}
                              />
                            ) : chat.chartType === "radar" ? (
                              <RadarChartComponent
                                rawData={chat.chartData}
                                data={chat.chartData?.map((item) => {
                                  const keys = Object.keys(item).filter(
                                    (key) => key !== "label"
                                  );
                                  const newData = {
                                    label: item.label,
                                    data: item,
                                    additionalLabels: {},
                                  };
                                  keys.forEach((key, index) => {
                                    if (index < 2) {
                                      (newData.additionalLabels)[
                                        `label${index + 1}`
                                      ] = {
                                        name: key,
                                        value: item[key],
                                      };
                                    }
                                  });

                                  return newData;
                                })}
                              />
                            ) : null
                          ) : (
                            <div className="text-md text-left text-black ml-[70px] chat-section answer">
                              <Markdown>{trim(chat.content)}</Markdown>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </>
            ))}
            {isSuggestionLoading && (
              <>
                <div
                  className={`relative w-[100px] h-[100px] left-[62px] mr-[55px] ${isLoading ? "flex" : "flex"
                    }`}
                >
                  <svg
                    width={40}
                    height={40}
                    viewBox="0 0 40 40"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="absolute z-[4]"
                    preserveAspectRatio="xMidYMid meet"
                  >
                    <circle cx={20} cy={20} r={20} fill="#082a3f" />
                  </svg>
                  <p className="absolute z-[6] left-[12px] top-[4px] text-[22px] text-left text-white">
                    N
                  </p>
                  <div className="relative bottom-0 right-[15px]">
                    <LoadingAnimation />
                  </div>
                </div>
              </>
            )}

            <div
              className={`relative w-[100px] h-[100px] left-[62px] mr-[55px] ${isLoading ? "flex" : "hidden"
                }`}
            >
              <svg
                width={40}
                height={40}
                viewBox="0 0 40 40"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="absolute z-[4]"
                preserveAspectRatio="xMidYMid meet"
              >
                <circle cx={20} cy={20} r={20} fill="#082a3f" />
              </svg>
              <p className="absolute z-[6] left-[12px] top-[4px] text-[22px] text-left text-white">
                N
              </p>
              <div className="relative bottom-0 right-[15px]">
                <LoadingAnimation />
              </div>
            </div>
          </div>
        )}
        {chats.length > 1 && (
          <>
            <h2 className="text-xl font-bold text-[#082a3f] mb-1 relative left-20 w-[90%] flex flex-row justify-between items-center">
              Explore More :
              <div className="flex flex-row gap-2">
                <motion.button
                  className="ml-4 bg-[#082a3f] text-white px-3 py-2 rounded-full text-sm flex items-center shadow-md hover:bg-[#6a46d4] transition duration-300"
                  onClick={() => fetchSuggestions()}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <img
                    src="/images/refresh_reverse_icon.png"
                    alt="Reload"
                    width={20}
                    height={20}
                    style={{ filter: "invert(100%)" }}
                  />
                </motion.button>
                <motion.button
                  className="ml-4 bg-[#082a3f] text-white px-3 py-2 rounded-full text-sm flex items-center shadow-md hover:bg-[#6a46d4] transition duration-300"
                  onClick={() => setIsCollapsed(!isCollapsed)}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <motion.svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    className="w-5 h-5"
                    animate={{ rotate: isCollapsed ? 180 : 0 }}
                    transition={{ duration: 0.5 }}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </motion.svg>
                </motion.button>
              </div>
            </h2>
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{
                height: isCollapsed ? 0 : "auto",
                opacity: isCollapsed ? 0 : 1,
              }}
              transition={{ duration: 0.5 }}
              className="overflow-hidden"
            >
              <div className="flex flex-wrap gap-2 relative w-[90%] left-20 pb-10 max-h-[150px] overflow-y-auto">
                {Array.isArray(suggestions) &&
                  suggestions.slice(0, 4).map((suggestion, index) => (
                    <motion.div
                      key={index}
                      className={`bg-[#082a3f] text-white p-4 rounded-lg cursor-pointer w-100 h-10 flex items-center justify-center text-center ${isLoading ? "opacity-50 cursor-not-allowed" : ""}`}
                      onClick={() => {
                        if (!isLoading) {
                          handleSuggestClick(suggestion);
                        }
                      }}
                      whileHover={{
                        scale: 1.02,
                        boxShadow: "0px 4px 15px rgba(0, 0, 0, 0.2)",
                      }}
                    >
                      {suggestion.length > 100
                        ? `${suggestion.substring(0, 100)}...`
                        : suggestion}
                    </motion.div>
                  ))}
              </div>
            </motion.div>
          </>
        )}
      </div>
      <div className="w-full h-fit flex flex-col items-center justify-center gap-2 bottom-0 relative">
        <ChatInputSection
          input={input}
          chatType={chatType}
          selectedModel={selectedModel}
          handleChange={handleChange}
          handleSend={handleSend}
          handleSendCSV={handleSendCSV}
          handleSendExcel={handleSendExcel}
          handleSendDB={handleSendDB}
          toggleUploadDialog={toggleUploadDialog}
          openDBSelectDialog={openDBSelectDialog}
          setSelectedModel={setSelectedModel}
        />
      </div>

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
              onClose={closeAddDBConfig}
            />
          </div>
        </div>
      )}
      {showDBSelectDialog && (
        <DBSelectDialog
          isOpen={showDBSelectDialog}
          onClose={() => setShowDBSelectDialog(false)}
          onDBClick={handleDBClick}
        />
      )}
    </>
  )
}

export default Chat;