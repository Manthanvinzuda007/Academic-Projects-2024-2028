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
}
