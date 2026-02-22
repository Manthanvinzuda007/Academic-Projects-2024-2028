#include <unistd.h>
#include <stdio.h>

int main() {
    if(fork()&&fork()){
        fork();
    }
    printf("Hi I'm Manthan Vinzuda\n");

    return 0;
}
