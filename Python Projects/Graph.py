
import numpy as np
import matplotlib.pyplot as plt
from matplotlib.animation import FuncAnimation

x = np.linspace(0, 2*np.pi, 100)

fig, ax = plt.subplots()
line, = ax.plot(x, np.sin(x))

def update(frame):
    line.set_ydata(np.sin(x + frame/10))
    return line,

ani = FuncAnimation(fig, update, frames=100, interval=50)
plt.show()
