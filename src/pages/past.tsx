//import { signIn, signOut, useSession } from "next-auth/react";
//import Head from "next/head";
//import Link from "next/link";

import { useState, useEffect } from "react";

import { api } from "~/utils/api";

export default function Past() {
  const data = api.price.getHistoryPeriod.useQuery({
    startDate: new Date(new Date().setDate(new Date().getDate() - 1)),
    endDate: new Date(),
  });

  useEffect(() => {
    if (data) {
      console.log("data", data);
    }
  }, [data]);

  return (
    <>
      <div>Past</div>
    </>
  );
}
