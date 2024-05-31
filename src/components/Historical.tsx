import { api } from "~/utils/api";
import { useMemo, useEffect } from "react";

interface HistoricalProps {
  dayProp: Date;
}

const Historical: React.FC<HistoricalProps> = ({ dayProp }) => {
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
  /*useEffect(() => {
    console.log("current", data);
  }, [data]);*/

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error loading data</div>;
  }

  return (
    <>
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
                    {item.dateData.dateValue.getHours() + 1}
                  </td>
                  <td className="border border-gray-500 px-4 py-2">
                    {item.price}
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
