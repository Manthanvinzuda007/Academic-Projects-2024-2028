#include <stdio.h>
#include <stdlib.h>
#include <stdbool.h>

#define STACK_MAX 256

typedef enum {
    PUSH,
    ADD,
    SUB,
    MUL,
    DIV,
    PRINT,
    HALT
} Instruction;

int stack[STACK_MAX];
int sp = -1;

void push(int value) {
    if (sp >= STACK_MAX - 1) {
        fprintf(stderr, "Fatal Error: Stack Overflow\n");
        exit(1);
    }
    stack[++sp] = value;
}

int pop() {
    if (sp < 0) {
        fprintf(stderr, "Fatal Error: Stack Underflow\n");
        exit(1);
    }
    return stack[sp--];
}

void execute(int program[], int size) {
    int pc = 0;
    bool running = true;

    while (running && pc < size) {
        int instruction = program[pc];

        switch (instruction) {
            case PUSH: {
                int value = program[++pc];
                push(value);
                break;
            }
            case ADD: {
                int b = pop();
                int a = pop();
                push(a + b);
                break;
            }
            case SUB: {
                int b = pop();
                int a = pop();
                push(a - b);
                break;
            }
            case MUL: {
                int b = pop();
                int a = pop();
                push(a * b);
                break;
            }
            case DIV: {
                int b = pop();
                if (b == 0) {
                    fprintf(stderr, "Fatal Error: Division by zero\n");
                    exit(1);
                }
                int a = pop();
                push(a / b);
                break;
            }
            case PRINT: {
                int value = pop();
                printf("VM Output: %d\n", value);
                break;
            }
            case HALT: {
                printf("VM Halted Successfully.\n");
                running = false;
                break;
            }
            default:
                fprintf(stderr, "Fatal Error: Unknown instruction '%d'\n", instruction);
                exit(1);
        }
        pc++;
    }
}

int main() {
    int my_program[] = {
        PUSH, 10,
        PUSH, 20,
        ADD,
        PUSH, 3,
        MUL,
        PRINT,
        HALT
    };

    int program_size = sizeof(my_program) / sizeof(my_program[0]);

    printf("Booting Virtual Machine...\n");
    execute(my_program, program_size);

    return 0;
}
