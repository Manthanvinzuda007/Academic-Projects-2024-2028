#include <stdio.h>

int main() {
    char operator;
    double first, second, result;

    printf("----------------------------\n");
    printf("    Simple C Calculator     \n");
    printf("----------------------------\n");

    // 1. Ask the user for an operator
    printf("Enter an operator (+, -, *, /): ");
    scanf("%c", &operator);

    // 2. Ask for the two numbers
    printf("Enter two operands (numbers): ");
    scanf("%lf %lf", &first, &second);

    // 3. Perform calculation based on the operator
    switch (operator) {
        case '+':
            result = first + second;
            printf("\nResult: %.2lf + %.2lf = %.2lf\n", first, second, result);
            break;

        case '-':
            result = first - second;
            printf("\nResult: %.2lf - %.2lf = %.2lf\n", first, second, result);
            break;

        case '*':
            result = first * second;
            printf("\nResult: %.2lf * %.2lf = %.2lf\n", first, second, result);
            break;

        case '/':
            // Handle division by zero error
            if (second != 0.0) {
                result = first / second;
                printf("\nResult: %.2lf / %.2lf = %.2lf\n", first, second, result);
            } else {
                printf("\nError! Division by zero is not allowed.\n");
            }
            break;

        // If the user enters a symbol other than +, -, *, /
        default:
            printf("\nError! Operator is not correct.\n");
    }

    return 0;
}

