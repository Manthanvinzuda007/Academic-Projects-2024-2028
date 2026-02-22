#include <stdio.h>
#include <unistd.h>   // for usleep()

int main() {
    int i, j;

    for (i = 0; i < 40; i++) {
        printf("\033[2J");      // clear screen
        printf("\033[H");       // move cursor to top

        for (j = 0; j < i; j++) {
            printf(" ");
        }

        printf("MANTHAN\n");

        usleep(100000);  // delay (0.1 sec)
    }

    return 0;
}
