//import { signIn, signOut, useSession } from "next-auth/react";
//import Head from "next/head";
//import Link from "next/link";

import { useMemo } from "react";
import { api } from "~/utils/api";
import AveragePrices from "~/components/AveragePrices";

export default function Past() {
  const startDate = useMemo(
    () => new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
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
    <div className="container flex flex-col items-center justify-center gap-4 text-black">
      <div className="w-full pb-6 pt-6 text-center text-4xl font-bold">
        Past Prices
      </div>
      <AveragePrices startDate={startDate} endDate={endDate} data={data} />
    </div>
  );
}
