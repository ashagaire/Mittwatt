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
import DailyAverageLineChart from "./DailyAverageLineChart";

interface DailyAveragePricesForTwoWeeksProps {
  startDate: Date;
  endDate: Date;
  data: any;
}

const DailyAveragePricesForTwoWeeks: React.FC<
  DailyAveragePricesForTwoWeeksProps
> = ({ startDate, endDate, data }) => {
  return (
    <>
      <div className="flex w-full items-center justify-center pt-20 text-center text-2xl  text-black">
        Average price from{" "}
        <span className="mx-2 text-green-800">
          {" "}
          {startDate.toDateString()}{" "}
        </span>{" "}
        to{" "}
        <span className="mx-2 text-green-800"> {endDate.toDateString()} </span>
      </div>
      <DailyAverageLineChart
        startDate={startDate}
        endDate={endDate}
        data={data}
        tickStep={1}
      />
      <div className="flex w-full items-center justify-center pl-32 pr-32 pt-10 text-black">
        <table className="min-w-full table-auto border-collapse border border-gray-500 px-10">
          <thead>
            <tr className="bg-green-600 text-white">
              <th className="border border-gray-500 px-4 py-2 ">Date</th>
              <th className="border border-gray-500 px-4 py-2 ">
                Average Price
              </th>
            </tr>
          </thead>
          <tbody>
            {data && data.length > 0 ? (
              data.map((item: any, index: number) => (
                <tr key={index} className="bg-green-50">
                  <td className="border border-gray-500 px-4 py-2 text-center">
                    {item.date}
                  </td>
                  <td className="border border-gray-500 px-4 py-2 text-center">
                    {item.price?.toFixed(2) + " c/kWh"}
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
};

export default DailyAveragePricesForTwoWeeks;
