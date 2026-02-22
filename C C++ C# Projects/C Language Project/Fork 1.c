#include <unistd.h>
#include <stdio.h>

int main() {
    if(fork()==0){
        fork();
    }
    printf("Hi I'm Manthan Vinzuda\n");

    return 0;
}
