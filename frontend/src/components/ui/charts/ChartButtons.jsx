import { motion } from "framer-motion";
import PropTypes from 'prop-types';

const ChartButtons = ({handleDownload,isDownloading}) => {
  return (
    <div className="flex flex-row mt-4 absolute right-0 bottom-[-30px]">
      <motion.button
        onClick={handleDownload}
        className="px-5 py-3 text-black rounded -mr-6"
        disabled={isDownloading}
        whileTap={{ scale: 0.9 }}
        animate={{ scale: isDownloading ? [1, 1.1, 1] : 1 }}
        transition={{ duration: 0.6, repeat: isDownloading ? Infinity : 0 }}
        whileHover={{ scale: 1.1 }}
      >
        <img
          src="/images/downloadChart.png"
          width={30}
          height={30}
          alt="download-chart"
        />
      </motion.button>
      <motion.button
        className="px-5 py-3 text-black rounded -mr-6"
        whileTap={{ scale: 0.9 }}
        whileHover={{ scale: 1.1 }}
      >
        <img src="/images/like.png" alt="like" width={30} height={30}/>
      </motion.button>
      <motion.button
        className="px-5 py-2 text-black rounded"
        whileTap={{ scale: 0.9 }}
        whileHover={{ scale: 1.1 }}
      >
        <img
          src="/images/dislike.png"
          alt="dislike"
          width={30}
          height={30}
        />
      </motion.button>
    </div>
  )
}
ChartButtons.propTypes = {
  handleDownload: PropTypes.func.isRequired,
  isDownloading: PropTypes.bool.isRequired,
};

export default ChartButtons;
