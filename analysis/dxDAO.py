from lib2to3.pytree import NodePattern
from math import trunc
from netrc import NetrcParseError
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


#################### READ CSVs ##########################
votes = []
proposals = []
proposalVoters = []
with open("../dxDAO/proposalVotes.csv", "r") as f:
    reader = csv.reader(f, delimiter=",")
    for i, line in enumerate(reader):
        votes += line[1:-1]
        proposals.append(line[0])
        proposalVoters.append(line[1:-1])
c = collections.Counter(votes)
freq = np.array(list(c.values()))
for idx in range(459-len(c.values())):
    freq = np.insert(freq, 0, 0)


repBalances = genfromtxt(
    '../dxDAO/reputationBalancesFormatted.csv', delimiter=';')
repTime = genfromtxt('../dxDAO/repTime.csv', delimiter=',')
repHolders = genfromtxt(
    '../dxDAO/reputationHoldersFormatted.csv', delimiter=',', dtype=str)
proposalList = genfromtxt(
    '../dxDAO/proposals.csv', delimiter=',', dtype=str)

#################### Equality Analysis ##########################

# SCATTER WEALTH BY JOINED TIME
fig, ax = plt.subplots()
ax.scatter(repBalances[:, 1], repBalances[:, 0],
           c=repBalances[:, 2], cmap='tab20c', vmin=0, vmax=1)
#ax.set_title("Reputation Over Joining Time")
ax.set_ylabel("Reputation")
ax.set_xlabel("Blocknumber When Joined DAO")

# PIE CHART OF WEALTH
fig2, ax2 = plt.subplots()
colors = plt.get_cmap('Blues')(np.linspace(0.2, 0.7, len(repBalances[1:, 0])))
ax2.pie(np.sort(repBalances[1:, 0]), colors=colors, radius=3, center=(4, 4),
        wedgeprops={"linewidth": 1, "edgecolor": "white"}, frame=True)
ax2.set_title("Share of Reputation by Member")

# HISTOGRAM OF WEALTH
fig3, ax3 = plt.subplots()
ax3.hist(repBalances[:, 0])
ax3.set_title("Reputation Distribution")

# REP CHANGE OVER TIME
fig4, ax4 = plt.subplots()
for index in range(len(repTime[0, :])-1):
    ax4.plot(repTime[:, 0], repTime[:, index], color="tab:blue")
scale = 10**23
ax4.set_ylim([0.1*scale, 1.5*scale])
ax4.set_ylabel("Reputation")
ax4.set_xlabel("Time")

# GINI OVER TIME
fig5, ax5 = plt.subplots()
giniCo = np.empty([len(repTime[:, 0])])
for index in range(len(repTime[:, 0])):
    rowLength = len(repTime[index])
    dataRow = repTime[index][1:(rowLength-1)]
    dataRow = dataRow*10**-18
    np.trunc(dataRow)
    giniCo[index] = gini(dataRow)
ax5.plot(repTime[:, 0], giniCo, color="tab:blue")
ax5.set_ylim([0.5, 1])
ax5.set_ylabel("Gini")
ax5.set_xlabel("Time")

# VOTINNG FREQUENCY PIE
fig6, ax6 = plt.subplots()
colors2 = plt.get_cmap('Greens')(
    np.linspace(0.2, 0.7, len(freq)))
ax6.pie(np.sort(freq), colors=colors2, radius=3, center=(4, 4),
        wedgeprops={"linewidth": 1, "edgecolor": "white"}, frame=True)
ax6.set_title("Share of Total Votes")


# plt.show()

###################### LORENZ CURVE ###########################
# https://gist.github.com/CMCDragonkai/c79b9a0883e31b327c88bfadb8b06fc4
# ensure your arr is sorted from lowest to highest values first!

fig11, ax11 = plt.subplots()


def lorenz(arr):
    # this divides the prefix sum by the total sum
    # this ensures all the values are between 0 and 1.0
    scaled_prefix_sum = arr.cumsum() / arr.sum()
    # this prepends the 0 value (because 0% of all people have 0% of all wealth)
    return np.insert(scaled_prefix_sum, 0, 0)


arr = np.sort(repBalances[1:, 0])
# show the gini index!
print(gini(arr))
lorenz_curve = lorenz(arr)
# we need the X values to be between 0.0 to 1.0
ax11.plot(np.linspace(0.0, 1.0, lorenz_curve.size), lorenz_curve)
# plot the straight line perfect equality curve
ax11.plot([0, 1], [0, 1])
ax11.set_title("Lorenz Curve")

# plt.show()

#################### Network Analysis ##########################
# https://stackoverflow.com/questions/62890682/visualization-of-louvain-partitions-in-networkx
adjacencyList = np.zeros((len(repHolders), len(repHolders)))
for i, holder in enumerate(repHolders):
    for proposal in proposalVoters:
        if holder in proposal:
            for j in range(len(repHolders)):
                if repHolders[j] in proposal:
                    adjacencyList[i][j] += 1

fig7, ax7 = plt.subplots()
ax7.set_title("Louvain Communities")
G = nx.Graph()
for i in range(len(repHolders)):
    for j in range(len(repHolders)):
        if adjacencyList[i][j] != 0 and i != j:
            G.add_edge(i, j, weight=adjacencyList[i][j])

partition = community_louvain.best_partition(G, weight='weight')
cmap = cm.get_cmap('viridis', max(partition.values()) + 1)
shapes = 'so^>v<dph8'
plt.figure(figsize=(12, 8))
# draw the graph
pos = nx.spring_layout(G)
# color the nodes according to their partition
cmap = cm.get_cmap('viridis', max(partition.values()) + 1)
nx.draw_networkx_edges(G, pos, alpha=0.5)
for node, color in partition.items():
    nx.draw_networkx_nodes(G, pos, [node], node_size=50,
                           node_color=[cmap.colors[color]],
                           node_shape=shapes[color])

# centrality analysis
centrality = algo.degree_centrality(G)
values = list(centrality.values())

fig8, ax8 = plt.subplots()
ax8.hist(np.sort(values), edgecolor='white', linewidth=1.2)
ax8.set_ylabel("# of Members")
ax8.set_xlabel("Degree Centrality")


###################### CONTROVERCY ###########################

propOutcomes = np.empty((len(proposalList), 3))
for idx, prop in enumerate(proposalList):
    sum = int(prop[2])+int(prop[3])
    propOutcomes[idx][0] = sum
    if prop[4] == "Pass":
        propOutcomes[idx][1] = int(prop[2])/sum
        propOutcomes[idx][2] = 1
    elif sum != 0:
        propOutcomes[idx][1] = int(prop[3])/sum
        propOutcomes[idx][2] = 0
    else:
        propOutcomes[idx][1] = 0
        propOutcomes[idx][2] = 0
fig9, ax9 = plt.subplots()
ax9.scatter(propOutcomes[:, 0], propOutcomes[:, 1],
            c=propOutcomes[:, 2], cmap='RdYlGn')
ax9.set_ylabel("Size of Majority")
ax9.set_xlabel("Sum of Votes")
fig10, ax10 = plt.subplots()
ax10.hist(propOutcomes[:, 1], edgecolor='white', linewidth=1.2)
ax10.set_ylabel("Frequency")
ax10.set_xlabel("Size of Majority")
plt.show()
