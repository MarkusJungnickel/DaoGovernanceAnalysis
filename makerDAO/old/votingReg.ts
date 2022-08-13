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
  const votingReg = `{
    voterRegistries(first: 1000) {
      id
      coldAddress
      hotAddress
      voteProxies {
        id
      }
      block
      timestamp
    }
  }`;

  await axios
    .post(
      "https://api.thegraph.com/subgraphs/name/protofire/makerdao-governance",
      {
        query: votingReg,
      }
    )
    .then(async (res) => {
      const members = await res.data.data.voterRegistries;
      console.log("Total Members: ", members.length);
      var contractCount = 0;
      fs.unlinkSync("./votingReg.csv");
      fs.appendFileSync(
        "./votingReg.csv",
        "id,coldAddress,hotAddress,isContract,block\n"
      );
      for (const member of members) {
        // console.log(member.shares);
        var memberType = await isContract(member.hotAddress.toString());
        if (memberType) {
          contractCount += 1;
        }

        fs.appendFileSync("./votingReg.csv", member.id.slice(50) + ",");
        fs.appendFileSync("./votingReg.csv", member.coldAddress + ",");
        fs.appendFileSync("./votingReg.csv", member.hotAddress + ",");
        fs.appendFileSync("./votingReg.csv", memberType.toString() + ",");
        fs.appendFileSync("./votingReg.csv", member.block.toString() + ",");
        fs.appendFileSync("./votingReg.csv", "\n");
      }
      console.log("Contract members: ", contractCount);
    })
    .catch((error) => {
      console.error(error);
    });
}

getVotes();
