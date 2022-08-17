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
import pandas as pd
import seaborn as sns


def lorenz(arr):
    scaled_prefix_sum = arr.cumsum() / arr.sum()
    return np.insert(scaled_prefix_sum, 0, 0)


def nakamoto(arr):
    arr = np.sort(arr)
    arr = np.flip(arr)
    total = np.sum(arr)
    sum = 0
    for idx, element in enumerate(arr):
        sum += element
        if sum/total > 0.5:
            count = idx+1
            return count


def shareTime(path):
    balances = []
    ginis = []
    nakamotos = []
    with open(path, "r") as f:
        reader = csv.reader(f, delimiter=",")
        for i, line in enumerate(reader):
            balances += line[1:-1]
            arr = np.asarray(line[1:-1], dtype=float)
            arr = arr[arr != 0]
            if len(arr) != 0:
                ginis.append(gini(arr))
                nakamotos.append(nakamoto(arr))
    # ginis = ginis[ginis != 0]
    return(ginis, nakamotos)


# Curve
membersCurve = genfromtxt(
    '../onChain/ProtocolDAOs/Curve/members.csv', delimiter=',')
membersStrCurve = genfromtxt(
    '../onChain/ProtocolDAOs/Curve/members.csv', delimiter=',', dtype="str")
holdersCurve = membersCurve[membersCurve[:, 2] != 0, ]
lorenzCurve = lorenz(np.sort(holdersCurve[:, 2]))
(giniCurve, nakamotoCurve) = shareTime(
    '../onChain/ProtocolDAOs/Curve/shareTime2.csv')
print("curve:", giniCurve, nakamotoCurve)

# Maker
membersMaker = genfromtxt(
    '../onChain/ProtocolDAOs/makerDao/members.csv', delimiter=',')
holdersMaker = membersMaker[membersMaker[:, 2] != 0, ]
lorenzMaker = lorenz(np.sort(holdersMaker[:, 2]))

# Uniswap
membersUni = genfromtxt(
    '../onChain/ProtocolDAOs/uniswap/members.csv', delimiter=',')
holdersUni = membersUni[membersUni[:, 1] != 0, ]
lorenzUni = lorenz(np.sort(holdersUni[:, 1]))
# (giniUni, nakamotoUni) = shareTime(
#     '../onChain/ProtocolDAOs/uniswap/shareTime.csv')
# print(giniUni, nakamotoUni)

# dxDao
membersDx = genfromtxt(
    '../onChain/DAOStack/dxDAO/reputationBalancesFormatted.csv', delimiter=';')
holdersDx = membersDx[membersDx[:, 0] != 0, ]
lorenzDx = lorenz(np.sort(holdersDx[1:, 0]))
shareTimeDx = genfromtxt(
    '../onChain/DAOStack/dxDAO/repTime.csv', delimiter=',')
(giniDx, nakamotoDx) = shareTime('../onChain/DAOStack/dxDAO/repTime.csv')
print("Dx:", giniDx, nakamotoDx)


# Lao
membersLao = genfromtxt(
    '../onChain/DAOHaus/theLAO/members.csv', delimiter=',')
holdersLao = membersLao[membersLao[:, 2] != 0, ]
lorenzLao = lorenz(np.sort(holdersLao[:, 2]))
(giniLao, nakamotoLao) = shareTime(
    '../onChain/DAOHaus/theLAO/shareTime.csv')
print("Lao:", giniLao, nakamotoLao)


# Meta
membersMeta = genfromtxt(
    '../onChain/DAOHaus/MetaCartel/members.csv', delimiter='","', skip_header=1, dtype=float)
holdersMeta = membersMeta[membersMeta[:, 1] != 0, ]
lorenzMeta = lorenz(np.sort(holdersMeta[:, 1]))
(giniMeta, nakamotoMeta) = shareTime(
    '../onChain/DAOHaus/MetaCartel/shareTimeOld.csv')
print("Meta:", giniMeta, nakamotoMeta)

# Moloch
membersMoloch = genfromtxt(
    '../onChain/DAOHaus/Moloch/membersWeb.csv', delimiter='","', skip_header=1, dtype=float)
holdersMoloch = membersMoloch[membersMoloch[:, 1] != 0, ]
lorenzMoloch = lorenz(np.sort(holdersMoloch[:, 1]))
(giniMoloch, nakamotoMoloch) = shareTime(
    '../onChain/DAOHaus/Moloch/shareTime.csv')
print("Moloch:", giniMoloch, nakamotoMoloch)


# ###################### gini CURVE ###########################
# # https://gist.github.com/CMCDragonkai/c79b9a0883e31b327c88bfadb8b06fc4
# # ensure your arr is sorted from lowest to highest values first!


