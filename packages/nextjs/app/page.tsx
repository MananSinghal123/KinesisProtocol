"use client";

import type { NextPage } from "next";
import KHome from "~~/components/kinesisprotocol/KHome";

const Home: NextPage = () => {
  return (
    <>
      <div className="flex items-center bg-white flex-col flex-grow">
        <KHome />
      </div>
    </>
  );
};

export default Home;
