import numpy as np
import matplotlib.pyplot as plt
import matplotlib.animation as animation

# --- 1. Vintage Space Canvas Setup ---
# Deep space blue/black background
fig, ax = plt.subplots(figsize=(8, 8), facecolor='#0b0f19')
fig.subplots_adjust(left=0, right=1, bottom=0, top=1)
ax.set_facecolor('#0b0f19')
ax.axis('off')

# Keep the camera fixed so we can watch the orbit
ax.set_xlim(-6, 6)
ax.set_ylim(-6, 6)

# --- 2. Old Scientist Math Parameters ---
R1 = 3.0  # Radius of the primary orbit (Deferent)
w1 = 1.0  # Rotational speed of the primary orbit
R2 = 1.4  # Radius of the secondary mini-orbit (Epicycle)
w2 = 6.0  # Rotational speed of the mini-orbit

# --- 3. Creating the Visual Elements ---
# The faint ancient orbital paths
main_circle, = ax.plot([], [], color='#4a5b78', alpha=0.4, linestyle='--', lw=1.5)
epicycle, = ax.plot([], [], color='#6e8cb8', alpha=0.6, lw=1)

# The planet and its glowing trail
planet, = ax.plot([], [], 'o', color='#ffd700', markersize=10, markeredgecolor='white')
trail, = ax.plot([], [], color='#ffaa00', lw=2, alpha=0.8)

# Arrays to store the path the planet draws
history_x, history_y = [], []

def init():
    """Start with empty space."""
    main_circle.set_data([], [])
    epicycle.set_data([], [])
    planet.set_data([], [])
    trail.set_data([], [])
    return main_circle, epicycle, planet, trail

def animate(i):
    """Calculate the planetary motion for each frame."""
    t = i * 0.02  # Time step
    
    # Draw the primary orbit path
    theta = np.linspace(0, 2*np.pi, 100)
    main_circle.set_data(R1 * np.cos(theta), R1 * np.sin(theta))
    
    # Calculate the moving center of the mini-orbit
    cx = R1 * np.cos(w1 * t)
    cy = R1 * np.sin(w1 * t)
    
    # Draw the mini-orbit
    epicycle.set_data(cx + R2 * np.cos(theta), cy + R2 * np.sin(theta))
    
    # Calculate the exact position of the planet
    px = cx + R2 * np.cos(w2 * t)
    py = cy + R2 * np.sin(w2 * t)
    
    # Update planet position (matplotlib requires sequences like lists)
    planet.set_data([px], [py])
    
    # Update the glowing trail
    history_x.append(px)
    history_y.append(py)
    
    # Limit the trail length so it looks like a sweeping comet tail
    if len(history_x) > 150:
        history_x.pop(0)
        history_y.pop(0)
        
    trail.set_data(history_x, history_y)
    
    return main_circle, epicycle, planet, trail

# --- 4. Execute the Space Experiment ---
ani = animation.FuncAnimation(
    fig, animate, frames=800, init_func=init, interval=20, blit=True
)

plt.show()