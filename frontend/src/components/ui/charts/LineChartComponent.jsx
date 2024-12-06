import { useRef, useState } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,} from "recharts";
import { toPng } from "html-to-image";
import ChartButtons from "./ChartButtons"; 
import PropTypes from 'prop-types';
const LineChartComponent = ({
  data,
  rawData,
}) => {
  const label1 = data[0]?.additionalLabels?.label1?.name ?? null;
  const label2 = data[0]?.additionalLabels?.label2?.name ?? null;

  const transformedData = rawData.map((item) => ({
    name: item.label,
    ...item,
  }));

  const chartRef = useRef(null);
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownload = async () => {
    if (chartRef.current) {
      setIsDownloading(true);
      try {
        const dataUrl = await toPng(chartRef.current);
        const link = document.createElement("a");
        link.download = "line-chart.png";
        link.href = dataUrl;
        link.click();
      } finally {
        setIsDownloading(false);
      }
    }
  };

  return (
    <div className="relative left-[46px]">
      <div ref={chartRef}>
        <ResponsiveContainer width={1000} height={450}>
          <LineChart
            data={transformedData}
            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            {label1 && (
              <Line type="monotone" dataKey={label1} stroke="#BE6A15" />
            )}
            {label2 && (
              <Line type="monotone" dataKey={label2} stroke="#82ca9d" />
            )}
          </LineChart>
        </ResponsiveContainer>
      </div>
      <ChartButtons
        handleDownload={handleDownload}
        isDownloading={isDownloading}
      />
    </div>
  );
}

LineChartComponent.propTypes = {
    data: PropTypes.array.isRequired,
    rawData: PropTypes.array.isRequired,
};
export default LineChartComponent;