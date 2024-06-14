//import { signIn, signOut, useSession } from "next-auth/react";
//import Head from "next/head";
//import Link from "next/link";

import { api } from "~/utils/api";

export default function Past() {
  const { data, error, isLoading } =
    api.price.getHistoryPeriodDailyAverage.useQuery({
      startDate: new Date(Date.now() - 9 * 24 * 60 * 60 * 1000),
      endDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    });

  console.log("Data:", data);
  console.log("Error:", error);
  console.log("IsLoading:", isLoading);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error.message}</div>;
  }

  return (
    <div>
      <div>{JSON.stringify(data)}</div>
    </div>
  );
}
