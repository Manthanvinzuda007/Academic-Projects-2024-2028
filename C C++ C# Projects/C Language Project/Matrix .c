#include <stdio.h>
#include <stdlib.h>
#include <unistd.h>
#include <time.h>

#define WIDTH 80
#define HEIGHT 25

int drops[WIDTH];

void initDrops() {
    for (int i = 0; i < WIDTH; i++) {
        drops[i] = rand() % HEIGHT;
    }
}

int main() {
    srand(time(NULL));
    initDrops();

    while (1) {

        printf("\033[H");   // move cursor to top (no full clear → smooth scroll)
        printf("\033[32m");

        for (int row = 0; row < HEIGHT; row++) {
            for (int col = 0; col < WIDTH; col++) {

                if (row == drops[col]) {
                    printf("%c", 33 + rand() % 94);
                }
                else if (row < drops[col] && row > drops[col] - 5) {
                    printf("%c", 33 + rand() % 94); // trail effect
                }
                else {
                    printf(" ");
                }
            }
            printf("\n");
        }

        // update drops
        for (int i = 0; i < WIDTH; i++) {
            drops[i]++;
            if (drops[i] > HEIGHT + 5)
                drops[i] = 0;
        }

        usleep(40000);
    }

    printf("\033[0m");
    return 0;
}