with sns.color_palette("tab20", n_colors=10):
    with sns.axes_style("darkgrid"):
        fig1, ax1 = plt.subplots()
        ax1.plot(np.linspace(0.0, 1.0, lorenzDx.size),
                 lorenzDx, label='dxDao', linestyle='dotted')
        ax1.plot(np.linspace(0.0, 1.0, lorenzLao.size),
                 lorenzLao, label='Lao', linestyle='dashed')
        ax1.plot(np.linspace(0.0, 1.0, lorenzMeta.size),
                 lorenzMeta, label='Meta', linestyle='dashed')
        ax1.plot(np.linspace(0.0, 1.0, lorenzMoloch.size),
                 lorenzMoloch, linestyle='dashed', label='Moloch')
        ax1.plot(np.linspace(0.0, 1.0, lorenzUni.size),
                 lorenzUni, label='Uniswap', linestyle='dashdot')
        ax1.plot(np.linspace(0.0, 1.0, lorenzCurve.size),
                 lorenzCurve, label='Curve', linestyle='dashdot')
        ax1.plot(np.linspace(0.0, 1.0, lorenzCurve.size),
                 lorenzCurve, label='Maker', linestyle='dashdot')
        # plot the straight line perfect equality curve
        ax1.plot([0, 1], [0, 1], label='Perfect Equality', c="black")
        ax1.legend()
        ax1.set_ylabel("Fraction of Voting Rights")
        ax1.set_xlabel("Fraction of Voters")


with sns.color_palette("tab20", n_colors=10):
    with sns.axes_style("darkgrid"):
        fig2, ax2 = plt.subplots()
        ax2.plot(np.linspace(0.0, 1.0, len(giniDx)),
                 giniDx, label='dxDao', linestyle='dotted')
        ax2.plot(np.linspace(0.0, 1.0, len(giniLao)),
                 giniLao, label='Lao', linestyle='dashed')
        ax2.plot(np.linspace(0.0, 1.0, len(giniMeta)),
                 giniMeta, label='Meta', linestyle='dashed')
        ax2.plot(np.linspace(0.0, 1.0, len(giniMoloch)),
                 giniMoloch, linestyle='dashed', label='Moloch')
        ax2.plot(np.linspace(0.0, 1.0, len(giniCurve)),
                 giniCurve, label='Curve', linestyle='dashdot')
        # plot the straight line perfect equality curve
        ax2.legend()
        ax2.set_ylabel("Gini")
        ax2.set_xlabel("Time Interval (normalized)")

with sns.color_palette("tab20", n_colors=10):
    with sns.axes_style("darkgrid"):
        fig3, ax3 = plt.subplots()
        ax3.plot(np.linspace(0.0, 1.0, len(nakamotoDx)),
                 nakamotoDx, label='dxDao', linestyle='dotted')
        ax3.plot(np.linspace(0.0, 1.0, len(nakamotoLao)),
                 nakamotoLao, label='Lao', linestyle='dashed')
        ax3.plot(np.linspace(0.0, 1.0, len(nakamotoMeta)),
                 nakamotoMeta, label='Meta', linestyle='dashed')
        ax3.plot(np.linspace(0.0, 1.0, len(nakamotoLao)),
                 nakamotoLao, linestyle='dashed', label='Moloch')
        ax3.plot(np.linspace(0.0, 1.0, len(nakamotoCurve)),
                 nakamotoCurve, label='Curve', linestyle='dashdot')
        # plot the straight line perfect equality curve
        ax3.legend()
        ax3.set_ylabel("Nakamoto Coefficient")
        ax3.set_xlabel("Time Interval (normalized)")

# with sns.color_palette("tab20", n_colors=10):
#     with sns.axes_style("darkgrid"):
#         fig4, ((ax1, ax2, ax3, ax4), (ax5, ax6, ax7, ax8)) = plt.subplots(2, 4)
#         fig4.suptitle('Sharing x per column, y per row')
#         ax1.pie(np.sort(holdersCurve[:, 2]),  radius=3, center=(4, 4),
#                 wedgeprops={"linewidth": 1, "edgecolor": "white"}, frame=True)
#         ax2.pie(np.sort(holdersDx[1:, 0]),  radius=3, center=(4, 4),
#                 wedgeprops={"linewidth": 1, "edgecolor": "white"}, frame=True)
#         ax3.pie(np.sort(holdersLao[:, 2]),  radius=3, center=(4, 4),
#                 wedgeprops={"linewidth": 1, "edgecolor": "white"}, frame=True)
#         ax4.pie(np.sort(holdersMaker[:, 2]),  radius=3, center=(4, 4),
#                 wedgeprops={"linewidth": 1, "edgecolor": "white"}, frame=True)
#         ax5.pie(np.sort(holdersMeta[:, 1]),  radius=3, center=(4, 4),
#                 wedgeprops={"linewidth": 1, "edgecolor": "white"}, frame=True)
#         ax6.pie(np.sort(holdersMoloch[:, 1]),  radius=3, center=(4, 4),
#                 wedgeprops={"linewidth": 1, "edgecolor": "white"}, frame=True)
#         ax7.pie(np.sort(holdersUni[:, 1]),  radius=3, center=(4, 4),
#                 wedgeprops={"linewidth": 1, "edgecolor": "white"}, frame=True)

