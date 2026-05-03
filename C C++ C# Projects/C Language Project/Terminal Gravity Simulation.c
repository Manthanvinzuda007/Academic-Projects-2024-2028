#include <stdio.h>
#include <stdlib.h>
#include <unistd.h> // POSIX library for usleep()

#define WIDTH 50
#define HEIGHT 20

// Struct to hold particle coordinates and velocity
typedef struct {
    float x, y;
    float vx, vy;
} Particle;

int main() {
    Particle p = {10.0f, 2.0f, 1.2f, 0.0f};
    float gravity = 0.15f;
    float bounce_damping = 0.85f;

    // Infinite game loop for the simulation
    while (1) {
        // 1. Apply physics forces
        p.vy += gravity;
        p.x += p.vx;
        p.y += p.vy;

        // 2. Collision detection (Floor)
        if (p.y >= HEIGHT - 1) {
            p.y = HEIGHT - 1;
            p.vy = -p.vy * bounce_damping; // Reverse velocity & apply damping
        }
        
        // 3. Collision detection (Walls)
        if (p.x >= WIDTH - 1 || p.x <= 0) {
            p.vx = -p.vx; // Reverse X velocity
            p.x = p.x <= 0 ? 0 : WIDTH - 1;
        }

        // 4. Render the frame
        printf("\033[2J\033[H"); // ANSI escape code to clear terminal

        for (int i = 0; i < HEIGHT; i++) {
            for (int j = 0; j < WIDTH; j++) {
                if ((int)p.y == i && (int)p.x == j) {
                    printf("O"); // The bouncing ball
                } else if (i == HEIGHT - 1) {
                    printf("-"); // The solid ground
                } else {
                    printf(" "); // Empty space
                }
            }
            printf("\n");
        }

        // 5. Frame rate control (~30 FPS)
        usleep(30000); 
    }

    return 0;
}
