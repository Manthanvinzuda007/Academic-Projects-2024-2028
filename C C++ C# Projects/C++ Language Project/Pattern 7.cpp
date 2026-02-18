#include <iostream>
using namespace std;

int main() {
    int rows = 5;

    for (int i = 1; i <= rows; i++) {
        // Spacing for the triangle shape
        for (int space = 1; space <= rows - i; space++) cout << "  ";

        int coefficient = 1; // Every row starts with 1
        for (int j = 1; j <= i; j++) {
            cout << coefficient << "   ";
            
            // This math trick calculates the next number in the row
            coefficient = coefficient * (i - j) / j;
        }
        cout << endl;
    }

    return 0;
}