with sns.axes_style("dark"):
    fig4, ((ax1, ax2, ax3, ax4), (ax5, ax6, ax7, ax8)) = plt.subplots(2, 4)
    fig4.delaxes(ax8)

    c1 = plt.get_cmap('Blues')(np.linspace(0.2, 0.7, len(holdersDx[1:, 0])))
    ax1.pie(np.sort(holdersDx[1:, 0]),  radius=3, center=(4, 4),
            wedgeprops={"linewidth": 1, "edgecolor": "white"}, frame=True, colors=c1)
    ax1.set_xticklabels([])
    ax1.tick_params(left=False, bottom=False)
    ax1.set_yticklabels([])
    ax1.set_title("dxDao")
    c2 = plt.get_cmap('Blues')(np.linspace(0.2, 0.7, 1000))
    ax2.pie(np.flip(np.flip(np.sort(holdersCurve[:, 2]))[:1000]),  radius=3, center=(4, 4),
            wedgeprops={"linewidth": 1, "edgecolor": "white"}, frame=True, colors=c2)
    ax2.set_xticklabels([])
    ax2.tick_params(left=False, bottom=False)
    ax2.set_yticklabels([])
    ax2.set_title("Curve")
    c3 = plt.get_cmap('Blues')(np.linspace(0.2, 0.7, len(holdersMaker[:, 2])))
    ax3.pie(np.flip(np.flip(np.sort(holdersMaker[:, 2]))[:1000]),  radius=3, center=(4, 4),
            wedgeprops={"linewidth": 1, "edgecolor": "white"}, frame=True, colors=c3)
    ax3.set_xticklabels([])
    ax3.tick_params(left=False, bottom=False)
    ax3.set_yticklabels([])
    ax3.set_title("Maker")
    c4 = plt.get_cmap('Blues')(np.linspace(0.2, 0.7, 1000))
    ax4.pie(np.flip(np.flip(np.sort(holdersUni[:, 1]))[:1000]),  radius=3, center=(4, 4),
            wedgeprops={"linewidth": 1, "edgecolor": "white"}, frame=True, colors=c4)
    ax4.set_xticklabels([])
    ax4.tick_params(left=False, bottom=False)
    ax4.set_yticklabels([])
    ax4.set_title("Uniswap")
    c5 = plt.get_cmap('Blues')(np.linspace(0.2, 0.7, len(holdersLao[:, 2])))
    ax5.pie(np.sort(holdersLao[:, 2]),  radius=3, center=(4, 4),
            wedgeprops={"linewidth": 1, "edgecolor": "white"}, frame=True, colors=c5)
    ax5.set_xticklabels([])
    ax5.tick_params(left=False, bottom=False)
    ax5.set_yticklabels([])
    ax5.set_title("Lao")
    c6 = plt.get_cmap('Blues')(np.linspace(0.2, 0.7, len(holdersMoloch[:, 1])))
    ax6.pie(np.sort(holdersMoloch[:, 1]),  radius=3, center=(4, 4),
            wedgeprops={"linewidth": 1, "edgecolor": "white"}, frame=True, colors=c6)
    ax6.set_xticklabels([])
    ax6.tick_params(left=False, bottom=False)
    ax6.set_yticklabels([])
    ax6.set_title("Moloch")
    c7 = plt.get_cmap('Blues')(np.linspace(0.2, 0.7, len(holdersMeta[:, 1])))
    ax7.pie(np.sort(holdersMeta[:, 1]),  radius=3, center=(4, 4),
            wedgeprops={"linewidth": 1, "edgecolor": "white"}, frame=True, colors=c7)
    ax7.set_xticklabels([])
    ax7.tick_params(left=False, bottom=False)
    ax7.set_yticklabels([])
    ax7.set_title("MetaCartel")
    fig4.tight_layout()


plt.show()

# C 2, M 2, U 1
# balancesCurve = []
# with open('../onChain/ProtocolDAOs/Curve/shareTime2.csv', "r") as f:
#     reader = csv.reader(f, delimiter=",")
#     for i, line in enumerate(reader):
#         balancesCurve += line[1:-1]
#         arr = np.asarray(line[1:-1], dtype=float)
#         arr = arr[arr != 0]
#         print(gini(arr))
#         print(np.amax(arr))
#         nakamoto(arr)
