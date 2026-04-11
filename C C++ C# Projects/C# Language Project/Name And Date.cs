using System;

namespace SmallProgram
{
    class Program
    {
        static void Main(string[] args)
        {
            Console.WriteLine("Hello! What is your name?");
            
            string name = Console.ReadLine();
            
            Console.WriteLine($"\nNice to meet you, {name}!");
            
            Console.WriteLine($"Today's date is: {DateTime.Now.ToShortDateString()}");
            
            Console.WriteLine("\nPress any key to exit...");
            
            Console.ReadKey();
        }
    }
}using System;

namespace SmallProgram
{
    class Program
    {
        static void Main(string[] args)
        {
            Console.Title = "Welcome App";
            Console.ForegroundColor = ConsoleColor.Cyan;
            Console.WriteLine("╔══════════════════════════════╗");
            Console.WriteLine("║       WELCOME PROGRAM        ║");
            Console.WriteLine("╚══════════════════════════════╝");
            Console.ResetColor();

            // Get Name
            Console.Write("\n👤 What is your name? ");
            string name = Console.ReadLine()?.Trim();

            while (string.IsNullOrEmpty(name))
            {
                Console.ForegroundColor = ConsoleColor.Red;
                Console.Write("⚠  Name cannot be empty. Try again: ");
                Console.ResetColor();
                name = Console.ReadLine()?.Trim();
            }

            // Get Age
            Console.Write("🎂 How old are you? ");
            int age;
            while (!int.TryParse(Console.ReadLine(), out age) || age <= 0 || age > 150)
            {
                Console.ForegroundColor = ConsoleColor.Red;
                Console.Write("⚠  Please enter a valid age: ");
                Console.ResetColor();
            }

            // Display Info
            Console.ForegroundColor = ConsoleColor.Green;
            Console.WriteLine("\n══════════════════════════════");
            Console.WriteLine($"  👋 Nice to meet you, {name}!");
            Console.WriteLine($"  🎉 You are {age} years old.");
            Console.WriteLine($"  📅 Date : {DateTime.Now.ToLongDateString()}");
            Console.WriteLine($"  🕒 Time : {DateTime.Now.ToShortTimeString()}");
            Console.WriteLine($"  🌞 {GetGreeting()}, have a great day!");
            Console.WriteLine("══════════════════════════════");
            Console.ResetColor();

            Console.WriteLine("\nPress any key to exit...");
            Console.ReadKey();
        }

        static string GetGreeting()
        {
            int hour = DateTime.Now.Hour;
            if (hour < 12) return "Good Morning";
            if (hour < 17) return "Good Afternoon";
            return "Good Evening";
        }
    }
}
