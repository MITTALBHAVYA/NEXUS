import { useRef, useState } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Legend, ResponsiveContainer,} from "recharts";
import { toPng } from "html-to-image";
import ChartButtons from "./ChartButtons"; 
import PropTypes from 'prop-types';

const BarChartComponent = ({
  data,
  rawData,
})=>{
  console.log("bar chart called");
  const chartRef = useRef(null);
  const [isDownloading, setIsDownloading] = useState(false);

  if (!data || data.length === 0) {
    return null;
  }

  const label1 = data[0]?.additionalLabels?.label1?.name ?? null;
  const label2 = data[0]?.additionalLabels?.label2?.name ?? null;

  if (!rawData || rawData.length === 0) {
    return <div>No raw data available for the chart</div>;
  }

  const handleDownload = async () => {
    if (chartRef.current) {
      setIsDownloading(true);
      try {
        const dataUrl = await toPng(chartRef.current);
        const link = document.createElement("a");
        link.download = "bar-chart.png";
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
          <BarChart data={rawData}>
            <XAxis dataKey="label" stroke="#BE6A15" />
            <YAxis />
            <Tooltip />
            <Legend />
            <CartesianGrid stroke="#ccc" strokeDasharray="5 5" />
            {label1 && <Bar dataKey={label1} fill="#BE6A15" barSize={30} />}
            {label2 && <Bar dataKey={label2} fill="#82ca9d" barSize={30} />}
          </BarChart>
        </ResponsiveContainer>
      </div>
      <ChartButtons
        handleDownload={handleDownload}
        isDownloading={isDownloading}
      />
    </div>
  );
}
BarChartComponent.propTypes = {
    data: PropTypes.array.isRequired,
    rawData: PropTypes.array.isRequired,
};
export default BarChartComponent;
