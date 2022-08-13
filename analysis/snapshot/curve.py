from lib2to3.pytree import NodePattern
from math import trunc
from netrc import NetrcParseError
import string
import matplotlib.pyplot as plt
from numpy import genfromtxt
import numpy as np
from matplotlib import cm, pyplot as plt
from pygini import gini
import collections
import csv
import networkx as nx
import networkx.algorithms.community as nx_comm
import networkx.algorithms as algo
import community as community_louvain

votes = []
proposalVoters = []
with open('../../Snapshot/curve/votes.csv', "r") as f:
    reader = csv.reader(f, delimiter=",")
    for i, line in enumerate(reader):
        votes += line[1:-1]
        proposalVoters.append(line[1:-1])
c = collections.Counter(votes)
freq = np.array(list(c.values()))
for idx in range(len(proposalVoters)-len(c.values())):
    freq = np.insert(freq, 0, 0)
participation = np.empty(len(proposalVoters))
for idx, prop in enumerate(proposalVoters):
    participation[idx] = len(prop)
assert(len(participation) == len(proposalVoters))


proposals = genfromtxt('../../Snapshot/curve/proposals.csv', delimiter=",")
proposals = proposals[participation != 0, :]
proposals = proposals[~np.isnan(proposals[:, 3]), :]
participationWithoutZero = participation[participation != 0]

###################### CONTROVERCY ###########################
propOutcomes = np.empty((len(proposals[:, 1]), 3))

for idx, prop in enumerate(proposals):
    propOutcomes[idx][0] = participationWithoutZero[idx]
    if prop[3] > prop[4]:
        propOutcomes[idx][1] = prop[3]/(prop[3]+prop[4])
        propOutcomes[idx][2] = 1
    elif prop[4] > prop[3]:
        propOutcomes[idx][1] = prop[4]/(prop[3]+prop[4])
        propOutcomes[idx][2] = 0
    else:
        propOutcomes[idx][1] = 0
        propOutcomes[idx][2] = 0

# Problem is the scores are so high because they are in tokens not individuals votes
# max = np.argmax(proposals[:, 5])
# print(proposals[max])
# propOutcomes = np.delete(propOutcomes, max, 0)
# propOutcomes = propOutcomes[propOutcomes[:, 0] >= 1000000, :]

fig9, ax9 = plt.subplots()
ax9.scatter(propOutcomes[:, 0], propOutcomes[:, 1],
            c=propOutcomes[:, 2], cmap='RdYlGn')
ax9.set_ylim(0.5)
ax9.set_xscale('log')
ax9.set_ylabel("Size of Majority")
ax9.set_xlabel("Participation")
fig10, ax10 = plt.subplots()
ax10.hist(propOutcomes[:, 1])
ax10.set_ylabel("Frequency")
ax10.set_xlabel("Size of Majority")

fig11, ax11 = plt.subplots()
print(np.average(participationWithoutZero))
ax11.hist(participationWithoutZero)
ax11.set_yscale('log')

plt.show()
