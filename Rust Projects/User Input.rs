use std::io; // 1. Input/Output Library 

fn main() {
    println!("What Is Your Pretty Name?"); // Print In Screen

    // 2. Create Mutable Variable ( Why? Because Mutable Variable Is Changeble )
    let mut name = String::new();

    // 3. Put User Input 
    io::stdin()
        .read_line(&mut name)
        .expect("Input wanchva ma error aavi");

    // 4. Output print
    // .trim() Use Because The Extra Space Cancle If User press Enter 
    println!("Namaste {}! Rust World ma swagat chhe.", name.trim());
}

