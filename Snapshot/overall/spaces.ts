import axios from "axios";
import fs from "fs";

async function getspaces(): Promise<any> {
  let returnValue: any = [];
  for (let i = 0; i <= 10000; i += 1000) {
    const spaces = `{
    spaces(
      first: 1000,
      skip: ${i},
    ) {
      id
      name
    }
  }`;
    await axios
      .post("https://hub.snapshot.org/graphql", {
        query: spaces,
      })
      .then(async (res) => {
        const spaces = res.data.data.spaces;
        returnValue = returnValue.concat(spaces);
      })
      .catch((error) => {
        console.log(error);
      });
  }
  return returnValue;
}

async function getFollowers() {
  // fs.unlinkSync("./spaces.csv");
  const spaces = await getspaces();
  for (const space of spaces) {
    let length = 0;
    for (let i = 0; i <= 100000; i += 1000) {
      const followers = `{
      follows (skip: ${i}, first: 1000, where: { space: "${space.id}" }) {
        id
        follower
        created
      }
    }`;
      await axios
        .post("https://hub.snapshot.org/graphql", {
          query: followers,
        })
        .then(async (res) => {
          const follows = res.data.data.follows;
          length += follows.length;
          if (follows.length < 1000) {
            i = 1000000;
          }
        })
        .catch((error) => {
          console.log(error);
        });
    }
    fs.appendFileSync("./spaces.csv", space.id + "/%/");
    fs.appendFileSync("./spaces.csv", length + "\n");
  }
}

getFollowers();
//getspaces();
