import axios from "axios";
import fs from "fs";
import Web3 from "web3";
const provider =
  "https://patient-crimson-wave.quiknode.pro/97c31f01dc8e96ff9a2997208a4fd86a31b4fce8/";
const web3 = new Web3(provider);
const addressDX = "0x519b70055af55A007110B4Ff99b0eA33071c720a";

function getProposals() {
  const proposalQ = `
	{
        proposals(first: 1000, where:{
          dao: "0x519b70055af55a007110b4ff99b0ea33071c720a"
        }){
          id
          votes {
            id
            voter
            reputation
            }
        }
    }`;

  axios
    .post("https://api.thegraph.com/subgraphs/name/daostack/v41_11", {
      query: proposalQ,
    })
    .then(async (res) => {
      var proposals = await res.data.data.proposals;
      console.log(`Number of proposals: ${proposals.length}`);
      fs.unlinkSync("./proposalVotes.csv");
      for (const prop of proposals) {
        console.log(prop.votes.length);
        fs.appendFileSync("./proposalVotes.csv", prop.id + ",");
        prop.votes.forEach((vote: { voter: string }) => {
          fs.appendFileSync("./proposalVotes.csv", vote.voter + ",");
        });
        fs.appendFileSync("./proposalVotes.csv", "\n");
      }
    })
    .catch((error) => {
      console.error(error);
    });
}

getProposals();
