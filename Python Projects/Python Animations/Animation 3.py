import numpy as np
import matplotlib.pyplot as plt
import matplotlib.animation as animation
from mpl_toolkits.mplot3d import Axes3D

# --- 1. Deep Space 3D Canvas Setup ---
fig = plt.figure(figsize=(10, 10), facecolor='black')
ax = fig.add_subplot(111, projection='3d', facecolor='black')
fig.subplots_adjust(left=0, right=1, bottom=0, top=1)

# Remove the grid panels to make it look like a pure void
ax.axis('off')
ax.set_xlim(-10, 10)
ax.set_ylim(-10, 10)
ax.set_zlim(-6, 6)

# --- 2. Einstein-Rosen Bridge Math (Flamm's Paraboloid) ---
rs = 1.0  # The Schwarzschild radius (radius of the throat)
r = np.linspace(rs, 10, 40)       # Distance outward from the throat
theta = np.linspace(0, 2*np.pi, 40) # 360 degrees around the center
R, Theta = np.meshgrid(r, theta)

# Parametric equations for the 3D surface
X = R * np.cos(Theta)
Y = R * np.sin(Theta)

# The Z-axis calculates the bending of space-time
# Top universe (+) and Bottom universe (-)
Z_top = 2 * np.sqrt(rs * (R - rs))
Z_bottom = -2 * np.sqrt(rs * (R - rs))

# Draw the space-time fabric (cyan for our universe, purple for the other side)
ax.plot_wireframe(X, Y, Z_top, color='#00ffff', alpha=0.3, linewidth=0.7)
ax.plot_wireframe(X, Y, Z_bottom, color='#cc00ff', alpha=0.3, linewidth=0.7)

# --- 3. The Traveling Particle Setup ---
particle, = ax.plot([], [], [], marker='o', color='white', markersize=6, markeredgecolor='cyan')
trail, = ax.plot([], [], [], color='#ffffff', alpha=0.8, linewidth=2)

# Memory arrays to draw the light trail
history_x, history_y, history_z = [], [], []

def animate(i):
    """Update camera angle and particle position per frame."""
    # Rotate the whole universe slowly
    ax.view_init(elev=15, azim=i * 0.5)

    # Particle time simulation (t cycles from -1.0 to 1.0)
    # -1 is top outer edge, 0 is the throat, +1 is bottom outer edge
    cycle_length = 200
    t = ((i % cycle_length) / (cycle_length / 2)) - 1.0 
    
    # Calculate radius: speeds up as it gets closer to the center (gravity)
    r_curr = rs + 9 * (t**2)
    
    # Calculate Z (height) based on which half of the wormhole we are in
    z_curr = 2 * np.sqrt(rs * (r_curr - rs))
    if t > 0:
        z_curr = -z_curr  # Switch to bottom universe
        
    # Particle spirals as it falls in
    theta_curr = i * 0.15
    
    x_curr = r_curr * np.cos(theta_curr)
    y_curr = r_curr * np.sin(theta_curr)
    
    # Update particle 3D position
    particle.set_data([x_curr], [y_curr])
    particle.set_3d_properties([z_curr])
    
    # Update the light trail
    history_x.append(x_curr)
    history_y.append(y_curr)
    history_z.append(z_curr)
    
    if len(history_x) > 30: # Trail length
        history_x.pop(0)
        history_y.pop(0)
        history_z.pop(0)
        
    trail.set_data(history_x, history_y)
    trail.set_3d_properties(history_z)
    
    return particle, trail

# --- 4. Execute Wormhole Simulation ---
# blit=False is safer for complex 3D rendering in matplotlib
ani = animation.FuncAnimation(
    fig, animate, frames=600, interval=30, blit=False
)

plt.show()