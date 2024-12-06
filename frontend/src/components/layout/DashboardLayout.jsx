import { motion } from "framer-motion";
import { useState } from "react";
import SideBar from "../ui/SideBar.jsx";
import Navbardash from "./Navbardash.jsx";
import { useSelector } from "react-redux";
import { Outlet } from 'react-router-dom';
const DashboardLayout = () => {
    const [isSidebarVisible, setIsSidebarVisible] = useState(true);
    const [isDialogOpen] = useState(false);
    const { history } = useSelector((state) => state.chart);
    const toggleSidebar = () => {
        setIsSidebarVisible(!isSidebarVisible);
    };

    return (
        <motion.div
            transition={{ ease: "easeInOut", duration: 0.75 }}
            className="h-screen">
            <div className="h-full relative bg-[#f6f6fb]">
                <motion.button
                    onClick={toggleSidebar}
                    className="absolute top-4 left-1 z-[55] p-2 text-white rounded"
                    initial={{ rotate: 0 }}
                    animate={{ rotate: isSidebarVisible ? 0 : 360 }}
                    transition={{ duration: 0.5 }}>
                    <motion.img
                        src={isSidebarVisible ? "/images/collapseSideBar.png" : "/images/openSideBar.png"}
                        alt="Toggle Sidebar"
                        initial={{ opacity: 1 }}
                        animate={{ opacity: isSidebarVisible ? 1 : 1 }}
                        transition={{ duration: 0.5 }}
                        className="w-[3rem] h-[3rem]"
                    />
                </motion.button>
                <motion.div
                    className="hidden h-full md:flex md:flex-col md:fixed md:inset-y-0 z-[45] md:w-[18rem]"
                    initial={{ x: 0 }}
                    animate={{ x: isSidebarVisible ? 0 : -300 }}
                >
                    <SideBar isDialogOpen={isDialogOpen} />
                </motion.div>
                <motion.main
                    className="h-full relative pb-4"
                    initial={{ paddingLeft: "18rem" }}
                    animate={{ paddingLeft: isSidebarVisible ? "16rem" : "2rem" }}
                >
                    <Navbardash title={history?.title ? history.title : ""} />
                    <Outlet />
                </motion.main>
            </div>
        </motion.div>
    );
};

export default DashboardLayout;
