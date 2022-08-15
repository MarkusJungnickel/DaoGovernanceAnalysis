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

daoList();
