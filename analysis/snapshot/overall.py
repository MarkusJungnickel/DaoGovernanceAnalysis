from lib2to3.pytree import NodePattern
from math import trunc
from netrc import NetrcParseError
from pickle import BINBYTES
import string
from turtle import color
import matplotlib.pyplot as plt
import matplotlib as mpl
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
import seaborn as sns
from enum import Enum
import pandas as pd


class Column(Enum):
    PROPID = 0
    SPACENAME = 1
    SPACEID = 2
    AUTHOR = 3
    STATE = 4
    FOR = 5
    AGAINST = 6
    TOTAL = 7
    CREATED = 8
    VOTES = 9
    MEMBERS = 10
    PROPOSALS = 11
    PARTICIPATION = 12


###################### READ CSVS ###########################
proposals = genfromtxt('../../Snapshot/overall/proposals.csv',
                       delimiter="//")
spaces = genfromtxt('../../Snapshot/overall/spaces.csv',
                    delimiter='//', dtype=str)
proposalsStr = genfromtxt(
    '../../Snapshot/overall/proposals.csv', delimiter="//", dtype=str)

################### CLEAN & COMBINE DATA ####################

emptyColumn = np.zeros((len(proposals[:, 0]), 1))
for i in range(3):
    proposals = np.append(proposals, emptyColumn, axis=1)


assert(len(proposalsStr[:, 0]) == len(proposals[:, 0]))
for idx, propStr in enumerate(proposalsStr):
    space = spaces[spaces[:, 0] == propStr[Column.SPACEID.value], :]
    if len(space) == 0:
        space = [[0, 0, 0, 0]]
    # members
    proposals[idx][Column.MEMBERS.value] = int(space[0][2])
    # proposals
    proposals[idx][Column.PROPOSALS.value] = int(space[0][3])
for prop in proposals:
    if prop[Column.MEMBERS.value] >= prop[Column.VOTES.value]:
        prop[Column.PARTICIPATION.value] = prop[Column.VOTES.value] / \
            prop[Column.MEMBERS.value]
    else:
        prop[Column.PARTICIPATION.value] = 0

proposals = proposals[proposals[:, Column.MEMBERS.value] >= 50, :]
proposals = proposals[~np.isnan(proposals[:, Column.FOR.value]), :]
print(proposals[:, Column.PARTICIPATION.value])

###################### CONTROVERCY ###########################
propOutcomes = np.empty((len(proposals[:, 1]), 5))
for idx, prop in enumerate(proposals):
    propOutcomes[idx][0] = prop[Column.PARTICIPATION.value]
    propOutcomes[idx][3] = prop[Column.MEMBERS.value]
    propOutcomes[idx][4] = prop[Column.PROPOSALS.value]
    if prop[5] > prop[6]:
        propOutcomes[idx][1] = prop[5]/(prop[5]+prop[6])
        propOutcomes[idx][2] = 1
    elif prop[6] > prop[5]:
        propOutcomes[idx][1] = prop[6]/(prop[5]+prop[6])
        propOutcomes[idx][2] = 0
    else:
        propOutcomes[idx][1] = 0
        propOutcomes[idx][2] = 0
propOutcomes = propOutcomes[propOutcomes[:, 1] != 0, :]


# Controvercy histrogram
fig2, ax2 = plt.subplots()
ax2.hist(propOutcomes[:, 1], edgecolor='white', linewidth=1.2, color="#4CB391")
ax2.set_yscale("log")
ax2.set_ylabel("Frequency")
ax2.set_xlabel("Size of Majority")

# Controvercy hexbin
fig3, ax3 = plt.subplots()

ax3.hexbin(propOutcomes[:, 0], propOutcomes[:, 1],
           gridsize=40, cmap="Reds", bins="log")
ax3.set_ylim(0.5, 1)
ax3.set_xlim(0, 1)

# Proposals histrogram
fig4, ax4 = plt.subplots()
ax4.hist(propOutcomes[:, 4], edgecolor='white', linewidth=1.2, color="#4CB391")
ax4.set_yscale("log")
ax4.set_ylabel("Frequency")
ax4.set_xlabel("# Proposals")

# Controvercy jointplot hex
sns.set_theme(style="ticks")
s1 = sns.jointplot(x=propOutcomes[:, 0], y=propOutcomes[:, 1], kind="hex",
                   norm=mpl.colors.LogNorm(), marginal_kws=dict(bins=20))
s1.ax_joint.set_xlabel('Quorum')
s1.ax_joint.set_ylabel('Majority')

outcomes = np.column_stack((propOutcomes[:, 0], propOutcomes[:, 1]))
outcomes = pd.DataFrame(outcomes, columns=['Quorum', 'Majority'])
print(outcomes)
sns.set_theme(style="ticks")
s5 = sns.regplot(data=outcomes, x="Quorum", y="Majority", scatter=False)

# Controvercy by DAO size
sns.set_theme(style="ticks")
s2 = sns.jointplot(x=propOutcomes[:, 3], y=propOutcomes[:, 1], kind="hex",
                   norm=mpl.colors.LogNorm(), marginal_kws=dict(bins=20), color="#4CB391")
s2.ax_joint.set_xlabel('Size')
s2.ax_joint.set_ylabel('Majority')

# Quorum by DAO size
sns.set_theme(style="ticks")
s3 = sns.jointplot(x=propOutcomes[:, 3], y=propOutcomes[:, 0], kind="hex",
                   norm=mpl.colors.LogNorm(), marginal_kws=dict(bins=20), color="#4CB391")
s3.ax_joint.set_xlabel('Size')
s3.ax_joint.set_ylabel('Quorum')

# Quorum by DAO Proposals
sns.set_theme(style="ticks")
s4 = sns.jointplot(x=propOutcomes[:, 4], y=propOutcomes[:, 0], kind="hex",
                   norm=mpl.colors.LogNorm(), marginal_kws=dict(bins=20), color="#4CB391")
s4.ax_joint.set_xlabel('# Proposals')
s4.ax_joint.set_ylabel('Quorum')

# Controvercy by DAO Proposals
sns.set_theme(style="ticks")
s4 = sns.jointplot(x=propOutcomes[:, 4], y=propOutcomes[:, 1], kind="hex",
                   norm=mpl.colors.LogNorm(), marginal_kws=dict(bins=20), color="#4CB391")
s4.ax_joint.set_xlabel('# Proposals')
s4.ax_joint.set_ylabel('Quorum')


print("Median Size:", np.median(propOutcomes[:, 3]))
print("Median Quorum:", np.median(propOutcomes[:, 0]))
print("Median Majority:", np.average(propOutcomes[:, 1]))
print("Median # Proposals:", np.average(propOutcomes[:, 4]))

plt.show()


###################### BACKUP ###########################

# map = np.empty((51, 101))
# for prop in propOutcomes:
#     participation = prop[0]
#     majority = prop[1]
#     map[int(majority/(1/50))][int(participation/(100000/100))] += 1
# print(map)
# map = np.log(map)

# Controvercy Scatter Plot
# fig1, ax1 = plt.subplots()
# ax1.scatter(propOutcomes[:, 0], propOutcomes[:, 1],
#             c=propOutcomes[:, 2], cmap='RdYlGn')
# ax1.set_ylim(0.5)
# ax1.set_xscale('log')
# ax1.set_ylabel("Size of Majority")
# ax1.set_xlabel("Participation")
