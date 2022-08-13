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
  const votingPower = `
  {
        moloches(first:10) {
          id
          name
          members{
            id
            shares
            memberAddress
            tokenBalances{
              tokenBalance
            }
            votes{
                id
            }
          }
        }
}`;

  await axios
    .post(
      "https://gateway.thegraph.com/api/666c393731a829e1d49fc519fa06c487/subgraphs/id/5ToBwdgzuTF11UNfBMGjZUFdJ3LG2foDky4v1mhctFNX",
      {
        query: votingPower,
      }
    )
    .then(async (res) => {
      const members = await res.data.data.moloches[0].members;
      console.log("Total Members: ", members.length);
      var memberCount = 0;
      var contractCount = 0;
      fs.unlinkSync("./votingPower.csv");
      fs.appendFileSync("./votingPower.csv", "id,address,shares,isContract\n");
      for (const member of members) {
        // console.log(member.shares);

        if (member.shares != 0) {
          memberCount += 1;
        }
        var memberType = await isContract(member.memberAddress.toString());
        if (memberType) {
          contractCount += 1;
        }

        fs.appendFileSync("./votingPower.csv", member.id.slice(50) + ",");
        fs.appendFileSync("./votingPower.csv", member.memberAddress + ",");
        fs.appendFileSync("./votingPower.csv", member.shares + ",");
        fs.appendFileSync("./votingPower.csv", memberType.toString() + ",");
        fs.appendFileSync("./votingPower.csv", "\n");
      }
      console.log("Active members: ", memberCount);
      console.log("Contract members: ", contractCount);
    })
    .catch((error) => {
      console.error(error);
    });
}

getVotes();
