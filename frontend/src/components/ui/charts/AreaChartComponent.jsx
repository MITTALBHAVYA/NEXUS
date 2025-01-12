import { useRef, useState } from "react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { toPng } from "html-to-image";
import ChartButtons from "./ChartButtons";
import PropTypes from 'prop-types';


const AreaChartComponent = ({ data, rawData }) => {
  console.log("aREA CCHART CALLED");
    const label1 = data[0]?.additionalLabels?.label1?.name ?? null;
    const label2 = data[0]?.additionalLabels?.label2?.name ?? null;
    const chartRef = useRef(null);
    const [isDownloading, setIsDownloading] = useState(false);

    const transformedData = rawData.map((item) => ({
        name: item.label,
        ...item,
    }));

    const handleDownload = async () => {
        if (chartRef.current) {
            setIsDownloading(true);
            try {
                const dataUrl = await toPng(chartRef.current);
                const link = document.createElement("a");
                link.download = "area-chart.png";
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
            <ResponsiveContainer width={1000} height={350}>
              <AreaChart
                data={transformedData}
                margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
              >
                <defs>
                  <linearGradient
                    id="colorSubscriptions"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop offset="5%" stopColor="#BE6A15" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#BE6A15" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="name" />
                <YAxis />
                <CartesianGrid strokeDasharray="3 3" />
                <Tooltip />
                <Legend />
                {label1 && (
                  <Area
                    type="monotone"
                    dataKey={label1}
                    stroke="#BE6A15"
                    fillOpacity={1}
                    fill="url(#colorSubscriptions)"
                  />
                )}
                {label2 && (
                  <Area
                    type="monotone"
                    dataKey={label2}
                    stroke="#82ca9d"
                    fillOpacity={1}
                    fill="url(#colorSubscriptions)"
                  />
                )}
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <ChartButtons
            handleDownload={handleDownload}
            isDownloading={isDownloading}
          />
        </div>
      );
}
AreaChartComponent.propTypes = {
    data: PropTypes.array.isRequired,
    rawData: PropTypes.array.isRequired,
};

export default AreaChartComponent;
