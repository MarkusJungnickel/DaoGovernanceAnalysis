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

async function getProposals() {
  fs.unlinkSync("./proposalVotes.csv");
  const proposal = ` {
    proposals(first: 1000){
        id
        createdAtBlock
        creator {
          address
        }
        executed
        voteCount
        positiveVoteCount
        negativeVoteCount
        votes{
          voter{
            address
          }
        }
        
      }
    }`;
  await axios
    .post(
      "https://gateway.thegraph.com/api/a76162906e44ca75fdbdfea7899b9b81/subgraphs/id/4yx4rR6Kf8WH4RJPGhLSHojUxJzRWgEZb51iTran1sEG",
      {
        query: proposal,
      }
    )
    .then(async (res) => {
      const proposals = res.data.data.proposals;
      //writeProposalSummary(proposals);
      for (const proposal of proposals) {
        fs.appendFileSync("./proposalVotes.csv", proposal.id + ",");
        const votes = proposal.votes;
        for (const vot of votes) {
          fs.appendFileSync("./proposalVotes.csv", vot.voter.address + ",");
        }
        fs.appendFileSync("./proposalVotes.csv", "\n");
      }
    })
    .catch((error) => {
      console.error(error);
    });
}

getProposals();

function writeProposalSummary(proposals: any) {
  for (const proposal of proposals) {
    fs.appendFileSync("./proposals.csv", proposal.id + ",");
    fs.appendFileSync("./proposals.csv", proposal.createdAtBlock + ",");
    fs.appendFileSync("./proposals.csv", proposal.creator.address + ",");
    fs.appendFileSync("./proposals.csv", proposal.voteCount + ",");
    fs.appendFileSync("./proposals.csv", proposal.positiveVoteCount + ",");
    fs.appendFileSync("./proposals.csv", proposal.negativeVoteCount + "\n");
  }
}
