import axios from "axios";
import fs from "fs";
import Web3 from "web3";
const provider =
  "https://mainnet.infura.io/v3/95e70ba790e649eeb37d25fc31e1662d";
const web3 = new Web3(provider);
// https://gateway.thegraph.com/api/666c393731a829e1d49fc519fa06c487/subgraphs/id/5ToBwdgzuTF11UNfBMGjZUFdJ3LG2foDky4v1mhctFNX
const graph =
  "https://api.thegraph.com/subgraphs/name/odyssy-automaton/daohaus";

async function sharesOverTime() {
  let start = 9500000;
  const members = await memberList();
  fs.unlinkSync("./sharesTime.csv");
  for (let i = start; i <= 15341842; i += 100000) {
    fs.appendFileSync("./sharesTime.csv", i + ",");
    for (let j = 0; j < members.length; j++) {
      await getSharesAtBlock(i, members[j]);
    }
    fs.appendFileSync("./sharesTime.csv", "\n");
  }
}

async function isContract(address: string) {
  const code = await web3.eth.getCode(address);
  return code != "0x";
}

async function memberList(): Promise<any> {
  let returnValue: any[] = [];
  const members = `{
    moloches(first: 1, where: {
      id:"0x4570b4faf71e23942b8b9f934b47ccedf7540162"
    }) {
      id
      version
      summoner
      newContract
      members{
        id
        memberAddress
        shares
        createdAt
        votes {
          proposal{
            proposalIndex
            proposalId
          }
          molochAddress
          id
          uintVote
        }
      }
    }}`;
  await axios
    .post(graph, {
      query: members,
    })
    .then(async (res) => {
      fs.unlinkSync("./votingPower.csv");
      console.log(res.data.data.moloches[0].members);
      const members: any[] = res.data.data.moloches[0].members;
      console.log(members.length);
      for (const member of members) {
        var memberType = await isContract(member.memberAddress.toString());
        var type = 0;
        if (memberType) {
          type = 1;
        }
        fs.appendFileSync("./votingPower.csv", member.id + ",");
        fs.appendFileSync("./votingPower.csv", member.memberAddress + ",");
        fs.appendFileSync("./votingPower.csv", member.shares + ",");
        fs.appendFileSync("./votingPower.csv", member.createdAt + ",");
        fs.appendFileSync("./votingPower.csv", type.toString());
        fs.appendFileSync("./votingPower.csv", "\n");
      }
      returnValue = members;
    })
    .catch((error) => {
      console.error(error);
    });
  return returnValue;
}

async function getSharesAtBlock(blockNumber: number, member: any) {
  console.log(blockNumber);
  console.log(member.id);
  const votingPower = `
  {
    member(block: {number: ${blockNumber}}, id: "${member.id}"){
      id
      shares
    }
  }`;

  await axios
    .post(graph, {
      query: votingPower,
    })
    .then(async (res) => {
      let shares = 0;
      try {
        shares = res.data.data.member.shares;
      } catch {
        shares = 0;
      }
      fs.appendFileSync("./sharesTime.csv", shares + ",");
    })
    .catch((error) => {
      console.error(error);
    });
}

sharesOverTime();
//memberList();
