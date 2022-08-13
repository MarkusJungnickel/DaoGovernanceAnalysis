import axios from "axios";
import Web3 from "web3";
import fs from "fs";
const provider =
  "https://patient-crimson-wave.quiknode.pro/97c31f01dc8e96ff9a2997208a4fd86a31b4fce8/";
const web3Provider = new Web3.providers.HttpProvider(provider);
const web3 = new Web3(provider);

async function isContract(address: string) {
  const code = await web3.eth.getCode(address);
  return code != "0x";
}

async function getVotes() {
  const votingPower = `
  {
    governanceInfos(first: 1
    ){
      id
      countProxies
      countAddresses
      countLock
      countFree
      locked
    }
  }`;

  await axios
    .post(
      "https://api.thegraph.com/subgraphs/name/protofire/makerdao-governance",
      {
        query: votingPower,
      }
    )
    .then(async (res) => {
      const info = res.data.data.governanceInfos[0];
      console.log(
        `Proxy Count: ${info.countProxies}, Address Count: ${info.countAddresses}, countLock: ${info.countLock}, countFree: ${info.countFree}, locked: ${info.locked}`
      );
    })
    .catch((error) => {
      console.error(error);
    });
}

getVotes();
