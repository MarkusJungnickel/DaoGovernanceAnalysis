import axios from "axios";
import fs from "fs";
import Web3 from "web3";
var gini = require("gini");

const provider =
  "https://mainnet.infura.io/v3/95e70ba790e649eeb37d25fc31e1662d";
const web3 = new Web3(provider);
const graph = "https://api.thegraph.com/subgraphs/name/daostack/v41_11";

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function calcGini() {
  fs.unlinkSync("./gini.csv");
  const daos = await daoList();
  console.log(daos);
  for (const dao of daos) {
    console.log("Next Dao", dao);
    delay(100);
    await memberList(dao);
  }
}

async function daoList() {
  fs.unlinkSync("./daos.csv");
  var daoList: any[] = [];
  var cont = true;
  for (let i = 0; i < 3000 && cont; i += 1000) {
    const list = await getDaos(i);
    if (list.length < 1000) cont = false;
    list.forEach((element: any) => {
      daoList.push(element.id);
    });
  }
  return daoList;
}

async function memberList(dao: string) {
  var memberList: any[] = [];
  var cont = true;
  for (let i = 0; i < 3000 && cont; i += 1000) {
    const list = await getMembers(i, dao);
    if (list.length < 1000) cont = false;
    list.forEach((element: any) => {
      memberList.push(element.balance);
    });
  }
  let giniCo = 0;
  let nakamotoCo = 0;
  if (memberList.length != 0) {
    let memberListN: number[] = [];
    memberList.forEach((member) => {
      memberListN.push(parseInt(member, 10));
    });
    console.log(memberListN);
    giniCo = gini.unordered(memberListN);
    memberListN.sort((one, two) => (one > two ? -1 : 1));
    let combinedShares = 0;
    const totalShares = memberListN.reduce((accumulator, current) => {
      return accumulator + current;
    }, 0);
    console.log("totalShares:", totalShares);
    for (let i = 0; i <= memberListN.length; i += 1) {
      combinedShares += memberListN[i];
      if (combinedShares / totalShares > 0.5) {
        nakamotoCo = i;
        break;
      }
    }
  }
  fs.appendFileSync("./gini.csv", dao + ",");
  fs.appendFileSync("./gini.csv", memberList.length + ",");
  fs.appendFileSync("./gini.csv", giniCo + ",");
  fs.appendFileSync("./gini.csv", nakamotoCo + "\n");
  console.log("gini", giniCo);
}

async function getMembers(i: number, dao: string): Promise<any> {
  let returnValue: any[] = [];
  console.log(dao);
  const membersQuery = `{
    reputationHolders(skip: ${i}, first: 1000, where: {dao_:{
      id: "${dao}" 
    }}){
      balance
    }
  }`;
  await axios
    .post(graph, {
      query: membersQuery,
    })
    .then(async (res) => {
      const members: any[] = res.data.data.reputationHolders;
      console.log("number members:", members.length);
      returnValue = members;
    })
    .catch((error) => {
      console.error(error);
    });
  return returnValue;
}

async function getDaos(i: number): Promise<any> {
  let returnValue: any[] = [];
  const daoQuery = `{
    daos(skip: ${i}, first: 1000) {
    id
    name
    reputationHoldersCount
    reputationHolders{
        id
        balance
      }
      proposals{
        votesFor
        votesAgainst
        stakesFor
        stakesAgainst
        stakes{
          id
          amount
        }
      }
    }
  }`;
  await axios
    .post(graph, {
      query: daoQuery,
    })
    .then(async (res) => {
      const daos: any[] = res.data.data.daos;
      console.log("Number daos: ", daos.length);
      returnValue = daos;
      daos.forEach((dao) => {
        fs.appendFileSync("./daos.csv", dao.name + "//");
        fs.appendFileSync("./daos.csv", dao.id + "//");
        fs.appendFileSync("./daos.csv", dao.reputationHoldersCount + "//");
        fs.appendFileSync("./daos.csv", dao.proposals.length + "\n");
      });
    })
    .catch((error) => {
      console.error(error);
    });
  return returnValue;
}

calcGini();
