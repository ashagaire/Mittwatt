//import { signIn, signOut, useSession } from "next-auth/react";
//import Head from "next/head";
//import Link from "next/link";

import { useMemo } from "react";
import { api } from "~/utils/api";

import {
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";

export default function Past() {
  const startDate = useMemo(
    () => new Date(Date.now() - 8 * 24 * 60 * 60 * 1000),
    [],
  );
  const endDate = useMemo(
    () => new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    [],
  );
  const { data, error, isLoading } =
    api.price.getHistoryPeriodDailyAverage.useQuery({
      startDate: startDate,
      endDate: endDate,
    });

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
    return <div>Error: {error.message}</div>;
  }

  return (
    <>
      <div className="h-96 w-full">
        <ResponsiveContainer width="100%" height={300}>
          <LineChart
            width={800}
            height={400}
            data={data}
            margin={{ top: 5, right: 20, bottom: 5, left: 0 }}
          >
            <Line type="monotone" dataKey="price" stroke="#8884d8" />
            <CartesianGrid stroke="#ccc" strokeDasharray="5 5" />
            <XAxis
              dataKey="date"
              tickFormatter={(value) => {
                return value;
              }}
            />
            <YAxis />
            <Tooltip />
          </LineChart>
        </ResponsiveContainer>
      </div>
      <div className="text-white">
        <table className="w-full table-auto border-collapse border border-gray-500">
          <thead>
            <tr>
              <th className="border border-gray-500 px-4 py-2">Date</th>
              <th className="border border-gray-500 px-4 py-2">
                Average Price
              </th>
            </tr>
          </thead>
          <tbody>
            {data && data.length > 0 ? (
              data.map((item: any, index: number) => (
                <tr key={index}>
                  <td className="border border-gray-500 px-4 py-2">
                    {item.date}
                  </td>
                  <td className="border border-gray-500 px-4 py-2">
                    {item.price.toFixed(2) + " c/kWh"}
                  </td>
                </tr>
              ))
            ) : (
              <td colSpan={3} className="border border-gray-500 px-4 py-2">
                No data available
              </td>
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}
