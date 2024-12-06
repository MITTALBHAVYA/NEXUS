import { useEffect, useState } from 'react';
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { getAllChatHistory } from "../../app/services/chatSlice";
import PropTypes from "prop-types";
import { FileText, Database, MessageCircle, Search, X } from "lucide-react";

const RenderChatList = ({ type }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { token } = useSelector((state) => state.auth);
  const { allhistory} = useSelector((state) => state.chat);
  
  // State for filtering
  const [searchTerm, setSearchTerm] = useState('');

  // Fetch chat allhistory once if not already loaded
  useEffect(() => {
    if (token) {
      dispatch(getAllChatHistory(token));
    }
  }, [dispatch, token]);

  // Determine chats based on type
  let chats = [];
  if (allhistory) {
    switch (type) {
      case "general":
        type = "chat";
        chats = allhistory.chat || [];
        break;
      case "document":
        chats = allhistory.doc || [];
        type = chats[0].query_type;
        break;
      case "database":
        chats = allhistory.db || [];
        break;
      default:
        chats = [];
    }
  }

  // Filter chats
  const processedChats = chats
    .filter(chat => 
      chat.title.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0));

  const handleClick = (chat) => {
    const documentId = chat.doc_id || chat.db_id;
    navigate(`/c/${chat.uuid}?type=${type}&token=${token}&document_id=${documentId}`);
  };

  // Get icon based on type
  const getTypeIcon = () => {
    switch (type) {
      case "general": 
        return <MessageCircle className="text-[#0faab8] w-5 h-5" />;
      case "document": 
        return <FileText className="text-[#0faab8] w-5 h-5" />;
      case "database": 
        return <Database className="text-[#0faab8] w-5 h-5" />;
      default: 
        return null;
    }
  };

  return (
    <div>
      {/* Search Input */}
      <div className="relative mb-3">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="text-gray-400 w-4 h-4" />
        </div>
        <input 
          type="text" 
          placeholder={`Search ${type} chats`}
          className="w-full pl-10 pr-8 py-2 text-sm text-white bg-[#133044] border-none rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0faab8]"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        {searchTerm && (
          <button 
            onClick={() => setSearchTerm('')}
            className="absolute inset-y-0 right-0 pr-3 flex items-center"
          >
            <X className="text-gray-400 w-4 h-4" />
          </button>
        )}
      </div>

      {/* Chat List */}
      <div className="space-y-2 max-h-[250px] overflow-y-auto scrollbar-hide">
        {processedChats.length === 0 ? (
          <div className="text-center text-gray-400 py-4 text-sm">
            No chats found
          </div>
        ) : (
          processedChats.map((chat) => (
            <div
              key={chat.uuid}
              className="flex items-center space-x-3 p-2 rounded-lg hover:bg-[#133044] transition-colors duration-200 cursor-pointer group"
              onClick={() => handleClick(chat)}
            >
              <div className="flex-shrink-0">
                <img
                  src="/images/msgIcon.png"
                  alt="chat-icon"
                  width={32}
                  height={32}
                  className="rounded-full"
                />
              </div>
              <div className="flex-grow min-w-0">
                <p className="text-sm font-medium text-white truncate group-hover:text-[#0faab8] transition-colors">
                  {chat.title}
                </p>
                {chat.created_at && (
                  <p className="text-xs text-gray-400 truncate">
                    {new Date(chat.created_at).toLocaleString()}
                  </p>
                )}
              </div>
              {getTypeIcon()}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

RenderChatList.propTypes = {
  type: PropTypes.oneOf(['general', 'document', 'database']).isRequired,
};

export default RenderChatList;