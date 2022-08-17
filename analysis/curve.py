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


members = genfromtxt(
    '../onChain/ProtocolDAOs/Curve/members.csv', delimiter=',')
membersStr = genfromtxt(
    '../onChain/ProtocolDAOs/Curve/members.csv', delimiter=',', dtype="str")


def nakamoto(arr):
    arr = np.sort(arr)
    arr = np.flip(arr)
    total = np.sum(arr)
    sum = 0
    for idx, element in enumerate(arr):
        sum += element
        if sum/total > 0.5:
            count = idx+1
            print(sum, total, count)
            return count


balances = []
with open('../onChain/ProtocolDAOs/Curve/shareTime2.csv', "r") as f:
    reader = csv.reader(f, delimiter=",")
    for i, line in enumerate(reader):
        balances += line[1:-1]
        arr = np.asarray(line[1:-1], dtype=float)
        arr = arr[arr != 0]
        print(gini(arr))
        print(np.amax(arr))
        nakamoto(arr)


sum = np.sum(members[:, 2])
holders = members[members[:, 2] != 0, ]
diff = 510597471041147705889972244 - sum
argmax = np.argmax(members[:, 2])
membersWithout = np.delete(members, argmax, 0)
holders = members[members[:, 2] != 0, ]
holdersWithout = membersWithout[membersWithout[:, 2] != 0, ]
print(membersStr[argmax])
print(gini(holdersWithout[:, 2]))
print(gini(holders[:, 2]))


# # PIE CHART OF WEALTH
fig2, ax2 = plt.subplots()
colors = plt.get_cmap('Blues')(np.linspace(0.2, 0.7, len(members[:, 0])))
ax2.pie(np.sort(holders[:, 2]), colors=colors, radius=3, center=(4, 4), normalize=True,
        wedgeprops={"linewidth": 1, "edgecolor": "white"}, frame=True)
ax2.set_title("Shares by Member")

# # HISTOGRAM OF WEALTH
# fig3, ax3 = plt.subplots()
# ax3.hist(holders[:, 2])

# ###################### LORENZ CURVE ###########################
# # https://gist.github.com/CMCDragonkai/c79b9a0883e31b327c88bfadb8b06fc4
# # ensure your arr is sorted from lowest to highest values first!

fig11, ax11 = plt.subplots()


def lorenz(arr):
    # this divides the prefix sum by the total sum
    # this ensures all the values are between 0 and 1.0
    scaled_prefix_sum = arr.cumsum() / arr.sum()
    # this prepends the 0 value (because 0% of all people have 0% of all wealth)
    return np.insert(scaled_prefix_sum, 0, 0)


arr = np.sort(holders[:, 2])
# show the gini index!
print(gini(arr))
lorenz_curve = lorenz(arr)
# we need the X values to be between 0.0 to 1.0
ax11.plot(np.linspace(0.0, 1.0, lorenz_curve.size), lorenz_curve)
# plot the straight line perfect equality curve
ax11.plot([0, 1], [0, 1])
ax11.set_title("Lorenz Curve")

# fig3, ax3 = plt.subplots()
# values = np.column_stack((lorenz_curve))
# data1 = pd.DataFrame(lorenz_curve, columns=["A"])
# data2 = pd.DataFrame([0, 1], columns=["A"])
# data1 = data1.rolling(7).mean()
# sns.lineplot(data=data1, palette="tab10", linewidth=2.5)
# sns.lineplot(data=data2, palette="tab10", linewidth=2.5)


plt.show()
