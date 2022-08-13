import matplotlib.pyplot as plt
from numpy import genfromtxt
import numpy as np
from matplotlib import cm, pyplot as plt
from pygini import gini


members = genfromtxt('../makerDAO/members.csv', delimiter=',')
membersStr = genfromtxt('../makerDAO/members.csv', delimiter=',', dtype="str")
fig1, ax1 = plt.subplots()
colors = plt.get_cmap('Blues')(np.linspace(0.2, 0.7, len(members[:, 1])))
print(np.sum(members[:, 2]))
membersWith = members[members[:, 2] != 0, ]
argmax = np.argmax(members[:, 2])
print(membersStr[argmax])
print(len(membersWith))
ax1.pie(np.sort(membersWith[:, 2]), colors=colors, radius=3, center=(4, 4),
        wedgeprops={"linewidth": 1, "edgecolor": "white"}, frame=True)
plt.show()
