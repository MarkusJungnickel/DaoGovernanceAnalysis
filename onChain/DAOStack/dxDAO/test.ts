import axios from "axios";
import fs from "fs";

import EthDater from "ethereum-block-by-date";
import { ethers } from "ethers";
import moment from "moment";
const provider = new ethers.providers.WebSocketProvider(
  "https://patient-crimson-wave.quiknode.pro/97c31f01dc8e96ff9a2997208a4fd86a31b4fce8/"
);

const dater = new EthDater(
  provider // Ethers provider, required.
);

async function getProposals() {
  const daoQ = `
  {
    dao(id: "0x519b70055af55a007110b4ff99b0ea33071c720a"){
      name
      nativeReputation {
        totalSupply
      }
      proposals {
        id
      }
      reputationHoldersCount
    }
  }`;

  await axios
    .post("https://api.thegraph.com/subgraphs/name/daostack/v41_11", {
      query: daoQ,
    })
    .then(async (res) => {
      const prop = await res.data.data.dao.proposals;
      console.log(prop.length);
    })
    .catch((error) => {
      console.error(error);
    });
  console.log("test");
}

getProposals();
