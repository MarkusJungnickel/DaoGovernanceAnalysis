import Web3 from "web3";
import { AbiItem } from "web3-utils";
import { DXDAO_ABI, LAO_ABI } from "../ABIs";
import fs from "fs";
const provider =
  "https://patient-crimson-wave.quiknode.pro/97c31f01dc8e96ff9a2997208a4fd86a31b4fce8/";
const web3Provider = new Web3.providers.HttpProvider(provider);
const web3 = new Web3(provider);
const addressLAO = "0x8F56682a50BECB1df2Fb8136954f2062871bc7fc";
const addressDX = "0x519b70055af55A007110B4Ff99b0eA33071c720a";

//const contractAbi = require("./ABIs/LAO.json");

const contract = new web3.eth.Contract(LAO_ABI, addressLAO);

const addr = "0x2afb58a22e7d3c241ab7b9a1f68b9e8e74ec9d68";
async function getPastEvents() {
  fs.unlinkSync("./votes.csv");
  fs.appendFileSync(
    "./votes.csv",
    "memberAddress,DelegateKey,proposalId,proposalIndex,address,blockNumber,vote\n"
  );
  for (var i = 9000000; i <= 15000000; i += 10000) {
    await contract
      .getPastEvents("SubmitVote", {
        fromBlock: i,
        toBlock: i + 9999,
      })
      .then((events) => {
        events.forEach((event) => {
          const propId = event.returnValues.proposalId;
          const memberId = event.returnValues.memberAddress;
          const vote = event.returnValues.uintVote;
          const delegateKey = event.returnValues.delegateKey;
          const propIdx = event.returnValues.proposalIndex;
          const address = event.address;
          const blockNo = event.blockNumber;
          fs.appendFileSync("./votes.csv", memberId + ",");
          fs.appendFileSync("./votes.csv", delegateKey + ",");
          fs.appendFileSync("./votes.csv", propId + ",");
          fs.appendFileSync("./votes.csv", propIdx + ",");
          fs.appendFileSync("./votes.csv", address + ",");
          fs.appendFileSync("./votes.csv", blockNo + ",");
          fs.appendFileSync("./votes.csv", vote + ",");
          fs.appendFileSync("./votes.csv", "\n");
          //console.log("Member: ", memberId, "Proposal: ", propId, "Vote: ", vote);
        });
      });
  }
}

getPastEvents();
