#include <iostream>
using namespace std;

int main() {
    int size = 5;

    for (int i = 1; i <= size; i++) {
        for (int j = 1; j <= size; j++) {
            // Logic: Print star ONLY if it's the first/last row or first/last column
            if (i == 1 || i == size || j == 1 || j == size) {
                cout << "* ";
            } else {
                cout << "  "; // Print two spaces for the empty middle
            }
        }
        cout << endl;
    }
    return 0;
}
