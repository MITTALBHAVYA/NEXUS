import { useRef, useState } from "react";
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Legend, Tooltip, ResponsiveContainer,} from "recharts";
import { toPng } from "html-to-image";
import ChartButtons from "./ChartButtons";
import PropTypes from "prop-types";

const RadarChartComponent = ({ rawData }) => {
  // Transform rawData for RadarChart
  const transformedData = rawData.map((item) => ({
    subject: item.label,
    ...Object.keys(item).reduce((acc, key) => {
      if (key !== "label") {
        acc[key] = item[key];
      }
      return acc;
    }, {}),
  }));

  // Calculate the maximum value for the domain
  const maxValue = Math.max(
    ...rawData.flatMap((item) =>
      Object.values(item).filter((value) => typeof value === "number")
    )
  );

  // Ref for the chart container
  const chartRef = useRef(null);
  const [isDownloading, setIsDownloading] = useState(false);

  // Function to handle downloading the chart as an image
  const handleDownload = async () => {
    if (chartRef.current) {
      setIsDownloading(true);
      try {
        const dataUrl = await toPng(chartRef.current);
        const link = document.createElement("a");
        link.download = "radar-chart.png";
        link.href = dataUrl;
        link.click();
      } finally {
        setIsDownloading(false);
      }
    }
  };

  return (
    <div className="relative left-[46px]">
      {/* Chart container for exporting */}
      <div ref={chartRef}>
        <ResponsiveContainer width={800} height={400}>
          <RadarChart outerRadius={150} data={transformedData}>
            <defs>
              <linearGradient id="colorRadar" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#BE6A15" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#BE6A15" stopOpacity={0} />
              </linearGradient>
            </defs>
            <PolarGrid />
            <Tooltip />
            <PolarAngleAxis dataKey="subject" />
            <PolarRadiusAxis angle={30} domain={[0, maxValue]} />
            {Object.keys(rawData[0])
              .filter((key) => key !== "label")
              .map((key, index) => (
                <Radar
                  key={index}
                  name={key}
                  dataKey={key}
                  stroke="#BE6A15"
                  fill="url(#colorRadar)"
                  fillOpacity={0.6}
                />
              ))}
            <Legend />
          </RadarChart>
        </ResponsiveContainer>
      </div>
      {/* Chart action buttons */}
      <ChartButtons
        handleDownload={handleDownload}
        isDownloading={isDownloading}
      />
    </div>
  );
};

RadarChartComponent.propTypes = {
  rawData: PropTypes.arrayOf(
    PropTypes.shape({
      label: PropTypes.string.isRequired,
      // Accept any additional properties with numerical values
      [PropTypes.string]: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    })
  ).isRequired,
};

export default RadarChartComponent;
