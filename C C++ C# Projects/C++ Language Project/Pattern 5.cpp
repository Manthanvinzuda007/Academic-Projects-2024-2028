
#include <iostream>
using namespace std;

int main() {
    int rows = 5;

    for (int i = 1; i <= rows; i++) {
        // First Inner Loop: Prints the spaces to push stars to the right
        for (int j = 1; j <= rows - i; j++) {
            cout << "  "; 
        }
        // Second Inner Loop: Prints the stars
        for (int k = 1; k <= i; k++) {
            cout << "* ";
        }
        cout << endl;
    }
    return 0;
}
