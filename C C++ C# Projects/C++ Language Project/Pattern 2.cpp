// Manthan Vinzuda
#include <iostream>
using namespace std;

int main() {
    int rows = 5; // Total height of the pattern

    // The OUTER loop starts at 'rows' (5) and counts DOWN to 1
    for (int i = rows; i >= 1; i--) {
        
        // The INNER loop runs 'i' times
        // Since 'i' starts at 5, the first row gets 5 stars
        for (int j = 1; j <= i; j++) {
            cout << "* ";
        }

        // Move to the next line after the inner loop finishes
        cout << endl;
    }

    return 0;
}
