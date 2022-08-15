import axios from "axios";
import fs from "fs";
import Web3 from "web3";
var gini = require("gini");

const provider =
  "https://mainnet.infura.io/v3/95e70ba790e649eeb37d25fc31e1662d";
const web3 = new Web3(provider);
const graph =
  "https://api.thegraph.com/subgraphs/name/odyssy-automaton/daohaus";

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
      memberList.push(element.shares);
    });
  }
  const giniCo = gini.unordered(memberList);
  fs.appendFileSync("./gini.csv", dao + ",");
  fs.appendFileSync("./gini.csv", memberList.length + ",");
  fs.appendFileSync("./gini.csv", giniCo + "\n");
  console.log("gini", giniCo);
}

async function getMembers(i: number, dao: string): Promise<any> {
  let returnValue: any[] = [];
  console.log(dao);
  const membersQuery = `{
    members(skip: ${i}, first: 1000, where: {moloch_:{id: "${dao.toLowerCase()}"}}) {
      shares
    }
  }`;
  await axios
    .post(graph, {
      query: membersQuery,
    })
    .then(async (res) => {
      const members: any[] = res.data.data.members;
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
    moloches(skip: ${i}, first: 1000) {
      id
    }
  }`;
  await axios
    .post(graph, {
      query: daoQuery,
    })
    .then(async (res) => {
      const moloches: any[] = res.data.data.moloches;
      console.log("Number molochs: ", moloches.length);
      returnValue = moloches;
    })
    .catch((error) => {
      console.error(error);
    });
  return returnValue;
}

calcGini();
