from lib2to3.pytree import NodePattern
from math import trunc
from netrc import NetrcParseError
from pickle import BINBYTES
import string
from turtle import color
from black import out
import matplotlib.pyplot as plt
import matplotlib as mpl
from numpy import genfromtxt
import numpy as np
from matplotlib import cm, pyplot as plt
from pkg_resources import parse_version
from pygini import gini
import collections
import csv
import networkx as nx
import networkx.algorithms.community as nx_comm
import networkx.algorithms as algo
import community as community_louvain
import seaborn as sns
import pandas as pd


# https://dao-analyzer.science/daohaus -> SEE FOR IDEAS

###################### GINI ###########################

# load CSVs
giniCo = genfromtxt('../../onChain/DAOHaus/overall/gini.csv',
                    delimiter=",")
giniCoStr = genfromtxt(
    '../../onChain/DAOHaus/overall/gini.csv', delimiter=",", dtype=str)

# clean data
giniCo = giniCo[giniCo[:, 1] >= 20, :]
print(giniCo)

# Gini histrogram
fig2, ax2 = plt.subplots()
ax2.set_box_aspect(1)
ax2.hist(giniCo[:, 2], edgecolor='white', linewidth=1.2, color="#4CB391",
         weights=np.ones_like(giniCo[:, 2]) / len(giniCo[:, 2]), bins=10)
ax2.set_ylabel("Percent of DAOs")
ax2.yaxis.set_major_formatter(mpl.ticker.PercentFormatter(1))
ax2.set_xlabel("Gini")

# Gini x Size
fig3, ax3 = plt.subplots()
ax3.set_box_aspect(1)
sns.set_theme(style="ticks")
s1 = sns.jointplot(x=giniCo[:, 1], y=giniCo[:, 2],
                   kind="hex", marginal_kws=dict(bins=13), joint_kws=dict(gridsize=15), color="#4CB391")
s1.ax_joint.set_xlabel('Number of Members')
# norm=mpl.colors.LogNorm()
# s1.ax_joint.set_xscale('log')
# s1.ax_joint.set_ylim(0, 1)
s1.ax_joint.set_ylabel('Gini')

print("Median gini:", np.median(giniCo[:, 2]))
print("Mean gini:", np.average(giniCo[:, 2]))
print("StandardDev gini:", np.std(giniCo[:, 2]))

#################### CONTROVERCY #########################

# load CSVs
proposals = genfromtxt('../../onChain/DAOHaus/overall/proposals.csv',
                       delimiter=",")
proposalsStr = genfromtxt(
    '../../onChain/DAOHaus/overall/proposals.csv', delimiter=",", dtype=str)

# prepare and clean data
propOutcomes = np.empty((len(proposals[:, 1]), 6))
for idx, prop in enumerate(proposals):
    # voter participation
    propOutcomes[idx][0] = prop[4] + prop[5]
    # shares majority
    propOutcomes[idx][1] = 0
    # outcome
    propOutcomes[idx][2] = 0
    # shares participation
    propOutcomes[idx][3] = prop[6] + prop[7]
    # voter vs shares outcome differ
    propOutcomes[idx][4] = 0
    # voter majority
    propOutcomes[idx][5] = 0
    if prop[6] > prop[7]:
        propOutcomes[idx][1] = prop[6]/(prop[6]+prop[7])
        propOutcomes[idx][2] = 1
        if prop[4] <= prop[5]:
            propOutcomes[idx][4] = 1
            propOutcomes[idx][5] = prop[5]/(prop[4]+prop[5])
        else:
            propOutcomes[idx][5] = prop[4]/(prop[4]+prop[5])
    elif prop[7] > prop[6]:
        propOutcomes[idx][1] = prop[7]/(prop[6]+prop[7])
        propOutcomes[idx][2] = 0
        if prop[5] <= prop[4]:
            propOutcomes[idx][4] = 1
            propOutcomes[idx][5] = prop[4]/(prop[4]+prop[5])
        else:
            propOutcomes[idx][5] = prop[5]/(prop[4]+prop[5])
propOutcomes = propOutcomes[propOutcomes[:, 1] != 0, :]
print(np.count_nonzero(propOutcomes[:, 4])/len(propOutcomes[:, 4]))


# Controvercy jointplot hex
fig4, ax4 = plt.subplots()
sns.set_theme(style="ticks")
ax4.set_box_aspect(1)
s1 = sns.jointplot(x=propOutcomes[:, 0], y=propOutcomes[:, 1], kind="hex",
                   norm=mpl.colors.LogNorm(), marginal_kws=dict(bins=13), joint_kws=dict(gridsize=15), color="#4CB391")
s1.ax_joint.set_xlabel('Voters')
s1.ax_joint.set_ylabel('Majority')

# Controvercy histrogram
fig5, ax5 = plt.subplots()
ax5.hist(propOutcomes[:, 1], edgecolor='white', linewidth=1.2, color="#4CB391")
ax5.set_yscale("log")
ax5.set_ylabel("Frequency (log)")
ax5.set_xlabel("Size of Majority")


# Controvercy jointplot hex
# norm = np.linalg.norm(propOutcomes[:, 3])
# normal_array = propOutcomes[:, 3]/norm
# sns.set_theme(style="ticks")
# s2 = sns.scatterplot(x=propOutcomes[:, 0], y=normal_array)
# s2.set_xlabel('Votes')
# s2.set_ylabel('Shares')


# outcomes = np.append(propOutcomes[:, 1], propOutcomes[:, 5], axis=1)
sns.set_theme(style="ticks", palette="Set2")
fig6, ax6 = plt.subplots()
ax6.set_box_aspect(1)
outcomes = np.column_stack((propOutcomes[:, 1], propOutcomes[:, 5]))
outcomes = pd.DataFrame(outcomes, columns=['Share Majority', 'Vote Majority'])
print(outcomes)

s3 = sns.lmplot(data=outcomes, x="Share Majority", y="Vote Majority")

fig7, ax7 = plt.subplots()
outcomes = np.column_stack((propOutcomes[:, 1], propOutcomes[:, 5]))
outcomes = pd.DataFrame(outcomes, columns=['Share Majority', 'Vote Majority'])
print(outcomes)
sns.set_theme(style="ticks")
s4 = sns.regplot(data=outcomes, x="Share Majority",
                 y="Vote Majority", scatter=False)


plt.show()
