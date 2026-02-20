#include <stdio.h>

int main() {
    int i;

    for (i = 1; i <= 7; i++) {

        if (i == 1)
            printf("M     M   AAAAA   N     N  TTTTTTT  H     H   AAAAA   N     N\n");

        else if (i == 2)
            printf("MM   MM   A   A   NN    N     T     H     H   A   A   NN    N\n");

        else if (i == 3)
            printf("M M M M   AAAAA   N N   N     T     HHHHHHH   AAAAA   N N   N\n");

        else if (i == 4)
            printf("M  M  M   A   A   N  N  N     T     H     H   A   A   N  N  N\n");

        else if (i == 5)
            printf("M     M   A   A   N   N N     T     H     H   A   A   N   N N\n");

        else
            printf("\n");
    }

    return 0;
}
