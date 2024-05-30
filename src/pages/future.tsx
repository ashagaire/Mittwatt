import { signIn, signOut, useSession } from "next-auth/react";
import Head from "next/head";
import Link from "next/link";

import { api } from "~/utils/api";

export default function Current() {
  // a function to get a date and returns an object with its day, month, year to be used as an input for queries
  const currentDay = (dayValue: Date) => {
    return {
      day: dayValue.getDate(),
      month: dayValue.getMonth(),
      year: dayValue.getFullYear(),
    };
  };
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
      <div>Future</div>
    </>
  );
}
