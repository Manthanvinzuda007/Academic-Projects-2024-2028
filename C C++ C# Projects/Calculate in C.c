#include <stdio.h>

int main() {
    double num1, num2;

    
    printf("Enter first number: ");
    scanf("%lf", &num1);
    printf("Enter second number: ");
    scanf("%lf", &num2);

    
    printf("\n--- Result ---\n");
    printf("Addition: %.2lf\n", num1 + num2);
    printf("Subtraction: %.2lf\n", num1 - num2);
    printf("Multiplication: %.2lf\n", num1 * num2);
    
    
    if(num2 != 0) {
        printf("Division: %.2lf\n", num1 / num2);
    } else {
        printf("Division: Not possible (Cannot divide by zero)\n");
    }

    return 0;
}
