// 1. ENUMS FOR ERRORS
// Instead of crashing, Rust uses Enums to define specific, predictable errors.
#[derive(Debug)]
enum BankError {
    InsufficientFunds,
    NegativeDeposit,
}

// 2. STRUCTS FOR DATA
// A struct holds the state of our account.
struct BankAccount {
    owner: String,
    balance: f64,
}

// 3. IMPL FOR LOGIC
// We attach methods to the struct using an 'impl' block.
impl BankAccount {
    // Constructor to create a new account
    fn new(owner: &str) -> BankAccount {
        BankAccount {
            owner: owner.to_string(),
            balance: 0.0,
        }
    }

    // '&mut self' means this method is allowed to modify (mutate) the account.
    // It returns a 'Result', which is either a success (Ok) or an error (Err).
    fn deposit(&mut self, amount: f64) -> Result<(), BankError> {
        if amount <= 0.0 {
            return Err(BankError::NegativeDeposit);
        }
        self.balance += amount;
        Ok(()) // Success, return nothing inside Ok()
    }

    fn withdraw(&mut self, amount: f64) -> Result<(), BankError> {
        if amount > self.balance {
            return Err(BankError::InsufficientFunds);
        }
        self.balance -= amount;
        Ok(())
    }

    // '&self' means this method only reads the data, it cannot change it.
    fn check_balance(&self) {
        println!("{}'s balance is: ${:.2}", self.owner, self.balance);
    }
}

// 4. MAIN FUNCTION
fn main() {
    // 'mut' is required because we plan to change the account balance.
    let mut account = BankAccount::new("Alice");

    // 5. PATTERN MATCHING
    // 'match' forces the programmer to handle both the success and the error.
    match account.deposit(100.0) {
        Ok(_) => println!("Deposit successful!"),
        Err(e) => println!("Error: {:?}", e),
    }

    account.check_balance();

    // Trying to withdraw more than we have to trigger our custom error
    match account.withdraw(150.0) {
        Ok(_) => println!("Withdrawal successful!"),
        Err(e) => println!("Error: {:?}", e), 
    }
}

