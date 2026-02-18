#include <iostream>
using namespace std;

int main() {
    int rows = 4;
    int count = 1; // This number will keep increasing

    for (int i = 1; i <= rows; i++) {
        for (int j = 1; j <= i; j++) {
            cout << count << " "; 
            count++; // Increment count every time we print
        }
        cout << endl;
    }
    return 0;
}
