import axios from "axios";
import fs from "fs";
import Web3 from "web3";
const provider =
  "https://mainnet.infura.io/v3/95e70ba790e649eeb37d25fc31e1662d";
const web3 = new Web3(provider);
const graph = "https://api.thegraph.com/subgraphs/name/aave/governance-v2";

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
  const proposalsQuery = `{
    proposals(skip: ${i}, first: 1000) {
      id
      govContract
      state
      creator
      totalCurrentVoters
      currentYesVote
      currentNoVote
      totalVotingSupply
      winner
      startBlock
      votes{
        id
        votingPower
        support
      }
      
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
          if (vote.support == true) {
            votesForCount += 1;
          } else {
            votesAgainstCount += 1;
          }
        });

        fs.appendFileSync("./proposals.csv", prop.id + ","); // 0
        fs.appendFileSync("./proposals.csv", prop.govContract + ","); // 1
        fs.appendFileSync("./proposals.csv", prop.state + ","); // 2
        fs.appendFileSync("./proposals.csv", prop.startBlock + ","); // 3
        fs.appendFileSync("./proposals.csv", votesForCount + ","); // 4
        fs.appendFileSync("./proposals.csv", votesAgainstCount + ","); // 5
        fs.appendFileSync("./proposals.csv", prop.currentYesVote + ","); // 6
        fs.appendFileSync("./proposals.csv", prop.currentNoVote + ","); //7
        fs.appendFileSync("./proposals.csv", prop.totalVotingSupply + ","); //8
        fs.appendFileSync("./proposals.csv", prop.totalCurrentVoters + ","); //9
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
