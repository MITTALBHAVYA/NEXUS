import { useRef, useState } from "react";
import { PieChart, Pie, Tooltip, Legend, Cell, LabelList } from "recharts";
import { toPng } from "html-to-image";
import ChartButtons from "./ChartButtons";
import PropTypes from 'prop-types';


const PieChartComponent = ({ data }) => {
  const colors = [
    "#FF6384",
    "#36A2EB",
    "#FFCE56",
    "#4BC0C0",
    "#9966FF",
    "#FF9F40",
    "#FF6384",
    "#36A2EB",
    "#FFCE56",
    "#4BC0C0",
    "#FF5733",
    "#33FF57",
    "#3357FF",
    "#FF33A1",
    "#A133FF",
    "#33FFA1",
    "#A1FF33",
    "#FF3333",
    "#33FF33",
    "#3333FF",
  ];

  const data01 = data.map((item) => ({
    name: item.label,
    value: item.additionalLabels.label1?.value ?? null,
  }));

  const chartRef = useRef(null);
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownload = async () => {
    if (chartRef.current) {
      setIsDownloading(true);
      try {
        const dataUrl = await toPng(chartRef.current);
        const link = document.createElement("a");
        link.download = "pie-chart.png";
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
        <PieChart width={1200} height={500}>
          <Tooltip />
          <Legend
            layout="vertical"
            verticalAlign="middle"
            align="right"
            wrapperStyle={{ left: 650 }}
          />
          <Pie
            data={data01}
            dataKey="value"
            nameKey="name"
            cx="40%"
            cy="50%"
            outerRadius={200}
            fill="#BE6A15"
            label={false}
          >
            <LabelList
              dataKey="value"
              position="inside"
              style={{ fontSize: "20px", fill: "black", fontWeight: "bold" }}
              formatter={(value) => `${value}%`}
            />
            {data01.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={colors[index % colors.length]}
              />
            ))}
          </Pie>
        </PieChart>
      </div>
      <ChartButtons
        handleDownload={handleDownload}
        isDownloading={isDownloading}
      />
    </div>
  );
}

PieChartComponent.propTypes = {
  data: PropTypes.array.isRequired,
};
export default PieChartComponent;