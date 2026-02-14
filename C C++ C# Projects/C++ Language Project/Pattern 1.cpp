// By Manthan Vinzuda 
#include <iostream>
using namespace std;

int main() {
    int rows = 5; // This determines the height of your triangle

    // The OUTER loop handles the ROWS (vertical)
    for (int i = 1; i <= rows; i++) {
        
        // The INNER loop handles the COLUMNS (horizontal)
        // It runs 'i' times, so row 1 gets 1 star, row 2 gets 2 stars...
        for (int j = 1; j <= i; j++) {
            cout << "* ";
        }

        // After printing stars in a row, move to the next line
        cout << endl;
    }

    return 0;
}
