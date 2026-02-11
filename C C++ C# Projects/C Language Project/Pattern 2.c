#include <stdio.h>

int main() {
    int i, space, k, rows;

    printf("Enter number of rows: ");
    scanf("%d", &rows);

    printf("\n");
    // Row mate loop
    for (i = 1; i <= rows; i++) {
        
        // Space print karva mate loop
        for (space = 1; space <= rows - i; space++) {
            printf("  "); // 2 space muki chhe jethi output saru lage
        }

        // Star print karva mate loop
        for (k = 1; k <= (2 * i - 1); k++) {
            printf("* ");
        }

        printf("\n");
    }
    return 0;
}

