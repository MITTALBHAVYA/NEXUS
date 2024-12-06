import { motion } from "framer-motion";
import { useState } from "react";
import PropTypes from 'prop-types';
import SideBar from "../ui/SideBar.jsx";
import Navbardash from "./Navbardash.jsx";

const DatasourceLayout = ({ children }) => {
    const [isSidebarVisible, setIsSidebarVisible] = useState(true);
    const [isDialogOpen] = useState(false);

    const toggleSidebar = () => {
        setIsSidebarVisible(!isSidebarVisible);
    };

    return (
        <motion.div
            transition={{ ease: "easeInOut", duration: 0.75 }}
            className="h-screen">
            <div className="h-full relative bg-[#F6F6Fb] z-[45]">
                <motion.div
                    className="hidden h-full md:flex md:flex-col md:fixed md:inset-y-0 z-[5] md:w-[18rem]"
                    initial={{ x: 0 }}
                    animate={{ x: isSidebarVisible ? 0 : -300 }}
                >
                    <SideBar isDialogOpen={isDialogOpen} /> {/* Pass isDialogOpen prop */}
                </motion.div>
                <motion.button
                    onClick={toggleSidebar}
                    className={`fixed top-4 left-1 z-[30] p-2 text-white rounded ${isSidebarVisible ? "bg-white" : "bg-[#F6F6Fb]"}`}
                    initial={{ rotate: 0 }}
                    animate={{ rotate: isSidebarVisible ? 0 : 360 }}
                    transition={{ duration: 0.5 }}
                >
                    <motion.img
                        src={isSidebarVisible ? "/images/collapseSideBar.png" : "/images/openSideBar.png"}
                        alt="Toggle Sidebar"
                        initial={{ opacity: 1 }}
                        animate={{ opacity: isSidebarVisible ? 1 : 1 }}
                        transition={{ duration: 0.5 }}
                        className="w-10 h-10"
                    />
                </motion.button>
                <motion.main
                    className="h-fit relative"
                    initial={{ paddingLeft: "20rem" }}
                    animate={{ paddingLeft: isSidebarVisible ? "20rem" : "4rem" }}
                >
                    <Navbardash title="Out Datasource" />
                    {children}
                </motion.main>
            </div>
        </motion.div>

    )

}
DatasourceLayout.propTypes = {
    children: PropTypes.node.isRequired,
};

export default DatasourceLayout;