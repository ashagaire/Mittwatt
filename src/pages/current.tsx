//import { signIn, signOut, useSession } from "next-auth/react";
//import Head from "next/head";
//import Link from "next/link";
//import Image from "next/image";
import { useState } from "react";
import Historical from "~/components/Historical";

//import { api } from "~/utils/api";

export default function Current() {
  const [dayValue, setDayValue] = useState(new Date());

  return (
    <>
      <div>
        {" "}
        <nav className="">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex h-16 items-center justify-between">
              <div className="flex items-center space-x-4">
                <a
                  className="rounded-md px-3 py-2 text-sm font-medium text-white"
                  href="#"
                  onClick={() =>
                    setDayValue(
                      new Date(new Date().setDate(new Date().getDate() - 1)),
                    )
                  }
                >
                  Yesterday
                </a>
                <a
                  className="rounded-md px-3 py-2 text-sm font-medium text-white"
                  href="#"
                  onClick={() => setDayValue(new Date())}
                >
                  Today
                </a>
                <a
                  className="rounded-md px-3 py-2 text-sm font-medium text-white"
                  href="#"
                  onClick={() =>
                    setDayValue(
                      new Date(new Date().setDate(new Date().getDate() + 1)),
                    )
                  }
                >
                  Tomorrow
                </a>
              </div>
            </div>
          </div>
        </nav>
        <div className="flex flex-col items-center justify-center gap-4">
          <Historical dayProp={dayValue} />
        </div>
      </div>
    </>
  );
}
