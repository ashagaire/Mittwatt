import DailyAverageLineChart from "./DailyAverageLineChart";

interface DailyAveragePricesForYearProps {
  startDate: Date;
  endDate: Date;
  data: any;
}

const DailyAveragePricesForYear: React.FC<DailyAveragePricesForYearProps> = ({
  startDate,
  endDate,
  data,
}) => {
  const tickFormatter = (value: string, index: number) => {
    const [day, month, year] = value.split(".");

    if (index % 30 === 0) {
      return `${day}.${month}.${year}`;
    }

    return "";
  };

  return (
    <>
      <div className="flex w-full items-center justify-center pt-20 text-center text-2xl text-black">
        Average price from
        <span className="mx-2 text-green-800">
          {" "}
          {startDate.toDateString()}{" "}
        </span>
        to
        <span className="mx-2 text-green-800"> {endDate.toDateString()} </span>
      </div>
      <DailyAverageLineChart
        startDate={startDate}
        endDate={endDate}
        data={data}
        tickStep={30}
      />
    </>
  );
};

export default DailyAveragePricesForYear;
