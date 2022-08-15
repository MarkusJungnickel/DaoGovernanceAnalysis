import axios from "axios";
import fs from "fs";
import Web3 from "web3";
const provider =
  "https://mainnet.infura.io/v3/95e70ba790e649eeb37d25fc31e1662d";
const web3 = new Web3(provider);
const graph =
  "https://api.thegraph.com/subgraphs/name/odyssy-automaton/daohaus";

async function isContract(address: string) {
  const code = await web3.eth.getCode(address);
  return code != "0x";
}

async function memberList() {
  fs.unlinkSync("./members.csv");
  for (let i = 0; i < 3000; i += 1000) {
    await getMembers(i);
  }
}

async function getMembers(i: number): Promise<any> {
  let returnValue: any[] = [];
  const members = `{
    members(skip: ${i}, first: 1000) {
      id
      shares
      memberAddress
      molochAddress
      createdAt
      votes{
        id
      }
    }
  }`;
  await axios
    .post(graph, {
      query: members,
    })
    .then(async (res) => {
      const members: any[] = res.data.data.members;
      console.log(members.length);
      for (const member of members) {
        var memberType = await isContract(member.memberAddress.toString());
        var numberOfVotes = member.votes.length;
        var type = 0;
        if (memberType) {
          type = 1;
        }
        fs.appendFileSync("./members.csv", member.id + ",");
        fs.appendFileSync("./members.csv", member.memberAddress + ",");
        fs.appendFileSync("./members.csv", member.shares + ",");
        fs.appendFileSync("./members.csv", member.molochAddress + ",");
        fs.appendFileSync("./members.csv", numberOfVotes + ",");
        // fs.appendFileSync("./members.csv", member.votes.toString() + ",");
        fs.appendFileSync("./members.csv", member.createdAt + ",");
        fs.appendFileSync("./members.csv", type.toString());
        fs.appendFileSync("./members.csv", "\n");
      }
      returnValue = members;
    })
    .catch((error) => {
      console.error(error);
    });
  return returnValue;
}

memberList();
