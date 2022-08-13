import axios from "axios";
import Web3 from "web3";
import fs from "fs";
import { exit } from "process";
import { CURVE_ABI } from "../ABIs";
import { toHex } from "web3-utils";
const provider =
  "https://patient-crimson-wave.quiknode.pro/97c31f01dc8e96ff9a2997208a4fd86a31b4fce8/";
const web3Provider = new Web3.providers.HttpProvider(provider);
const web3 = new Web3(provider);
const addressCurve = "0x5f3b5DfEb7B28CDbD7FAba78963EE202a494e2A2";
const contract = new web3.eth.Contract(CURVE_ABI, addressCurve);
web3.eth.handleRevert = true;

async function isContract(address: string) {
  const code = await web3.eth.getCode(address);
  return code != "0x";
}
async function getBalance(address: string, block: number): Promise<Number> {
  let returnValue = 0;
  //const gas = await contract.methods.balanceOfAt(address, block).estimateGas();
  // console.log("Gas: ", gas);
  await contract.methods
    .balanceOfAt(address, block)
    .call({})
    .then((balance: number) => {
      returnValue = balance;
    });
  return returnValue;
}

async function memberList(): Promise<any> {
  //fs.unlinkSync("./shareTime.csv");
  let count = 0;
  for (let i = 10647812; i <= 15107743; i += 500000) {
    fs.appendFileSync("./shareTime.csv", i + ",");
    for (let j = 0; j < 70000; j += 1000) {
      const members = ` {
        accounts(skip: ${j}, first: 1000){
          id
          address
        }
      }`;
      await axios
        .post(
          "https://gateway.thegraph.com/api/a76162906e44ca75fdbdfea7899b9b81/subgraphs/id/4yx4rR6Kf8WH4RJPGhLSHojUxJzRWgEZb51iTran1sEG",
          {
            query: members,
          }
        )
        .then(async (res) => {
          const members = res.data.data.accounts;
          // var memberType = await isContract(member.memberAddress.toString());
          // var type = 0;
          // if (memberType) {
          //   type = 1;
          // }

          for (const member of members) {
            count += 1;
            const balance = await getBalance(member.address, i);
            fs.appendFileSync("./shareTime.csv", balance + ",");
          }
          console.log(count);
        })
        .catch((error) => {
          console.error(error);
        });
    }
    fs.appendFileSync("./shareTime.csv", "\n");
  }
}

memberList();
//getBalance("0x989aeb4d175e16225e39e87d0d97a3360524ad80", 10647812);
