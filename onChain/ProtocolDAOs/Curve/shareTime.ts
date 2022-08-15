import axios from "axios";
import fs from "fs";
import Web3 from "web3";
import { CURVE_ABI } from "../../../ABIs";
var gini = require("gini");
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
  // fs.unlinkSync("./shareTime2.csv");
  // fs.unlinkSync("./gini.csv");
  let count = 0;
  for (let i = 12500000; i <= 15107743; i += 500000) {
    fs.appendFileSync("./shareTime2.csv", i + ",");
    let balances: Number[] = [];
    for (let j = 0; j < 70000; j += 1000) {
      const members = ` {
        accounts(skip: ${j}, first: 1000, block: {number: ${i}}){
          id
          address
        }
      }`;
      await axios
        .post(
          "https://gateway.thegraph.com/api/a6762a21a063157f59538cc13c3ac3bd/subgraphs/id/4yx4rR6Kf8WH4RJPGhLSHojUxJzRWgEZb51iTran1sEG",
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
            balances.push(balance);
            fs.appendFileSync("./shareTime2.csv", balance + ",");
          }

          console.log(count);
        })
        .catch((error) => {
          console.error(error);
        });
    }
    if (balances.length > 0) {
      const coefficients = getCos(balances);
      console.log(coefficients);
      fs.appendFileSync("./gini.csv", i + ",");
      fs.appendFileSync("./gini.csv", balances.length + ",");
      fs.appendFileSync("./gini.csv", coefficients[0] + ",");
      fs.appendFileSync("./gini.csv", coefficients[1] + ",");
      fs.appendFileSync("./gini.csv", "\n");
    }
    fs.appendFileSync("./shareTime2.csv", "\n");
  }
}

memberList();

function getCos(balances: Number[]) {
  let coefficients = [];
  coefficients[0] = gini.unordered(balances);
  balances.sort((one, two) => (one > two ? -1 : 1));
  let combinedShares = 0;
  let totalShares: number = 0;
  let balancesN: number[] = [];
  balances.forEach((balance) => {
    let num = parseInt(balance.toString());
    balancesN.push(num);
    totalShares = totalShares + num;
  });
  console.log("totalShares: ", totalShares);
  console.log("max: ", Math.max(...balancesN));
  for (let i = 0; i < balances.length; i += 1) {
    combinedShares += parseInt(balances[i].toString());
    if (combinedShares / totalShares.valueOf() > 0.5) {
      coefficients[1] = i;
      break;
    }
  }
  return coefficients;
}

//getBalance("0x989aeb4d175e16225e39e87d0d97a3360524ad80", 10647812);
