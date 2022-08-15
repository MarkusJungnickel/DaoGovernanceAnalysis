import Web3 from "web3";
import { isHexStrict, toHex } from "web3-utils";
import { DXREP_ABI, MOLOCH_ABI } from "../ABIs";
import { parse } from "csv-parse";
import fs, { PathLike, readFile } from "fs";
import { URL } from "url";
import { finished } from "stream/promises";
import { exit } from "process";
const provider =
  "https://patient-crimson-wave.quiknode.pro/97c31f01dc8e96ff9a2997208a4fd86a31b4fce8/";
const web3Provider = new Web3.providers.HttpProvider(provider);
const web3 = new Web3(provider);
const addressRep = "0x7a927A93F221976AAE26d5D077477307170f0b7c";
const contract = new web3.eth.Contract(DXREP_ABI, addressRep);
const csvFilePath = "./reputationHoldersFormatted.csv";

async function getPastEvents() {
  //fs.unlinkSync("./repTime.csv");
  const addresses = await readCSVFile(csvFilePath);
  for (var i = 11946242; i <= 15082461; i += 500000) {
    fs.appendFileSync("./repTime.csv", i + ",");
    for (const address of addresses) {
      const balance = await contract.methods
        .balanceOfAt(toHex(address[0]), i)
        .call();
      fs.appendFileSync("./repTime.csv", balance + ",");
    }
    fs.appendFileSync("./repTime.csv", "\n");
  }
}
getPastEvents();

async function readCSVFile(csvFilePath: PathLike) {
  const fileContent = fs.readFileSync(csvFilePath, { encoding: "utf-8" });
  let returnValue: string[] = [];
  const parser = fs
    .createReadStream(csvFilePath)
    .pipe(parse({ encoding: "utf-8" }));
  parser.on("readable", async function () {
    let record: string;
    while ((record = parser.read()) !== null) {
      returnValue.push(record);
    }
  });
  await finished(parser);
  return returnValue;

  //   const reutnr = parse(
  //     fileContent,
  //     {
  //       delimiter: ";",
  //     },
  //     (error, result: string[]) => {
  //       if (error) {
  //         console.error(error);
  //       }
  //       returnValue = result;
  //       return result;
  //       console.log(returnValue);
  //     }
  //   );
}
