//import { signIn, signOut, useSession } from "next-auth/react";
//import Head from "next/head";
//import Link from "next/link";

import { useState, useEffect } from "react";

import { api } from "~/utils/api";

export default function Past() {
  const [data, setData] = useState<any>(null);
  const fetchData = async () => {
    const { data } = await api.price.getHistoryPeriod.useQuery({
      startDate: new Date(new Date().setDate(new Date().getDate() - 1)),
      endDate: new Date(),
    });
    setData(data);
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <>
      {data && <div>{data.length}</div>}
      {!data && <div>Loading data...</div>}
    </>
  );
}
