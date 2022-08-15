import axios from "axios";
import fs from "fs";
import { exit } from "process";
import Web3 from "web3";
import { MAKER_CHIEF } from "../../../ABIs";
const provider =
  "https://patient-crimson-wave.quiknode.pro/97c31f01dc8e96ff9a2997208a4fd86a31b4fce8/";
const web3Provider = new Web3.providers.HttpProvider(provider);
const web3 = new Web3(provider);
const addressChief = "0x0a3f6849f78076aefaDf113F5BED87720274dDC0";
const contract = new web3.eth.Contract(MAKER_CHIEF, addressChief);

async function locked(address: any): Promise<Number> {
  let returnValue: number = 0;
  await contract.methods
    .deposits(address)
    .call()
    .then((balance: number) => {
      returnValue = balance;
    });
  if (returnValue != 0) {
    console.log(returnValue);
  }

  return returnValue;
}

async function memberList(): Promise<any> {
  //fs.unlinkSync("./members.csv");
  let count = 0;
  let lastId =
    "0x0000000000000000000000000000000000000000-0x9f8f72aa9304c8b593d555f12ef6589cc3a579a2";
  while (true) {
    const members = `{
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
        query: members,
      })
      .then(async (res) => {
        try {
          const members = res.data.data.accountBalances;
          for (const member of members) {
            count += 1;
            const lockedAmount = await locked(member.account.address);
            fs.appendFileSync("./members.csv", member.id + ",");
            fs.appendFileSync("./members.csv", member.amount + ",");
            fs.appendFileSync("./members.csv", lockedAmount + "\n");
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
