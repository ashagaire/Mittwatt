import { useEffect, useMemo } from "react";
import { api } from "~/utils/api";

export default function Home() {
  return (
    <>
      <div className="container rounded-xl bg-green-100 p-20 text-left">
        <p className="pb-4 text-3xl font-bold">What is MittWatt?</p>
        <p className="pb-12 text-2xl">
          Your trusted partner in making data-driven decisions in the energy
          market. Our state-of-the-art platform leverages advanced machine
          learning algorithms to predict future electricity prices based on
          historical data. Whether you're an energy trader, a utility provider,
          or an industrial consumer, our tool can help you optimize your energy
          strategy and maximize your profits.
        </p>
        <p className="pb-4 text-3xl font-bold">What does it contain?</p>
        <ul className="list-disc pb-6 text-2xl">
          <li>
            <span className="font-bold">Current: </span>
            The current price of electricity in the Finnish market.
          </li>
          <li>
            <span className="font-bold">Past: </span>
            Statistics on the past 14 days of electricity prices.
          </li>
          <li>
            <span className="font-bold">Future: </span>
            Predictions on the next 14 days of electricity prices.
          </li>
        </ul>
      </div>
    </>
  );
}
