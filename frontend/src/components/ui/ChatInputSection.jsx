import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@radix-ui/react-dropdown-menu";
import PropTypes from 'prop-types';

const ChatInputSection = ({ 
  input, 
  chatType, 
  selectedModel, 
  handleChange, 
  handleSend, 
  handleSendCSV, 
  handleSendExcel, 
  handleSendDB, 
  toggleUploadDialog, 
  openDBSelectDialog, 
  setSelectedModel 
}) => {
  const [placeholderText, setPlaceholderText] = useState("");
  const placeholderFullText =
    "Attach Your Data or Ask a Question to Start Your NEXUS Journey!";

  useEffect(() => {
    let timeout;
    const typeText = (text, index) => {
      if (index <= text.length) {
        setPlaceholderText(text.slice(0, index));
        timeout = setTimeout(() => typeText(text, index + 1), 100);
      }
    };
    typeText(placeholderFullText, 0);
    return () => clearTimeout(timeout);
  }, []);
  
  return (
    <div className="w-full h-fit flex flex-col items-center justify-center relative gap-2 bottom-4 ">
    <div className="w-full max-w-5xl mx-auto relative p-4 px-8">
      <div className="relative">
        <input
          className="
            w-full 
            rounded-xl 
            h-[120px] 
            shadow-2xl 
            text-[16px] 
            pl-20 
            pr-20 
            pt-16 
            pb-8 
            border-2 
            border-[#0faab8] 
            focus:border-[#133044] 
            focus:ring-2 
            focus:ring-[#0faab8] 
            transition-all 
            duration-300 
            bg-white/90 
            backdrop-blur-sm
          "
          type="text"
          value={input}
          placeholder={placeholderText}
          onChange={handleChange}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              switch(chatType) {
                case "chat": handleSend(); break;
                case "csv": handleSendCSV(); break;
                case "excel": handleSendExcel(); break;
                case "db": handleSendDB(); break;
              }
            }
          }}
        />
        
        {/* Send Button */}
        <motion.div
          className={`
            absolute 
            right-4 
            bottom-4 
            text-white 
            flex 
            items-center 
            justify-center 
            h-10 
            w-10 
            rounded-lg 
            transition-all 
            duration-300 
            ${input.trim() === '' 
              ? 'bg-gray-400 cursor-not-allowed' 
              : 'bg-gradient-to-br from-[#0faab8] to-[#133044] hover:from-[#0faab8] hover:to-[#0f4a5c] cursor-pointer'}
          `}
          whileHover={input.trim() !== '' ? { scale: 1.1 } : {}}
          onClick={() => input.trim() !== '' && handleSend()}
        >
          <img
            alt="sendIcon"
            src="/images/sendIcon.png"
            className={`w-6 h-6 ${input.trim() === '' ? 'opacity-50' : ''}`}
          />
        </motion.div>

        {/* Upload Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger 
            className="
              absolute 
              left-4 
              bottom-4 
              bg-gradient-to-br 
              from-[#0faab8] 
              to-[#133044] 
              text-white 
              rounded-lg 
              w-10 
              h-10 
              flex 
              items-center 
              justify-center 
              hover:from-[#0f4a5c] 
              hover:to-[#0f4a5c] 
              transition-all 
              duration-300
            "
          >
            <img
              alt="upload-icon"
              src="/images/uploadIcon.png"
              className="w-6 h-6"
            />
          </DropdownMenuTrigger>
          <DropdownMenuContent 
            className="
              bg-white 
              shadow-2xl 
              rounded-xl 
              border 
              border-[#0faab8] 
              p-3 
              z-50 
              absolute 
              -top-2 
              left-4 
              transform 
              -translate-y-full 
              min-w-[250px] 
              w-auto
            "
          >
            <DropdownMenuItem 
              onClick={toggleUploadDialog}
              className="
                hover:bg-[#0faab8]/10 
                rounded-lg 
                p-3 
                cursor-pointer 
                transition-colors
                w-full 
                mb-2
              "
            >
              <div className="flex items-center gap-3">
                <img
                  alt="upload-icon"
                  src="/images/uploadIcon.png"
                  className="w-6 h-6"
                />
                <span className="text-[#133044] text-sm">Upload a File</span>
              </div>
            </DropdownMenuItem>
            <DropdownMenuItem 
              onClick={openDBSelectDialog}
              className="
                hover:bg-[#0faab8]/10 
                rounded-lg 
                p-3 
                cursor-pointer 
                transition-colors
                w-full
              "
            >
              <div className="flex items-center gap-3">
                <img
                  alt="db-conn-icon"
                  src="/images/database-connection.svg"
                  className="w-6 h-6"
                />
                <span className="text-[#133044] text-sm">Add Database Connection</span>
              </div>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Model Selector */}
        <DropdownMenu className="hidden">
          <DropdownMenuTrigger 
            className="
              hidden
              absolute 
              top-4 
              left-4 
              bg-gradient-to-br 
              from-[#0faab8] 
              to-[#133044] 
              text-white 
              rounded-lg 
              px-4 
              py-2 
              text-xs 
              flex 
              items-center 
              gap-2 
              hover:from-[#0f4a5c] 
              hover:to-[#0f4a5c] 
              transition-all 
              duration-300
            "
          >
            {selectedModel.substring(0, 7)}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-4 h-4"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
          </DropdownMenuTrigger>
          <DropdownMenuContent 
            className="
              hidden
              bg-[#0fa2b1]
              text-[white]
              shadow-2xl 
              rounded-xl 
              border 
              border-[#0faab8] 
              p-2 
              z-50 
              absolute 
              -top-2 
              left-4 
              transform 
              -translate-y-full 
              min-w-[250px] 
              max-h-64 
              overflow-y-auto
            "
          >
            {[
              { label: "Default", icon: "/images/notificationIcon.png" },
              { label: "gpt-4", icon: "/images/openAiIcon.png" },
              { label: "gpt-3.5-turbo", icon: "/images/openAiIcon.png" },
              { label: "Gemini (Coming Soon)", icon: "/images/googleIcon.png", lock: true },
              { label: "Claude 3 (Coming Soon)", icon: "/images/AnthropicLogo.jpeg", lock: true },
            ].map((item, index) => (
              <DropdownMenuItem
                key={index}
                onClick={() => !item.lock && setSelectedModel(item.label)}
                className={`
                  hidden
                  flex 
                  items-center 
                  gap-3 
                  p-3 
                  rounded-lg 
                  transition-colors 
                  w-full
                  ${item.lock 
                    ? 'opacity-50 cursor-not-allowed' 
                    : 'hover:bg-[#82cfd6] cursor-pointer'}
                `}
              >
                {item.lock && (
                  <img
                    alt="lock-icon"
                    src="/images/lockIcon.png"
                    className="w-5 h-5"
                  />
                )}
                <img
                  alt={`${item.label.toLowerCase()}-icon`}
                  src={item.icon}
                  className="w-6 h-6"
                />
                <span className="text-[#133044] text-sm">{item.label}</span>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Advanced Analytics Button */}
        <div className="absolute top-4 left-44 flex items-center gap-2">
          <button
            className="
              group 
              relative 
              bg-gradient-to-br 
              from-[#0faab8] 
              to-[#133044] 
              text-white 
              text-xs 
              px-4 
              py-2 
              rounded-lg 
              overflow-hidden 
              transition-all 
              duration-300 
              hover:from-[#0f4a5c] 
              hover:to-[#0f4a5c] 
              hover:scale-105 
              hover:shadow-xl
            "
          >
            <span className="block transition-all duration-300 group-hover:opacity-0">
              Advanced Analytics
            </span>
            <span className="
              absolute 
              inset-0 
              flex 
              items-center 
              justify-center 
              opacity-0 
              group-hover:opacity-100 
              transition-opacity 
              duration-300
            ">
              Coming Soon
            </span>
          </button>
        </div>
      </div>
    </div>
    </div>
  );
}

ChatInputSection.propTypes = {
  input: PropTypes.string.isRequired,
  chatType: PropTypes.string.isRequired,
  selectedModel: PropTypes.string.isRequired,
  handleChange: PropTypes.func.isRequired,
  handleSend: PropTypes.func.isRequired,
  handleSendCSV: PropTypes.func.isRequired,
  handleSendExcel: PropTypes.func.isRequired,
  handleSendDB: PropTypes.func.isRequired,
  toggleUploadDialog: PropTypes.func.isRequired,
  openDBSelectDialog: PropTypes.func.isRequired,
  setSelectedModel: PropTypes.func.isRequired,
};

export default ChatInputSection;