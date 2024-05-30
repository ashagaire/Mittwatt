import { signIn, signOut, useSession } from "next-auth/react";
import Head from "next/head";
import Link from "next/link";

import { api } from "~/utils/api";

export default function Home() {
  // a function to get a date and returns an object with its day, month, year to be used as an input for queries
  const currentDay = (dayValue: Date) => {
    return {
      day: dayValue.getDate(),
      month: dayValue.getMonth(),
      year: dayValue.getFullYear(),
    };
  };
  const hello = api.post.hello.useQuery({ text: "from tRPC" });

  // get real prices for today
  const historyToday = api.price.getHistoryDay.useQuery({
    date: currentDay(new Date()),
  });

  console.log(historyToday.data);

  // get forecast price for the day after tomorrow
  const dayAfterTomorrow = new Date(
    new Date().setDate(new Date().getDate() + 2),
  );
  const forecastDayAfterTomorrow = api.price.getForecastDay.useQuery({
    date: currentDay(dayAfterTomorrow),
  });

  console.log(forecastDayAfterTomorrow.data);

  return (
    <>
      <div>{hello.data ? hello.data.greeting : "Hello"}</div>
    </>
  );
}

function AuthShowcase() {
  const { data: sessionData } = useSession();

  const { data: secretMessage } = api.post.getSecretMessage.useQuery(
    undefined, // no input
    { enabled: sessionData?.user !== undefined },
  );

  return (
    <div className="flex flex-col items-center justify-center gap-4">
      <p className="text-center text-2xl text-white">
        {sessionData && <span>Logged in as {sessionData.user?.name}</span>}
        {secretMessage && <span> - {secretMessage}</span>}
      </p>
      <button
        className="rounded-full bg-white/10 px-10 py-3 font-semibold text-white no-underline transition hover:bg-white/20"
        onClick={sessionData ? () => void signOut() : () => void signIn()}
      >
        {sessionData ? "Sign out" : "Sign in"}
      </button>
    </div>
  );
}
