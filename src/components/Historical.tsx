import { api } from "~/utils/api";
import { useMemo, useEffect, useState } from "react";
import Image from "next/image";

import {
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";

interface HistoricalProps {
  dayProp: Date;
}

const Historical: React.FC<HistoricalProps> = ({ dayProp }) => {
  const [maximumPrice, setMaximumPrice] = useState(Number.MIN_SAFE_INTEGER);
  const [minimumPrice, setMinimumPrice] = useState(Number.MAX_SAFE_INTEGER);
  const [averagePrice, setAveragePrice] = useState(0);
  // a function to get a date and returns an object with its day, month, year to be used as an input for queries
  const currentDay = (dayValue: Date) => {
    return {
      day: dayValue.getDate(),
      month: dayValue.getMonth() + 1, // getMonth is zero-based
      year: dayValue.getFullYear(),
    };
  };

  // Memoize the current day object to avoid unnecessary recalculations
  const currentDate = useMemo(() => currentDay(dayProp), [dayProp]);

  // get real prices for today
  const { data, error, isLoading } = api.price.getHistoryDay.useQuery({
    date: currentDate,
  });

  // Debugging: Controlled logging
  useEffect(() => {
    if (data) {
      console.log("data", data);
      setMinimumPrice(
        data.reduce((min, obj) => {
          return Math.min(min, obj?.price ?? Number.MAX_SAFE_INTEGER);
        }, Number.MAX_SAFE_INTEGER),
      );
      console.log("min", minimumPrice);

      setMaximumPrice(
        data.reduce((max, obj) => {
          return Math.max(max, obj?.price ?? Number.MIN_SAFE_INTEGER);
        }, Number.MIN_SAFE_INTEGER),
      );
      console.log("min", maximumPrice);

      setAveragePrice(
        data.reduce((sum, obj) => {
          return sum + (obj?.price ?? 0);
        }, 0) / data.length,
      );
      console.log("average", averagePrice);
    }
    //console.log("current", data);
  }, [data]);

  if (isLoading) {
    return (
      <>
        <div className=" inline h-8 w-8 text-gray-200">
          <span className="loader inline h-8 w-8 text-gray-200"></span>
        </div>
      </>
    );
  }

  if (error) {
    return <div>Error loading data</div>;
  }

  return (
    <>
      <div className="h-96 w-full">
        <LineChart
          width={600}
          height={300}
          data={data}
          margin={{ top: 5, right: 20, bottom: 5, left: 0 }}
        >
          <Line type="monotone" dataKey="price" stroke="#8884d8" />
          <CartesianGrid stroke="#ccc" strokeDasharray="5 5" />
          <XAxis
            dataKey="dateData.dateValue"
            tickFormatter={(value) => {
              return value.getUTCHours() + ":00";
            }}
          />
          <YAxis />
          <Tooltip />
        </LineChart>
      </div>

      <div className="text-white">
        <table className="w-full table-auto border-collapse border border-gray-500">
          <thead>
            <tr>
              <th className="border border-gray-500 px-4 py-2">Lowest</th>
              <th className="border border-gray-500 px-4 py-2">Highest</th>
              <th className="border border-gray-500 px-4 py-2">Average</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="border border-gray-500 px-4 py-2">
                {minimumPrice.toFixed(2) + " c/kWh"}
              </td>
              <td className="border border-gray-500 px-4 py-2">
                {maximumPrice.toFixed(2) + " c/kWh"}
              </td>
              <td className="border border-gray-500 px-4 py-2">
                {averagePrice.toFixed(2) + " c/kWh"}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className="text-white">
        {data ? data[1]?.dateData.dateValue.toDateString() : "undefined"}

        <table className="w-full table-auto border-collapse border border-gray-500">
          <thead>
            <tr>
              <th className="border border-gray-500 px-4 py-2">Hour</th>
              <th className="border border-gray-500 px-4 py-2">Price</th>
            </tr>
          </thead>
          <tbody>
            {data && data.length > 0 ? (
              data.map((item: any, index: number) => (
                <tr key={index}>
                  <td className="border border-gray-500 px-4 py-2">
                    {item.dateData.dateValue.getUTCHours() + ":00"}
                  </td>
                  <td className="border border-gray-500 px-4 py-2">
                    {item.price?.toFixed(2)
                      ? item.price?.toFixed(2) + " c/kWh"
                      : "Not yet calculated"}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={3} className="border border-gray-500 px-4 py-2">
                  No data available
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  );
};

export default Historical;
