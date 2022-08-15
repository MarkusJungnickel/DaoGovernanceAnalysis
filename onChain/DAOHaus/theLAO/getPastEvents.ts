import Web3 from "web3";
import { LAO_ABI } from "../../../ABIs";
const provider =
  "https://patient-crimson-wave.quiknode.pro/97c31f01dc8e96ff9a2997208a4fd86a31b4fce8/";
const web3Provider = new Web3.providers.HttpProvider(provider);
const web3 = new Web3(provider);
const addressLAO = "0x8F56682a50BECB1df2Fb8136954f2062871bc7fc";
const addressDX = "0x519b70055af55A007110B4Ff99b0eA33071c720a";

//const contractAbi = require("./ABIs/LAO.json");

const contract = new web3.eth.Contract(LAO_ABI, addressLAO);

async function getPastEvents() {
  //console.log(contract.methods.proposalCount());
  // await contract
  //   .getPastEvents("SendEther")
  //   .then((events) => {
  //     console.log(events);
  //   })
  //   .catch((error) => {
  //     console.log(error);
  //   });

  // const result = await contract.methods.nativeReputation().call();
  // console.log(result);

  for (var i = 14000000; i <= 15000000; i += 10000) {
    await contract
      .getPastEvents("allEvents", { fromBlock: i, toBlock: i + 9999 })
      .then((event) => {
        console.log(event);
      });
  }
}

getPastEvents();
