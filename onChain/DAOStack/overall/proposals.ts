import axios from "axios";
import fs from "fs";
import Web3 from "web3";
const provider =
  "https://mainnet.infura.io/v3/95e70ba790e649eeb37d25fc31e1662d";
const web3 = new Web3(provider);
const graph = "https://api.thegraph.com/subgraphs/name/daostack/v41_11";

async function isContract(address: string) {
  const code = await web3.eth.getCode(address);
  return code != "0x";
}

async function proposalList() {
  fs.unlinkSync("./proposals.csv");
  for (let i = 0; i < 3000; i += 1000) {
    await getProposals(i);
  }
}

async function getProposals(i: number): Promise<any> {
  let returnValue: any[] = [];
  const proposalsQuery = `
  {
	proposals(skip: ${i}, first: 1000){
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
      outcome
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
  await axios
    .post(graph, {
      query: proposalsQuery,
    })
    .then(async (res) => {
      const proposals: any[] = res.data.data.proposals;
      console.log(proposals.length);
      for (const prop of proposals) {
        let votesAgainstCount = 0;
        let votesForCount = 0;
        prop.votes.forEach((vote: any) => {
          if (vote.outcome == "Pass") {
            votesForCount += 1;
          } else {
            votesAgainstCount += 1;
          }
        });
        let stakesCountAgainst = 0;
        let stakesCountFor = 0;
        prop.stakes.forEach((stake: any) => {
          if (stake.outcome == "Pass") {
            stakesCountFor += 1;
          } else {
            stakesCountAgainst += 1;
          }
        });
        fs.appendFileSync("./proposals.csv", prop.id + ","); // 0
        fs.appendFileSync("./proposals.csv", prop.dao.id + ","); // 1
        fs.appendFileSync("./proposals.csv", prop.dao.winningOutcome + ","); // 2
        fs.appendFileSync("./proposals.csv", prop.createdAt + ","); // 3
        fs.appendFileSync("./proposals.csv", votesForCount + ","); // 4
        fs.appendFileSync("./proposals.csv", votesAgainstCount + ","); // 5
        fs.appendFileSync("./proposals.csv", prop.votesFor + ","); // 6
        fs.appendFileSync("./proposals.csv", prop.votesAgainst + ","); //7
        fs.appendFileSync("./proposals.csv", stakesCountFor + ","); // 8
        fs.appendFileSync("./proposals.csv", stakesCountAgainst + ","); //9
        fs.appendFileSync("./proposals.csv", prop.stakesFor + ","); // 10
        fs.appendFileSync("./proposals.csv", prop.stakesAgainst + ","); //11
        fs.appendFileSync("./proposals.csv", "\n");
      }
      returnValue = proposals;
    })
    .catch((error) => {
      console.error(error);
    });
  return returnValue;
}

proposalList();
