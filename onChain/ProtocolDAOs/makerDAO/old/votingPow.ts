import axios from "axios";
import Web3 from "web3";
import fs from "fs";
const provider =
  "https://patient-crimson-wave.quiknode.pro/97c31f01dc8e96ff9a2997208a4fd86a31b4fce8/";
const web3Provider = new Web3.providers.HttpProvider(provider);
const web3 = new Web3(provider);

async function isContract(address: string) {
  const code = await web3.eth.getCode(address);
  return code != "0x";
}

async function getVotes() {
  const votingPow = `{
    addressVoters(first:1000){
        id
      locked
    }
  }`;

  await axios
    .post(
      "https://api.thegraph.com/subgraphs/name/protofire/makerdao-governance",
      {
        query: votingPow,
      }
    )
    .then(async (res) => {
      fs.unlinkSync("./votingPow.csv");
      const voters = res.data.data.addressVoters;
      console.log(voters.length);
      let sum = 0;
      voters.forEach((voter: { locked: string; id: string }) => {
        sum += parseFloat(voter.locked);
        fs.appendFileSync("./votingPow.csv", voter.id + ",");
        fs.appendFileSync("./votingPow.csv", voter.locked.toString() + "\n");
      });
      console.log(sum);

      //   fs.appendFileSync(
      //     "./votingPow.csv",
      //     "id,coldAddress,hotAddress,isContract,block\n"
      //   );

      fs.appendFileSync("./votingPow.csv", "\n");
    })
    .catch((error) => {
      console.error(error);
    });
}

getVotes();
