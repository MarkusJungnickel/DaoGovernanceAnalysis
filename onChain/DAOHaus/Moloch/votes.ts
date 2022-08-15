import fs from "fs";
import Web3 from "web3";
import { MOLOCH_ABI } from "../../../ABIs";
const provider =
  "https://mainnet.infura.io/v3/95e70ba790e649eeb37d25fc31e1662d";
const web3Provider = new Web3.providers.HttpProvider(provider);
const web3 = new Web3(provider);
// const addressMoloch = "0x1fd169A4f5c59ACf79d0Fd5d91D1201EF1Bce9f1";
const addressMoloch = "0x519F9662798c2E07fbd5B30C1445602320C5cF5B";
const contract = new web3.eth.Contract(MOLOCH_ABI, addressMoloch);

async function getPastEvents() {
  fs.unlinkSync("./votes.csv");
  for (var i = 13139836; i <= 15341842; i += 10000) {
    await contract
      .getPastEvents("SubmitVote", {
        fromBlock: i,
        toBlock: i + 9999,
      })
      .then((events) => {
        console.log(events);
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
