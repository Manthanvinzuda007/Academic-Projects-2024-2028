#include <stdio.h>
#include <unistd.h>

void printVinzudaRed() {
    printf("\033[31m"); // red color
    printf("  V     V  IIIII  N     N  ZZZZZ  U     U  DDDD    AAAAA\n");
    printf("  V     V    I    NN    N     Z   U     U  D   D   A   A\n");
    printf("   V   V     I    N N   N    Z    U     U  D   D   AAAAA\n");
    printf("    V V      I    N  N  N   Z     U     U  D   D   A   A\n");
    printf("     V     IIIII  N   N N  ZZZZZ   UUUUU   DDDD    A   A\n");
    printf("\033[0m"); // reset
}

void printVinzudaBlue() {
    printf("\033[34m"); // blue color
    printf("  V     V  IIIII  N     N  ZZZZZ  U     U  DDDD    AAAAA\n");
    printf("  V     V    I    NN    N     Z   U     U  D   D   A   A\n");
    printf("   V   V     I    N N   N    Z    U     U  D   D   AAAAA\n");
    printf("    V V      I    N  N  N   Z     U     U  D   D   A   A\n");
    printf("     V     IIIII  N   N N  ZZZZZ   UUUUU   DDDD    A   A\n");
    printf("\033[0m");
}

int main() {
    for (int i = 0; i < 20; i++) {
        printf("\033[2J");
        printf("\033[H");

        if (i % 2 == 0)
            printVinzudaRed();
        else
            printVinzudaBlue();

        usleep(200000);
    }
    return 0;
}
