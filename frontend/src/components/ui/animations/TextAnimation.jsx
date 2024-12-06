import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

const textVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
};

const AutoChangingText = () => {
  const textArray = [
    "Smart Data Insights, Instantly",
    "Visualize Your Data, Instantly",
    "Transform Data with Nexus",
    "Analyze Data with Nexus",
  ];

  const [index, setIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prevIndex) => (prevIndex + 1) % textArray.length);
    }, 3000);

    return () => clearInterval(interval);
  }, [textArray.length]);

  return (
    <div className="h-[80%] w-full flex flex-col items-center justify-center">
      <div className="rounded-lg border bg-card text-card-foreground shadow-sm w-[650px] border-none !bg-transparent flex flex-row items-center justify-left relative bottom-[100px]">
        <div className="flex flex-col space-y-1.5 p-6">
          <h3 className="text-2xl font-semibold leading-none tracking-tight">
            <div className="flex flex-row relative left-24 gap-4 p-1 w-full text-nowrap justify-center uppercase">
              <div
                style={{
                  position: "relative",
                  height: "50px",
                  width: "100%",
                }}
              >
                <AnimatePresence mode="wait">
                  <motion.div
                    key={index}
                    variants={textVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    transition={{
                      duration: 0.5,
                      ease: "easeInOut",
                    }}
                    style={{ position: "absolute" }}
                    className="bg-gradient-to-r from-[#0faab8] to-[#133044] bg-clip-text text-transparent"
                  >
                    {textArray[index]}
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>
          </h3>
        </div>
      </div>
    </div>
  );
};

export default AutoChangingText;
