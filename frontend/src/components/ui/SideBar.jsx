import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@radix-ui/react-accordion';
import PropTypes from 'prop-types';
import { motion } from "framer-motion";
import { useState } from 'react';
// import { useDispatch, useSelector } from 'react-redux';
// import { getAllChatHistory } from '../../app/services/chatSlice';
import { Link } from 'react-router-dom';
import RenderChatList from './RenderChatList';

const SideBar = ({ isDialogOpen }) => {
    const [isCollapsed] = useState(false);
    const [isPreviousChatsExpanded, setIsPreviousChatsExpanded] = useState(false);
    return (
        <motion.div
            initial={{ width: 0 }}
            animate={{ width: isCollapsed ? 0 : "300px" }}
            transition={{ duration: 0.3 }}
            className={`py-4 flex flex-col h-full bg-white text-white ${isDialogOpen ? "blur-background" : ""
                } shadow-lg rounded-lg`}>
            {!isCollapsed && (
                <div className="flex flex-col h-full">
                    <div className="px-4 mb-6">
                        <Link to='/dashboard'>
                            <img src="/images/Nexus_LOGO.png" alt="logo" width={120} height={120} className='mx-auto' />
                        </Link>
                    </div>
                    <div className="px-4 mb-9 pt-5">
                        <Link to='/dashboard'>
                            <motion.div
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                transition={{ type: "spring", stiffness: 200, damping: 20 }}
                            >
                                <button className="w-full justify-start bg-gradient-to-r from-[#0faab8] to-[#133044] text-white hover:text-white border-none shadow-md hover:shadow-xl transition-all duration-300 py-6 rounded-lg transform hover:scale-105">
                                    <div className='flex items-center space-x-4'>
                                        <img src="/images/chatIcon.png" alt="chat-icon" width={35} height={35} className='brightness-0 invert' />
                                        <span className="text-xl font-medium">Start New Chat</span>
                                    </div>
                                </button>

                            </motion.div>
                        </Link>
                    </div>
                    <div className="flex-grow overflow-y-auto scrollbar-hide px-4">
                        <Accordion
                            type="single"
                            collapsible
                            className="text-[#082a3f]"
                            onValueChange={(value) => setIsPreviousChatsExpanded(!!value)}
                        >
                            <AccordionItem value="previous-chats" className="border-b-0">
                                <motion.div
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.98 }}
                                    transition={{ type: "spring", stiffness: 400, damping: 20 }}
                                >
                                    <AccordionTrigger className="hover:no-underline px-0 w-full py-6">
                                        <div className="flex items-center space-x-3 py-2 px-4 rounded-lg transition-colors duration-300 bg-gradient-to-r from-[#0faab8] to-[#133044] hover:from-[#133044] hover:to-[#0faab8] text-white">
                                            <img
                                                src="/images/prevChatIcon.png"
                                                alt="chat-icon"
                                                width={24}
                                                height={24}
                                                className="transform brightness-0 invert"
                                            />
                                            <span className="font-semibold text-lg">Previous Chats</span>
                                        </div>
                                    </AccordionTrigger>
                                </motion.div>
                                <AccordionContent>
                                    <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: "auto" }}
                                        exit={{ opacity: 0, height: 0 }}
                                        transition={{ duration: 0.3, ease: "easeInOut" }}
                                    >
                                        <div className="space-y-5 max-h-[350px] overflow-y-auto pr-3 scrollbar-hide bg-[#a2a2a2] text-white p-4 rounded-lg">
                                            <div>
                                                <h2 className="text-sm font-medium text-white mb-3">General Chats</h2>
                                                <RenderChatList type="general" />
                                            </div>
                                            <div>
                                                <h2 className="text-sm font-medium text-white mb-3">Document Chats</h2>
                                                <RenderChatList type="document" />
                                            </div>
                                            <div>
                                                <h2 className="text-sm font-medium text-white mb-3">Database Chats</h2>
                                                <RenderChatList type="database" />
                                            </div>
                                        </div>
                                    </motion.div>
                                </AccordionContent>
                            </AccordionItem>
                        </Accordion>
                        <motion.div
                            initial={false}
                            animate={{ marginTop: isPreviousChatsExpanded ? 24 : 8 }}
                            transition={{ duration: 0.3 }}
                        >
                            <Link to="/datasource">
                                <motion.div
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    transition={{ type: "spring", stiffness: 400, damping: 17 }}
                                >
                                    <button className="w-full justify-start bg-gradient-to-r from-[#0faab8] to-[#133044] text-white border-none shadow-md hover:shadow-xl transition-all duration-300 py-4 rounded-lg transform hover:scale-105">
                                        <div className="flex items-center space-x-5">
                                            <div className="p-1 rounded">
                                                <img
                                                    alt="datasource-icon"
                                                    src="/images/datasourceicon.png"
                                                    width={30}
                                                    height={30}
                                                    className="brightness-200 invert"
                                                />
                                            </div>
                                            <span className="text-lg font-medium">Datasources</span>
                                        </div>
                                    </button>

                                </motion.div>
                            </Link>
                        </motion.div>
                    </div>
                </div>
            )}
        </motion.div>
    )

}
SideBar.propTypes = {
    isDialogOpen: PropTypes.bool.isRequired,
};

export default SideBar;