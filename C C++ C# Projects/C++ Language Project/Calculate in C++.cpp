// By Manthan Vinzuda 
#include <iostream>
using namespace std;

int main() {
    double num1, num2;

    
    cout << "Enter first number: ";
    cin >> num1;
    cout << "Enter second number: ";
    cin >> num2;

    
    cout << "\n--- Result ---" << endl;
    cout << "Addition: " << num1 + num2 << endl;
    cout << "Subtraction: " << num1 - num2 << endl;
    cout << "Multiplication: " << num1 * num2 << endl;

    if(num2 != 0) {
        cout << "Division: " << num1 / num2 << endl;
    } else {
        cout << "Division: Not possible (Cannot divide by zero)" << endl;
    }

    return 0;
}
