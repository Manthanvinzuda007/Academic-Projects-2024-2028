import numpy as np
import matplotlib.pyplot as plt
import matplotlib.animation as animation

# --- 1. Canvas Setup ---
fig, ax = plt.subplots(figsize=(8, 8), facecolor='black')
fig.subplots_adjust(left=0, right=1, bottom=0, top=1) # Remove margins
ax.set_facecolor('black')
ax.axis('off')

# --- 2. High-Level Math Parameters ---
# Time array: 15,000 points for ultra-smooth high-fidelity lines
t = np.linspace(0, 150, 15000)

# Frequencies (f), Damping/Decay (d), and Amplitudes (A)
# Tweaking these numbers creates entirely different mathematical universes
f1, f2, f3, f4 = 2.01, 3.0, 3.0, 2.0
d1, d2, d3, d4 = 0.004, 0.0065, 0.008, 0.019
A1, A2, A3, A4 = 2.0, 2.0, 2.0, 2.0

# Initialize the line object
line, = ax.plot([], [], lw=0.6, color='cyan')

# Set static axes limits based on amplitude
ax.set_xlim(-4.5, 4.5)
ax.set_ylim(-4.5, 4.5)

def init():
    """Initialize the animation frame."""
    line.set_data([], [])
    return line,

def animate(i):
    """Update the math and visuals for each frame."""
    # Animate the phase shifts (p) to make the geometry "evolve" and rotate
    p1 = i * 0.05
    p2 = i * 0.03
    p3 = i * 0.07
    p4 = i * 0.02
    
    # Calculate the coupled parametric equations with exponential decay
    x = (A1 * np.sin(f1 * t + p1) * np.exp(-d1 * t) + 
         A2 * np.sin(f2 * t + p2) * np.exp(-d2 * t))
    
    y = (A3 * np.sin(f3 * t + p3) * np.exp(-d3 * t) + 
         A4 * np.sin(f4 * t + p4) * np.exp(-d4 * t))
    
    # Dynamic RGB Color Math: Cycles colors smoothly based on frame index
    r = (np.sin(i * 0.03) + 1) / 2
    g = (np.sin(i * 0.05 + 2) + 1) / 2
    b = (np.sin(i * 0.07 + 4) + 1) / 2
    line.set_color((r, g, b))
    
    # Update the line data
    line.set_data(x, y)
    return line,

# --- 3. Execute Animation ---
# frames: duration of the loop, interval: ms between frames (controls speed)
ani = animation.FuncAnimation(
    fig, animate, frames=600, init_func=init, interval=20, blit=True
)

# Display the window
plt.show()