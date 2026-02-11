#include <stdio.h>

int main() {
    int i, j, rows;

    printf("Enter number of rows: ");
    scanf("%d", &rows);

    printf("\n");
    // Outer loop row mate
    for (i = 1; i <= rows; ++i) {
        // Inner loop star print karva mate
        for (j = 1; j <= i; ++j) {
            printf("* ");
        }
        printf("\n"); // Navi line ma java mate
    }
    return 0;
}

