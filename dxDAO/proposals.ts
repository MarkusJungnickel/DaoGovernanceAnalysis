import axios from "axios";
import fs from "fs";

import EthDater from "ethereum-block-by-date";
import { ethers } from "ethers";
import moment from "moment";
const provider = new ethers.providers.WebSocketProvider(
  "https://patient-crimson-wave.quiknode.pro/97c31f01dc8e96ff9a2997208a4fd86a31b4fce8/"
);
//https://thegraph.com/hosted-service/subgraph/daostack/v41_11
const dater = new EthDater(
  provider // Ethers provider, required.
);

function getProposals() {
  const proposalQ = `
  {
	proposals(first: 1000, where: {
    dao_:{
      id: "0x519b70055af55a007110b4ff99b0ea33071c720a"
    }
    }, orderBy: createdAt){
    title
    id
    dao {
      name
      id
    }
    url
    executionState
    createdAt
    votes{
      id
      reputation
    }
    winningOutcome
    stage
    votesFor
    votesAgainst
    stakes{
      id
      amount
    }
    stakesFor
    stakesAgainst
    confidence
    }
}`;

  axios
    .post("https://api.thegraph.com/subgraphs/name/daostack/v41_11", {
      query: proposalQ,
    })
    .then(async (res) => {
      var proposals = await res.data.data.proposals;
      console.log(`Number of proposals: ${proposals.length}`);
      fs.unlinkSync("./proposals.csv");
      fs.appendFileSync(
        "./proposals.csv",
        "executionState,createdAt,stage,votesFor,votesAgainst,outcome,stakesFor,stakesAgainst,confidence\n"
      );
      for (const prop of proposals) {
        // fs.appendFileSync(
        //   "./proposals.csv",
        //   '"' + prop.title.toString() + '",'
        // );
        //fs.appendFileSync("./proposals.csv", prop.id.toString() + ",");
        //fs.appendFileSync("./proposals.csv", prop.dao.name.toString() + ",");
        //fs.appendFileSync("./proposals.csv", prop.url.toString() + ",");
        // fs.appendFileSync(
        //   "./proposals.csv",
        //   prop.executionState.toString() + ","
        // );
        fs.appendFileSync("./proposals.csv", prop.createdAt.toString() + ",");
        fs.appendFileSync("./proposals.csv", prop.stage.toString() + ",");
        fs.appendFileSync(
          "./proposals.csv",
          Math.trunc(prop.votesFor * 10 ** -18).toString() + ","
        );
        fs.appendFileSync(
          "./proposals.csv",
          Math.trunc(prop.votesAgainst * 10 ** -18).toString() + ","
        );
        fs.appendFileSync(
          "./proposals.csv",
          prop.winningOutcome.toString() + ","
        );
        fs.appendFileSync(
          "./proposals.csv",
          Math.trunc(prop.stakesFor * 10 ** -18).toString() + ","
        );
        fs.appendFileSync(
          "./proposals.csv",
          Math.trunc(prop.stakesAgainst * 10 ** -18).toString() + ","
        );
        fs.appendFileSync("./proposals.csv", prop.confidence.toString() + ",");
        var totalRep = await getTotalReputation(prop.createdAt);
        totalRep = totalRep * 10 ** -18;
        totalRep = Math.trunc(totalRep);
        fs.appendFileSync("./proposals.csv", totalRep.toString());
        fs.appendFileSync("./proposals.csv", "\n");
      }
    })
    .catch((error) => {
      console.error(error);
    });
}

getProposals();

async function getTotalReputation(createdAt: any) {
  var returnValue: number = 0;
  const block = await dater.getDate(moment.unix(createdAt));
  const reputationQ = `{
        reputationContract(id: "0x7a927a93f221976aae26d5d077477307170f0b7c", block: {number: ${block.block.toString()}}){
            totalSupply
        }
    }`;
  await axios
    .post("https://api.thegraph.com/subgraphs/name/daostack/v41_11", {
      query: reputationQ,
    })
    .then(async (res) => {
      returnValue = await res.data.data.reputationContract.totalSupply;
    })
    .catch((error) => {
      console.log(error);
    });
  return returnValue;
}
