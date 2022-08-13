import EthDater from "ethereum-block-by-date";
import { ethers, EventFilter } from "ethers";
import { DXDAO_ABI, LAO_ABI } from "../ABIs";

const provider = new ethers.providers.WebSocketProvider(
  "https://patient-crimson-wave.quiknode.pro/97c31f01dc8e96ff9a2997208a4fd86a31b4fce8/"
);
const address = "0x519b70055af55A007110B4Ff99b0eA33071c720a";
const newLocal = [
  {
    constant: true,
    inputs: [],
    name: "orgName",
    outputs: [{ name: "", type: "string" }],
    payable: false,
    stateMutability: "view",
    type: "function",
  },
  {
    constant: false,
    inputs: [
      { name: "_contract", type: "address" },
      { name: "_data", type: "bytes" },
      { name: "_value", type: "uint256" },
    ],
    name: "genericCall",
    outputs: [
      { name: "success", type: "bool" },
      { name: "returnValue", type: "bytes" },
    ],
    payable: false,
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    constant: false,
    inputs: [],
    name: "renounceOwnership",
    outputs: [],
    payable: false,
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    constant: false,
    inputs: [{ name: "_metaData", type: "string" }],
    name: "metaData",
    outputs: [{ name: "", type: "bool" }],
    payable: false,
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    constant: true,
    inputs: [],
    name: "nativeReputation",
    outputs: [{ name: "", type: "address" }],
    payable: false,
    stateMutability: "view",
    type: "function",
  },
  {
    constant: true,
    inputs: [],
    name: "owner",
    outputs: [{ name: "", type: "address" }],
    payable: false,
    stateMutability: "view",
    type: "function",
  },
  {
    constant: true,
    inputs: [],
    name: "isOwner",
    outputs: [{ name: "", type: "bool" }],
    payable: false,
    stateMutability: "view",
    type: "function",
  },
  {
    constant: false,
    inputs: [
      { name: "_externalToken", type: "address" },
      { name: "_spender", type: "address" },
      { name: "_value", type: "uint256" },
    ],
    name: "externalTokenApproval",
    outputs: [{ name: "", type: "bool" }],
    payable: false,
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    constant: false,
    inputs: [
      { name: "_externalToken", type: "address" },
      { name: "_from", type: "address" },
      { name: "_to", type: "address" },
      { name: "_value", type: "uint256" },
    ],
    name: "externalTokenTransferFrom",
    outputs: [{ name: "", type: "bool" }],
    payable: false,
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    constant: false,
    inputs: [
      { name: "_amountInWei", type: "uint256" },
      { name: "_to", type: "address" },
    ],
    name: "sendEther",
    outputs: [{ name: "", type: "bool" }],
    payable: false,
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    constant: false,
    inputs: [
      { name: "_externalToken", type: "address" },
      { name: "_to", type: "address" },
      { name: "_value", type: "uint256" },
    ],
    name: "externalTokenTransfer",
    outputs: [{ name: "", type: "bool" }],
    payable: false,
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    constant: true,
    inputs: [],
    name: "nativeToken",
    outputs: [{ name: "", type: "address" }],
    payable: false,
    stateMutability: "view",
    type: "function",
  },
  {
    constant: false,
    inputs: [{ name: "newOwner", type: "address" }],
    name: "transferOwnership",
    outputs: [],
    payable: false,
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      { name: "_orgName", type: "string" },
      { name: "_nativeToken", type: "address" },
      { name: "_nativeReputation", type: "address" },
    ],
    payable: false,
    stateMutability: "nonpayable",
    type: "constructor",
  },
  { payable: true, stateMutability: "payable", type: "fallback" },
  {
    anonymous: false,
    inputs: [
      { indexed: true, name: "_contract", type: "address" },
      { indexed: false, name: "_data", type: "bytes" },
      { indexed: false, name: "_value", type: "uint256" },
      { indexed: false, name: "_success", type: "bool" },
    ],
    name: "GenericCall",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      { indexed: false, name: "_amountInWei", type: "uint256" },
      { indexed: true, name: "_to", type: "address" },
    ],
    name: "SendEther",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, name: "_externalToken", type: "address" },
      { indexed: true, name: "_to", type: "address" },
      { indexed: false, name: "_value", type: "uint256" },
    ],
    name: "ExternalTokenTransfer",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, name: "_externalToken", type: "address" },
      { indexed: false, name: "_from", type: "address" },
      { indexed: false, name: "_to", type: "address" },
      { indexed: false, name: "_value", type: "uint256" },
    ],
    name: "ExternalTokenTransferFrom",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, name: "_externalToken", type: "address" },
      { indexed: false, name: "_spender", type: "address" },
      { indexed: false, name: "_value", type: "uint256" },
    ],
    name: "ExternalTokenApproval",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, name: "_sender", type: "address" },
      { indexed: false, name: "_value", type: "uint256" },
    ],
    name: "ReceiveEther",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [{ indexed: false, name: "_metaData", type: "string" }],
    name: "MetaData",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, name: "previousOwner", type: "address" },
      { indexed: true, name: "newOwner", type: "address" },
    ],
    name: "OwnershipTransferred",
    type: "event",
  },
];
const abi = new ethers.utils.Interface(newLocal);

const dater = new EthDater(
  provider // Ethers provider, required.
);

const contract = new ethers.Contract(address, abi, provider);
getEvents();
async function getEvents() {
  var filter: EventFilter = {};
  const result = await contract.queryFilter(filter, 15038614, 15038616);

  console.log(result);
}
