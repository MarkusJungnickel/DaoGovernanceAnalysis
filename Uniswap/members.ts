import axios from "axios";
import Web3 from "web3";
import fs from "fs";
import { exit } from "process";
const provider =
  "https://patient-crimson-wave.quiknode.pro/97c31f01dc8e96ff9a2997208a4fd86a31b4fce8/";
const web3Provider = new Web3.providers.HttpProvider(provider);
const web3 = new Web3(provider);

async function memberList(): Promise<any> {
  //fs.unlinkSync("./members.csv");
  let count = 0;
  let lastId = "0xffffffff37d2d839f3b4f7dbb9630463655fc04f";
  while (true) {
    const members = `{
        tokenHolders(first: 1000, where: {
          id_gt: "${lastId}"
        }) {
          id
          tokenBalance
          tokenBalanceRaw
        }
      }`;
    await axios
      .post(
        "https://api.thegraph.com/subgraphs/name/ianlapham/governance-tracking",
        {
          query: members,
        }
      )
      .then(async (res) => {
        try {
          const members = res.data.data.tokenHolders;
          for (const member of members) {
            count += 1;
            fs.appendFileSync("./members.csv", member.id + ",");
            fs.appendFileSync("./members.csv", member.tokenBalance + "\n");
            lastId = member.id;
          }
        } catch (error) {
          console.log(error);
          console.log(count);
          exit(1);
        }
      })
      .catch((error) => {
        console.error(error);
      });
  }
}

memberList();
