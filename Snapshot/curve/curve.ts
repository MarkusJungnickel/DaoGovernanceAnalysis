import axios from "axios";
import fs from "fs";

async function getProposals(): Promise<any> {
  fs.unlinkSync("./proposals.csv");
  let returnValue: any = [];
  const proposals = `{
    proposals(
      first: 1000,
      skip: 0,
      where: {
        space: "curve.eth"
      },
      orderBy: "created",
      orderDirection: desc
    ) {
      id
      title
      choices
      state
      end
      snapshot
      scores_total
      scores
      state
      author
      created
      space {
        id
        name
      }
      votes
    }
  }`;
  await axios
    .post("https://hub.snapshot.org/graphql", {
      query: proposals,
    })
    .then(async (res) => {
      const proposals = res.data.data.proposals;
      for (const prop of proposals) {
        fs.appendFileSync("./proposals.csv", prop.id + "//");
        fs.appendFileSync("./proposals.csv", prop.space.name + "//");
        fs.appendFileSync("./proposals.csv", prop.space.id + "//");
        fs.appendFileSync("./proposals.csv", prop.author + "//");
        fs.appendFileSync("./proposals.csv", prop.state + "//");
        fs.appendFileSync("./proposals.csv", prop.scores[0] + "//");
        fs.appendFileSync("./proposals.csv", prop.scores[1] + "//");
        fs.appendFileSync("./proposals.csv", prop.scores_total + "//");
        fs.appendFileSync("./proposals.csv", prop.created + "//");
        fs.appendFileSync("./proposals.csv", prop.votes + "\n");
      }
      returnValue = proposals;
    })
    .catch((error) => {
      console.log(error);
    });
  return returnValue;
}

async function getVotes() {
  fs.unlinkSync("./votes.csv");
  const proposals = await getProposals();
  for (const prop of proposals) {
    fs.appendFileSync("./votes.csv", prop.id + ",");
    for (let i = 0; i <= 100000; i += 1000) {
      const votes = `{
    votes (
      skip: ${i}
      first: 1000
      where: {
        space: "curve.eth",
        proposal: "${prop.id}"
      }
    ) {
      id
      voter
      created
      proposal{
        title
        id
      }
      choice
      space {
        id
      }
    }
  }`;
      await axios
        .post("https://hub.snapshot.org/graphql", {
          query: votes,
        })
        .then(async (res) => {
          try {
            const votes = res.data.data.votes;
            if (votes.length >= 1000) {
              console.log("Over 1k");
              //exit(1);
            } else {
              i = 200000;
            }
            for (const vote of votes) {
              fs.appendFileSync("./votes.csv", vote.voter + ",");
            }
          } catch {
            i = 200000;
          }
        })
        .catch((error) => {
          console.log(error);
        });
    }
    fs.appendFileSync("./votes.csv", "\n");
  }
}

getVotes();
//getProposals();
