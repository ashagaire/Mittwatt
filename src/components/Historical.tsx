import { api } from "~/utils/api";
import { useMemo, useEffect, useState } from "react";
import Image from "next/image";

import {
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Label,
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
      <div className="flex w-full items-center justify-center pt-20 text-center text-2xl  text-black">
        {data ? data[1]?.dateData.dateValue.toDateString() : "undefined"}
      </div>

      <div className="flex w-full items-center justify-center px-32 py-10 text-black">
        <table className="min-w-full table-auto border-collapse border border-gray-500 px-10">
          <thead>
            <tr className="bg-green-600 text-white">
              <th className="border border-gray-500 px-4 py-2">Lowest</th>
              <th className="border border-gray-500 px-4 py-2">Highest</th>
              <th className="border border-gray-500 px-4 py-2">Average</th>
            </tr>
          </thead>
          <tbody>
            <tr className="bg-green-50">
              <td className="border border-gray-500 px-4 py-2 text-center">
                {minimumPrice.toFixed(2) + " c/kWh"}
              </td>
              <td className="border border-gray-500 px-4 py-2 text-center">
                {maximumPrice.toFixed(2) + " c/kWh"}
              </td>
              <td className="border border-gray-500 px-4 py-2 text-center">
                {averagePrice.toFixed(2) + " c/kWh"}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className="flex w-full items-center justify-center pt-20 text-center text-2xl  text-black">
        Hourly Price Distribution
      </div>

      <div className="mb-10 h-full w-full">
        <ResponsiveContainer height={500}>
          <BarChart
            data={data}
            margin={{ top: 5, right: 20, bottom: 100, left: 10 }}
            className="justify-center"
          >
            <CartesianGrid stroke="#eee" strokeDasharray="5 5" />
            <XAxis
              dataKey="dateData.dateValue"
              tickFormatter={(value) => {
                return value.getUTCHours();
              }}
            >
              <Label value="Hours" offset={5} position="bottom" />
            </XAxis>
            // Format x-axis labels
            <YAxis tickCount={10}>
              <Label value="Price" offset={5} position="left" angle={-90} />
            </YAxis>
            <Tooltip />
            <Bar dataKey="price" fill="#16A34A" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="flex w-full items-center justify-center pt-20 text-center text-2xl  text-black">
        Hourly Price Distribution Over Time
      </div>

      <div className="h-full w-full">
        <ResponsiveContainer height={500}>
          <LineChart
            data={data}
            margin={{ top: 5, right: 20, bottom: 100, left: 10 }}
            className="justify-center"
          >
            <Line type="monotone" dataKey="price" stroke="#16A34A" />
            <CartesianGrid stroke="#ccc" strokeDasharray="5 5" />
            <XAxis
              dataKey="dateData.dateValue"
              tickFormatter={(value) => {
                return value.getUTCHours();
              }}
            >
              <Label value="Hours" offset={5} position="bottom" />
            </XAxis>
            <YAxis tickCount={10}>
              <Label value="Price" offset={5} position="left" angle={-90} />
            </YAxis>
            <Tooltip />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className=" w-full items-center justify-center pl-32 pr-32 pt-10 text-black">
        <table className="min-w-full table-auto border-collapse border border-gray-500 px-10">
          <thead>
            <tr className="bg-green-600 text-white">
              <th className="border border-gray-500 px-4 py-2">Hour</th>
              <th className="border border-gray-500 px-4 py-2">Price</th>
            </tr>
          </thead>
          <tbody>
            {data && data.length > 0 ? (
              data.map((item: any, index: number) => (
                <tr
                  key={index}
                  className={` ${item.dateData.dateValue.getUTCHours() === new Date().getHours() && item.dateData.dateValue.getDate() === new Date().getDate() ? "bg-green-200 text-green-800" : "bg-green-50 text-black"}`}
                >
                  <td className="border border-gray-500 px-4 py-2 text-center">
                    {item.dateData.dateValue.getUTCHours() + ":00"}
                  </td>
                  <td className="border border-gray-500 px-4 py-2 text-center">
                    {item.price?.toFixed(2)
                      ? item.price?.toFixed(2) + " c/kWh"
                      : "Not yet calculated"}
                  </td>
                </tr>
              ))
            ) : (
              <tr className="bg-green-50">
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
