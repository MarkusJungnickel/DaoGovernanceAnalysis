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


#################### READ CSVs ##########################


sharesTime = genfromtxt('../theLAO/sharesTime.csv', delimiter=',')
members = genfromtxt('../theLAO/members.csv', delimiter=',')
proposals = genfromtxt('../theLAO/proposals.csv', delimiter='","', dtype="str")
votes = genfromtxt('../theLAO/votes.csv', delimiter=',', dtype="str")
membersStr = genfromtxt('../theLAO/members.csv', delimiter=',', dtype="str")

#################### Equality Analysis ##########################

# SCATTER WEALTH BY JOINED TIME
fig1, ax1 = plt.subplots()
ax1.scatter(members[:, 3], members[:, 2],
            c=members[:, 4], cmap='tab20c', vmin=0, vmax=1)
ax1.set_ylabel("Shares")
ax1.set_xlabel("Blocknumber When Joined DAO")

# PIE CHART OF WEALTH
fig2, ax2 = plt.subplots()
colors = plt.get_cmap('Blues')(np.linspace(0.2, 0.7, len(members[:, 0])))
ax2.pie(np.sort(members[:, 2]), colors=colors, radius=3, center=(4, 4), normalize=True,
        wedgeprops={"linewidth": 1, "edgecolor": "white"}, frame=True)
ax2.set_title("Shares by Member")

# # HISTOGRAM OF WEALTH
# fig3, ax3 = plt.subplots()
# ax3.hist(repBalances[:, 0])

# # REP CHANGE OVER TIME
fig4, ax4 = plt.subplots()
for index in range(len(sharesTime[0, :])-1):
    ax4.plot(sharesTime[:, 0], sharesTime[:, index], color="tab:blue")
ax4.set_ylabel("Shares")
ax4.set_xlabel("Time")
# ax4.set_ylim([0, 500000])

# # GINI OVER TIME
fig5, ax5 = plt.subplots()
giniCo = np.empty([len(sharesTime[:, 0])])
for index in range(len(sharesTime[:, 0])):
    rowLength = len(sharesTime[index])
    dataRow = sharesTime[index][1:(rowLength-1)]
    np.trunc(dataRow)
    giniCo[index] = gini(dataRow)
ax5.plot(sharesTime[:, 0], giniCo, color="tab:blue")
ax5.set_ylim([0, 1])
ax5.set_ylabel("Gini")
ax5.set_xlabel("Time")

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


arr = np.sort(members[:, 2])
# show the gini index!
print(gini(arr))
lorenz_curve = lorenz(arr)
# we need the X values to be between 0.0 to 1.0
ax11.plot(np.linspace(0.0, 1.0, lorenz_curve.size), lorenz_curve)
# plot the straight line perfect equality curve
ax11.plot([0, 1], [0, 1])
ax11.set_title("Lorenz Curve")

###################### CONTROVERCY ###########################
# 6 is passes
# 15 no shares, 16 no votes
# 39 yes shares, 40 yes votes
propOutcomes = np.empty((len(proposals[:, 1]), 3))
for idx, prop in enumerate(proposals):
    sum = int(prop[15])+int(prop[39])
    propOutcomes[idx][0] = sum
    if prop[6] == "true":
        propOutcomes[idx][1] = int(prop[39])/sum
        propOutcomes[idx][2] = 1
    elif sum != 0:
        propOutcomes[idx][1] = int(prop[15])/sum
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
ax10.hist(propOutcomes[:, 1])
ax10.set_ylabel("Frequency")
ax10.set_xlabel("Size of Majority")


#################### Network Analysis ##########################
# https://stackoverflow.com/questions/62890682/visualization-of-louvain-partitions-in-networkx


adjacencyList = np.zeros((len(members[:, 0]), len(members[:, 0])))


def comparison(holder, voters):
    for voter in voters:
        if str(voter).lower() == str(holder).lower():
            return True
    return False


memberAddresses = membersStr[:, 1]
for i in range(len(memberAddresses)):
    for j in range(1, 174):
        proposalVoters = votes[votes[:, 2] == str(j), :1]
        if comparison(memberAddresses[i], proposalVoters[:, 0]) is True:
            for k in range(len(memberAddresses)):
                if comparison(memberAddresses[k], proposalVoters[:, 0]) is True:
                    adjacencyList[i][k] += 1

fig7, ax7 = plt.subplots()
G = nx.Graph()
for i in range(len(members[:, 0])):
    for j in range(len(members[:, 0])):
        if adjacencyList[i][j] != 0 and i != j:
            G.add_edge(i, j, weight=adjacencyList[i][j])

partition = community_louvain.best_partition(
    G, weight='weight', resolution=0.8)
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

plt.show()
