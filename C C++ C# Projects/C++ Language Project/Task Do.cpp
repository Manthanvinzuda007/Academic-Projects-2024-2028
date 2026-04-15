#include <iostream>
#include <vector>
#include <string>

using namespace std;

// Function to display the main menu
void displayMenu() {
    cout << "\n=== To-Do List Manager ===\n";
    cout << "1. Add a Task\n";
    cout << "2. View Tasks\n";
    cout << "3. Delete a Task\n";
    cout << "4. Exit\n";
    cout << "Enter your choice: ";
}

int main() {
    // Vector to store our list of tasks
    vector<string> tasks;
    int choice;
    string task;
    int taskNumber;

    cout << "Welcome to your To-Do List!\n";

    while (true) {
        displayMenu();
        cin >> choice;

        // Clear the newline character from the input buffer so getline() works properly later
        cin.ignore();

        switch (choice) {
            case 1:
                cout << "Enter the task description: ";
                getline(cin, task); // getline allows the user to include spaces
                tasks.push_back(task);
                cout << "Task added successfully!\n";
                break;
                
            case 2:
                if (tasks.empty()) {
                    cout << "Your To-Do list is currently empty.\n";
                } else {
                    cout << "\n--- Your Tasks ---\n";
                    for (size_t i = 0; i < tasks.size(); ++i) {
                        cout << i + 1 << ". " << tasks[i] << "\n";
                    }
                }
                break;
                
            case 3:
                if (tasks.empty()) {
                    cout << "There are no tasks to delete.\n";
                } else {
                    cout << "Enter the task number to delete: ";
                    cin >> taskNumber;
                    
                    // Validate that the user entered a correct task number
                    if (taskNumber > 0 && taskNumber <= tasks.size()) {
                        tasks.erase(tasks.begin() + taskNumber - 1);
                        cout << "Task deleted successfully.\n";
                    } else {
                        cout << "Invalid task number!\n";
                    }
                }
                break;
                
            case 4:
                cout << "Exiting program. Goodbye!\n";
                return 0; // Exit the program
                
            default:
                cout << "Invalid choice. Please enter a number between 1 and 4.\n";
        }
    }

    return 0;
}
