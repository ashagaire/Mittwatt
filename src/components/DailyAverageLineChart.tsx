import React, { useEffect, useRef } from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Label,
} from "recharts";

interface DailyAverageLineChartProps {
  startDate: Date;
  endDate: Date;
  data: any;
  tickStep: number;
}

const DailyAverageLineChart: React.FC<DailyAverageLineChartProps> = ({
  startDate,
  endDate,
  data,
  tickStep,
}) => {
  const tickFormatter = (value: string, index: number) => {
    const [day, month, year] = value.split(".");

    if (index % tickStep === 0) {
      return `${day}.${month}.${year}`;
    }

    return "";
  };

  return (
    <>
      <div className="h-full w-full px-10">
        <ResponsiveContainer height={500}>
          <LineChart
            data={data}
            margin={{ top: 5, right: 20, bottom: 100, left: 10 }}
          >
            <Line type="monotone" dataKey="price" stroke="#16A34A" />
            <CartesianGrid stroke="#ccc" strokeDasharray="5 5" />
            <XAxis
              dataKey="date"
              tickFormatter={tickFormatter}
              angle={-90}
              textAnchor="end"
            >
              <Label value="Date" offset={60} position="bottom" />
            </XAxis>
            <YAxis tickCount={10}>
              <Label value="Price" offset={5} position="left" angle={-90} />
            </YAxis>
            <Tooltip
              formatter={(value, name, props) => [
                `Price: ${value !== null ? props.payload?.price?.toFixed(2) + " c/kWh" : "N/A"}`,
              ]}
              labelFormatter={(label) => `Date: ${label}`}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </>
  );
};

export default DailyAverageLineChart;
