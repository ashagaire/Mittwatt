import { signIn, signOut, useSession } from "next-auth/react";
import Head from "next/head";
import Link from "next/link";
import Image from "next/image";

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
  // get real prices for today
  const historyToday = api.price.getHistoryDay.useQuery({
    date: currentDay(new Date()),
  });

  console.log(historyToday.data);

  // get forecast price for the day after tomorrow

  return (
    <>
      <div>
        {" "}
        <nav className="">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex h-16 items-center justify-between">
              <div className="flex items-center space-x-4">
                <Link
                  href="/current/yesterday"
                  className="rounded-md px-3 py-2 text-sm font-medium text-white"
                >
                  Yesterday
                </Link>
                <Link
                  href="/today"
                  className="rounded-md px-3 py-2 text-sm font-medium text-white"
                >
                  Today
                </Link>
                <Link
                  href="/tomorrow"
                  className="rounded-md px-3 py-2 text-sm font-medium text-white"
                >
                  Tomorrow
                </Link>
              </div>
            </div>
          </div>
        </nav>
      </div>
    </>
  );
}
