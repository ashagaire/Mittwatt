import { useEffect, useMemo, useState } from "react";
import { api } from "~/utils/api";
import DailyAveragePricesForTwoWeeks from "~/components/DailyAveragePricesForTwoWeeks";
import DailyAveragePricesForYear from "~/components/DailyAveragePricesForYear";
import PastAveragePrices from "~/components/PastAveragePrices";

export default function Past() {
  const startDate = useMemo(
    () => new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
    [],
  );
  const endDate = useMemo(
    () => new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    [],
  );

  const startYearDate = useMemo(
    () => new Date(Date.now() - 365 * 24 * 60 * 60 * 1000),
    [],
  );
  const endYearDate = useMemo(
    () => new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    [],
  );

  const { data, error, isLoading } =
    api.price.getHistoryPeriodDailyAverage.useQuery({
      startDate: startDate,
      endDate: endDate,
    });

  const {
    data: yearData,
    error: yearError,
    isLoading: yearUsLoading,
  } = api.price.getHistoryPeriodDailyAverage.useQuery({
    startDate: startYearDate,
    endDate: endYearDate,
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
    return <div>Error: {error ? error.message : "Unknown Error"}</div>;
  }

  return (
    <div className="container flex flex-col items-center justify-center gap-4 text-black">
      <div className="w-full pb-6 pt-6 text-center text-4xl font-bold">
        Past Prices
      </div>
      <PastAveragePrices />
      <DailyAveragePricesForTwoWeeks
        startDate={startDate}
        endDate={endDate}
        data={data}
      />
      <DailyAveragePricesForYear
        startDate={startYearDate}
        endDate={endYearDate}
        data={yearData}
      />
    </div>
  );
}
