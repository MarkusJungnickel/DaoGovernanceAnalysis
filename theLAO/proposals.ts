import axios from "axios";
import fs from "fs";

import EthDater from "ethereum-block-by-date";
import { ethers } from "ethers";
import moment from "moment";
import { exit } from "process";
const provider = new ethers.providers.WebSocketProvider(
  "https://patient-crimson-wave.quiknode.pro/97c31f01dc8e96ff9a2997208a4fd86a31b4fce8/"
);

const dater = new EthDater(
  provider // Ethers provider, required.
);

async function getVotes() {
  const proposals = `
  {
    proposals(first:1000, where: {
     moloch: "0x8f56682a50becb1df2fb8136954f2062871bc7fc"
   }
   ){
     id
     yesVotes
     noVotes
     didPass
     votes{
       id
     }
   }
   }`;

  await axios
    .post(
      "https://gateway.thegraph.com/api/666c393731a829e1d49fc519fa06c487/subgraphs/id/5ToBwdgzuTF11UNfBMGjZUFdJ3LG2foDky4v1mhctFNX",
      {
        query: proposals,
      }
    )
    .then(async (res) => {
      const proposals = await res.data.data.proposals;
      proposals.forEach(
        (prop: { didPass: any; yesVotes: any; noVotes: any }) => {
          console.log(prop.didPass);
          console.log(prop.yesVotes);
          console.log(prop.noVotes);
        }
      );
    })
    .catch((error) => {
      console.error(error);
    });
}

getVotes();
