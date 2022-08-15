import axios from "axios";
import fs from "fs";
import Web3 from "web3";
const provider =
  "https://mainnet.infura.io/v3/95e70ba790e649eeb37d25fc31e1662d";
const web3Provider = new Web3.providers.HttpProvider(provider);
const web3 = new Web3(provider);
// https://gateway.thegraph.com/api/666c393731a829e1d49fc519fa06c487/subgraphs/id/5ToBwdgzuTF11UNfBMGjZUFdJ3LG2foDky4v1mhctFNX

async function sharesOverTime() {
  let start = 9990000;
  const members = await memberList();
  fs.unlinkSync("./sharesTime.csv");
  for (let i = start; i <= 15095959; i += 500000) {
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
  const members = ` {
    members(where: {moloch: "0x8f56682a50becb1df2fb8136954f2062871bc7fc", exists: true }){
      id
      memberAddress
      createdAt
      shares
    }
}`;
  await axios
    .post("https://api.thegraph.com/subgraphs/name/openlawteam/thelao", {
      query: members,
    })
    .then(async (res) => {
      fs.unlinkSync("./members.csv");
      const members = res.data.data.members;
      console.log(members.length);
      for (const member of members) {
        var memberType = await isContract(member.memberAddress.toString());
        var type = 0;
        if (memberType) {
          type = 1;
        }
        fs.appendFileSync("./members.csv", member.id + ",");
        fs.appendFileSync("./members.csv", member.memberAddress + ",");
        fs.appendFileSync("./members.csv", member.shares + ",");
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
    .post("https://api.thegraph.com/subgraphs/name/openlawteam/thelao", {
      query: votingPower,
    })
    .then(async (res) => {
      let shares = 0;
      try {
        shares = res.data.data.member.shares;
      } catch {
        shares = 0;
      }

      //for (const member of members) {
      //var memberType = await isContract(member.memberAddress.toString());
      fs.appendFileSync("./sharesTime.csv", shares + ",");
    })
    .catch((error) => {
      console.error(error);
    });
}

//sharesOverTime();
memberList();
