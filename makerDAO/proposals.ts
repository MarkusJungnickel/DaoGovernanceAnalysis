import axios from "axios";
import Web3 from "web3";
import fs from "fs";
import { exit } from "process";
import { MAKER_CHIEF } from "../ABIs";
const provider =
  "https://patient-crimson-wave.quiknode.pro/97c31f01dc8e96ff9a2997208a4fd86a31b4fce8/";
const web3Provider = new Web3.providers.HttpProvider(provider);
const web3 = new Web3(provider);
const addressChief = "0x0a3f6849f78076aefaDf113F5BED87720274dDC0";
const contract = new web3.eth.Contract(MAKER_CHIEF, addressChief);

async function memberList(): Promise<any> {
  //fs.unlinkSync("./proposals.csv");
  const proposals = `{
      accountBalances(first: 1000, where: {id_gte: "${lastId}"}){
        amount
        id
        account{
          address
        }
      }
    }`;
  await axios
    .post("https://api.thegraph.com/subgraphs/name/protofire/mkr-registry", {
      query: proposals,
    })
    .then(async (res) => {
      const members = res.data.data.accountBalances;
      for (const member of members) {
        count += 1;
        const lockedAmount = await locked(member.account.address);
        fs.appendFileSync("./proposals.csv", member.id + ",");
        fs.appendFileSync("./proposals.csv", member.amount + ",");
        fs.appendFileSync("./proposals.csv", lockedAmount + "\n");
      }
    })
    .catch((error) => {
      console.error(error);
    });
}
