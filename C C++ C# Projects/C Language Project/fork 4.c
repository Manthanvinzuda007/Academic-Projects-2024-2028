#include <unistd.h>
#include <stdio.h>
#include <sys/types.h>

int main() {
    pid_t pid = fork();

    if (pid < 0) {
        printf("Fork failed\n");
        return 1;
    }
    else if (pid == 0) {
        // Child process
        printf("Hello from CHILD (PID: %d)\n", getpid());
    }
    else {
        // Parent process
        printf("Hello from PARENT (PID: %d, Child PID: %d)\n", getpid(), pid);
    }

    return 0;
}
