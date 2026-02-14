#include <iostream>
#include <vector>
#include <string>

using namespace std;

// Define a structure to hold student details
struct Student {
    int id;
    string name;
    int age;
    string course;
};

// Function to display the menu
void showMenu() {
    cout << "\n--- Student Management System ---" << endl;
    cout << "1. Add New Student" << endl;
    cout << "2. View All Students" << endl;
    cout << "3. Search Student by ID" << endl;
    cout << "4. Delete Student" << endl;
    cout << "5. Exit" << endl;
    cout << "Enter your choice: ";
}

int main() {
    vector<Student> database; // This stores our students in memory
    int choice;

    while (true) {
        showMenu();
        cin >> choice;

        // Error handling for non-integer input
        if (cin.fail()) {
            cin.clear();
            cin.ignore(1000, '\n');
            cout << "Invalid input. Please enter a number." << endl;
            continue;
        }

        if (choice == 1) {
            // ADD STUDENT
            Student s;
            cout << "Enter ID: "; cin >> s.id;
            cin.ignore(); // Clear buffer before reading string
            cout << "Enter Name: "; getline(cin, s.name);
            cout << "Enter Age: "; cin >> s.age;
            cin.ignore();
            cout << "Enter Course: "; getline(cin, s.course);
            
            database.push_back(s);
            cout << "Student added successfully!" << endl;

        } else if (choice == 2) {
            // VIEW ALL STUDENTS
            if (database.empty()) {
                cout << "No records found." << endl;
            } else {
                cout << "\nID\tName\t\tAge\tCourse" << endl;
                for (const auto& s : database) {
                    cout << s.id << "\t" << s.name << "\t\t" << s.age << "\t" << s.course << endl;
                }
            }

        } else if (choice == 3) {
            // SEARCH STUDENT
            int searchId;
            bool found = false;
            cout << "Enter ID to search: "; cin >> searchId;
            
            for (const auto& s : database) {
                if (s.id == searchId) {
                    cout << "Found! Name: " << s.name << ", Course: " << s.course << endl;
                    found = true;
                    break;
                }
            }
            if (!found) cout << "Student not found." << endl;

        } else if (choice == 4) {
            // DELETE STUDENT
            int deleteId;
            cout << "Enter ID to delete: "; cin >> deleteId;
            
            for (size_t i = 0; i < database.size(); i++) {
                if (database[i].id == deleteId) {
                    database.erase(database.begin() + i);
                    cout << "Student record deleted." << endl;
                    break;
                }
            }

        } else if (choice == 5) {
            cout << "Exiting program. Goodbye!" << endl;
            break;
        } else {
            cout << "Invalid choice, try again." << endl;
        }
    }

    return 0;
}
