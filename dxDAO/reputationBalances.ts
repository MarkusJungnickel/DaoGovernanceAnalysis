import axios from "axios";
import fs from "fs";
import Web3 from "web3";
import { isContractAddressInBloom } from "web3-utils";
const provider =
  "https://patient-crimson-wave.quiknode.pro/97c31f01dc8e96ff9a2997208a4fd86a31b4fce8/";
const web3 = new Web3(provider);
var errorCount: number = 0;

const avatarQ = `
{
  avatarContract(id: "0x519b70055af55a007110b4ff99b0ea33071c720a"){
    name
    nativeToken
    nativeReputation
    balance
  }
}  
`;

async function isContract(address: string) {
  const code = await web3.eth.getCode(address);
  return code != "0x";
}

function getRepHolder() {
  const reputationQ = `
    {
      reputationContract(id: "0x7a927a93f221976aae26d5d077477307170f0b7c"){
        totalSupply,
        reputationHolders
      }
    }  
    `;

  axios
    .post("https://api.thegraph.com/subgraphs/name/daostack/v41_11", {
      query: reputationQ,
    })
    .then(async (res) => {
      var sum: number = 0;
      fs.unlinkSync("./reputationBalances.csv");
      fs.appendFileSync(
        "./reputationBalances.csv",
        "id,address,contract,balance,createdAt,isContract\n"
      );
      for (var i = 0; i < 2700; i++) {
        var balance = await getReputationBalance(
          res.data.data.reputationContract.reputationHolders[i]
        );
        sum = sum + balance;
        console.log(`Completed ${i} of 2700\n`);
      }
      console.log(
        `The added sum is ${sum}, and the total supply is ${
          res.data.data.reputationContract.totalSupply * 10 ** -18
        }\nThe difference is ${
          sum - res.data.data.reputationContract.totalSupply * 10 ** -18
        }`
      );
      console.log(`Error count ${errorCount}`);
    })
    .catch((error) => {
      console.error(error);
    });
}

async function getReputationBalance(reputationHolder: any) {
  var returnValue: number = 0;
  const reputationQ = `
    {
      reputationHolder(id: "${reputationHolder}"){
        id
        contract
        address
        balance
        createdAt
      }
    }  
    `;
  await axios
    .post("https://api.thegraph.com/subgraphs/name/daostack/v41_11", {
      query: reputationQ,
    })
    .then(async (res) => {
      var balance: number = await res.data.data.reputationHolder.balance;
      balance *= 10 ** -18;
      balance = Math.trunc(balance);
      var id: string = await res.data.data.reputationHolder.id;
      var address: string = await res.data.data.reputationHolder.address;
      var createdAt: string = await res.data.data.reputationHolder.createdAt;
      var contract: string = await res.data.data.reputationHolder.contract;
      var addressType: string = (await isContract(address)).toString();
      fs.appendFileSync("./reputationBalances.csv", id.toString() + ",");
      fs.appendFileSync("./reputationBalances.csv", address.toString() + ",");
      fs.appendFileSync("./reputationBalances.csv", contract.toString() + ",");
      fs.appendFileSync("./reputationBalances.csv", balance.toString() + ",");
      fs.appendFileSync("./reputationBalances.csv", createdAt.toString() + ",");
      fs.appendFileSync("./reputationBalances.csv", addressType);
      fs.appendFileSync("./reputationBalances.csv", "\n");
      returnValue = Number(balance);
    })
    .catch((error) => {
      errorCount += 1;
      console.log(error);
    });
  return returnValue;
}

getRepHolder();
