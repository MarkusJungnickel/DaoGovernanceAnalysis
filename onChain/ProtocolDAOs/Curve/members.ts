import axios from "axios";
import fs from "fs";
import Web3 from "web3";
import { CURVE_ABI } from "../../../ABIs";
const provider =
  "https://patient-crimson-wave.quiknode.pro/97c31f01dc8e96ff9a2997208a4fd86a31b4fce8/";
const web3Provider = new Web3.providers.HttpProvider(provider);
const web3 = new Web3(provider);
const addressCurve = "0x5f3b5DfEb7B28CDbD7FAba78963EE202a494e2A2";
const contract = new web3.eth.Contract(CURVE_ABI, addressCurve);
const graph =
  "https://gateway.thegraph.com/api/a6762a21a063157f59538cc13c3ac3bd/subgraphs/id/4yx4rR6Kf8WH4RJPGhLSHojUxJzRWgEZb51iTran1sEG";

async function isContract(address: string) {
  const code = await web3.eth.getCode(address);
  return code != "0x";
}

async function totalSupply() {
  const supply = await contract.methods.totalSupply().call();
  console.log(supply);
}
async function getBalance(address: string): Promise<Number> {
  let returnValue = 0;
  await contract.methods
    .balanceOf(address)
    .call()
    .then((balance: number) => {
      returnValue = balance;
      console.log("balance: ", balance);
    });
  console.log("return: ", returnValue);
  return returnValue;
}

async function memberList(): Promise<any> {
  fs.unlinkSync("./members.csv");
  for (let i = 0; i < 70000; i += 1000) {
    const members = ` {
      accounts(skip: ${i}, first: 1000){
        id
        address
      }
  }`;
    await axios
      .post(graph, {
        query: members,
      })
      .then(async (res) => {
        const members = res.data.data.accounts;
        console.log(members.length);
        for (const member of members) {
          // var memberType = await isContract(member.memberAddress.toString());
          // var type = 0;
          // if (memberType) {
          //   type = 1;
          // }
          const balance = await getBalance(member.address);
          fs.appendFileSync("./members.csv", member.id + ",");
          fs.appendFileSync("./members.csv", member.address + ",");
          fs.appendFileSync("./members.csv", balance.toString());
          fs.appendFileSync("./members.csv", "\n");
        }
      })
      .catch((error) => {
        console.error(error);
      });
  }
}

memberList();
totalSupply();
