#include <stdio.h>
#include <unistd.h>   // usleep()

int main() {
    char name[] = "VINZUDA";
    int i;

    printf("\033[2J");  // clear screen
    printf("\033[H");

    printf("Typing: ");

    for (i = 0; name[i] != '\0'; i++) {
        printf("%c", name[i]);
        fflush(stdout);      // force print immediately
        usleep(300000);      // delay (0.3 sec)
    }

    printf("\n");

    return 0;
}
