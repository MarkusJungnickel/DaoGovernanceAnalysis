import axios from "axios";
import fs from "fs";
import Web3 from "web3";
const provider =
  "https://mainnet.infura.io/v3/95e70ba790e649eeb37d25fc31e1662d";
const web3 = new Web3(provider);
const graph =
  "https://api.thegraph.com/subgraphs/name/odyssy-automaton/daohaus";
const id = "0x519f9662798c2e07fbd5b30c1445602320c5cf5b";
async function isContract(address: string) {
  const code = await web3.eth.getCode(address);
  return code != "0x";
}

async function proposalList() {
  //fs.unlinkSync("./proposals.csv");
  for (let i = 0; i < 3000; i += 1000) {
    await getProposals(i);
  }
}

async function getProposals(i: number): Promise<any> {
  let returnValue: any[] = [];
  const proposalsQuery = `{
    proposals(skip: ${i}, first: 1000, where: {moloch_:{id:"${id.toLowerCase()}"}}) {
      id
      didPass
      yesVotes
      noVotes
      yesShares
      noShares
      molochAddress
      createdAt
      proposer
      votes{
        id
      }
    }
  }
  
  `;
  await axios
    .post(graph, {
      query: proposalsQuery,
    })
    .then(async (res) => {
      const proposals: any[] = res.data.data.proposals;
      console.log(proposals.length);
      for (const prop of proposals) {
        fs.appendFileSync("./proposals.csv", prop.id + ","); // 0
        fs.appendFileSync("./proposals.csv", prop.molochAddress + ","); // 1
        fs.appendFileSync("./proposals.csv", prop.proposer + ","); // 2
        fs.appendFileSync("./proposals.csv", prop.createdAt + ","); // 3
        fs.appendFileSync("./proposals.csv", prop.yesVotes + ","); // 4
        fs.appendFileSync("./proposals.csv", prop.noVotes + ","); // 5
        fs.appendFileSync("./proposals.csv", prop.yesShares + ","); // 6
        fs.appendFileSync("./proposals.csv", prop.noShares + ","); //7
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
