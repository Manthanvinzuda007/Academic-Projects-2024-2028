use std::io::{self, Write}; // io Library import kari

// 1. Struct Definition
struct Task {
    id: u32,
    name: String,
    completed: bool,
}

// 2. Methods for Task
impl Task {
    fn new(id: u32, name: String) -> Task {
        Task {
            id,
            name,
            completed: false,
        }
    }
}

fn main() {
    let mut tasks: Vec<Task> = Vec::new();
    let mut next_id = 1;

    loop {
        // Menu Display
        println!("\n--- Rust Todo Manager ---");
        println!("1. Add Task");
        println!("2. View Tasks");
        println!("3. Complete Task");
        println!("4. Exit");
        print!("Enter your choice: ");
        
        // Aa line ensure kare che ke "Enter your choice: " screen par dekhay
        io::stdout().flush().unwrap();

        let mut choice_input = String::new();
        io::stdin().read_line(&mut choice_input).expect("Failed to read line");

        // Input ne number ma convert karvano try kariye
        let choice: u32 = match choice_input.trim().parse() {
            Ok(num) => num,
            Err(_) => {
                println!("Error: Please enter a valid number!");
                continue; // Loop mathi fari sharu karo
            }
        };

        match choice {
            1 => {
                print!("Enter task name: ");
                io::stdout().flush().unwrap();
                
                let mut name = String::new();
                io::stdin().read_line(&mut name).expect("Failed to read line");
                
                let clean_name = name.trim().to_string();
                if clean_name.is_empty() {
                    println!("Task name cannot be empty!");
                } else {
                    let task = Task::new(next_id, clean_name);
                    tasks.push(task);
                    println!("Task added successfully with ID: {}", next_id);
                    next_id += 1;
                }
            }
            2 => {
                println!("\n--- Your Tasks ---");
                if tasks.is_empty() {
                    println!("No tasks found.");
                } else {
                    for task in &tasks {
                        let status = if task.completed { "[DONE]" } else { "[PENDING]" };
                        println!("ID: {} | {} | {}", task.id, status, task.name);
                    }
                }
            }
            3 => {
                print!("Enter Task ID to complete: ");
                io::stdout().flush().unwrap();
                
                let mut id_input = String::new();
                io::stdin().read_line(&mut id_input).expect("Failed to read line");

                let id_to_find: u32 = match id_input.trim().parse() {
                    Ok(num) => num,
                    Err(_) => {
                        println!("Invalid ID format.");
                        0 // 0 ID koi divas hato nathi etle safe che
                    }
                };

                // Find task and update
                let mut found = false;
                for task in tasks.iter_mut() {
                    if task.id == id_to_find {
                        task.completed = true;
                        found = true;
                        println!("Task {} marked as DONE!", id_to_find);
                        break;
                    }
                }
                
                if !found && id_to_find != 0 {
                    println!("Task with ID {} not found.", id_to_find);
                }
            }
            4 => {
                println!("Exiting program. Goodbye!");
                break;
            }
            _ => {
                println!("Invalid option! Please select 1-4.");
            }
        }
    }
}
