                                                                                                                                                     # Created By Manthan Vinzuda....
import turtle
import random

# Setup the screen
screen = turtle.Screen()
screen.bgcolor("black")
screen.title("Python Jutsu: Rasenshuriken")
screen.tracer(0) # Makes drawing instant

rasen = turtle.Turtle()
rasen.speed(0)
rasen.hideturtle()

def draw_rasenshuriken():
    rasen.clear()
    
    # 1. Draw the Wind Blades (Shuriken part)
    rasen.penup()
    rasen.goto(0, 0)
    rasen.setheading(0)
    rasen.pensize(2)
    
    # Generate a slight "flicker" effect for the wind
    offset = random.randint(0, 360)
    
    for i in range(4): # 4 main blades
        rasen.color("#E0FFFF") # Light cyan/white for wind
        rasen.begin_fill()
        rasen.forward(150)
        rasen.left(150)
        rasen.forward(180)
        rasen.end_fill()
        rasen.goto(0,0)
        rasen.left(120)

    # 2. Draw the Core (Rasengan part)
    for i in range(100):
        # Using shades of blue for the chakra
        colors = ["#00BFFF", "#1E90FF", "#ADD8E6", "#FFFFFF"]
        rasen.color(random.choice(colors))
        
        rasen.penup()
        rasen.goto(0, 0)
        rasen.setheading(i * 15 + offset) # Rotating effect
        rasen.forward(i * 0.8)
        rasen.pendown()
        rasen.circle(i * 0.1) # Small chakra swirls

    screen.update()
    # Call the function again to create animation
    screen.ontimer(draw_rasenshuriken, 50)

draw_rasenshuriken()
screen.mainloop()
