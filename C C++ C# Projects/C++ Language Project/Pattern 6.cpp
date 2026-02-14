
#include <iostream>
using namespace std;

int main() {
    int n = 5; // Size of the top half

    // PART 1: The Top Pyramid
    for (int i = 1; i <= n; i++) {
        // Space loop (decreases as stars increase)
        for (int j = 1; j <= n - i; j++) cout << " ";
        // Star loop (always odd numbers: 1, 3, 5...)
        for (int k = 1; k <= (2 * i - 1); k++) cout << "*";
        cout << endl;
    }

    // PART 2: The Bottom Inverted Pyramid
    for (int i = n - 1; i >= 1; i--) {
        // Space loop (increases as stars decrease)
        for (int j = 1; j <= n - i; j++) cout << " ";
        // Star loop
        for (int k = 1; k <= (2 * i - 1); k++) cout << "*";
        cout << endl;
    }

    return 0;
}
