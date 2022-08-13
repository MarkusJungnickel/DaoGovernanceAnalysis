import axios from "axios";
import Web3 from "web3";
import fs from "fs";
import { exit } from "process";
import { CURVE_ABI } from "../../ABIs";
const provider =
  "https://patient-crimson-wave.quiknode.pro/97c31f01dc8e96ff9a2997208a4fd86a31b4fce8/";
const web3Provider = new Web3.providers.HttpProvider(provider);
const web3 = new Web3(provider);
const addressCurve = "0x5f3b5DfEb7B28CDbD7FAba78963EE202a494e2A2";
const contract = new web3.eth.Contract(CURVE_ABI, addressCurve);

async function memberList(): Promise<any> {
  const members = `{
        voters(first: 1000) {
          id
         address
         voteCount
         totalStaked
        }
      }`;
  await axios
    .post(
      "https://gateway.thegraph.com/api/a76162906e44ca75fdbdfea7899b9b81/subgraphs/id/27N5qfvJ7eRS3aD2yWs9ey8FEffd3Ssow8aUM3Q3wdbF",
      {
        query: members,
      }
    )
    .then(async (res) => {
      //fs.unlinkSync("./members.csv");
      const members = res.data.data.voters;
      console.log(members.length);
      for (const member of members) {
        fs.appendFileSync("./members.csv", member.id + ",");
        fs.appendFileSync("./members.csv", member.address + ",");
        fs.appendFileSync("./members.csv", "\n");
      }
    })
    .catch((error) => {
      console.error(error);
    });
}

memberList();
