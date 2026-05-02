# The Aquarium

A browser game where you need to keep your fish alive.

## Game Rules

- You start the game with one baby fish
- The player needs to feed the fish once per day or else it will lose a health point
- Each fish start with 3 health points. When the fish has 0 health points, it will die.
- Feeding is done by clicking in the aquarium.
- Fish that haven't eaten that day will move towards the nearest piece of food
- An uneaten piece of food will disappear after half a day
- Every time a fish is fed, it will replenish a health point. If it is already at full health, its weight will increase by 100g.
- Once a fish weighs at least 300g, every day it will have a random chance of reproducing (its age in days, to a max of 25%)
- When a fish reproduces, it will create a new baby fish. The baby fish will start with 3 health points and weigh 100g
- Once there are at least 5 fish in the aquarium, each fish will have a 1% chance of mutating into a carnivore fish.
- Carnivore fish must eat at least 1 fish per day or else it will lose a health point.
- Carnivore fish can only eat fish that are smaller than itself and must catch it
- Carnivore fish move 20% faster than normal fish
- Dead fish fall to the bottom of the aquarium and stay there for 10 days
- Normal fish tend to gather in schools and move according to boid behavior
- Carnivore fish tend to be loners and move randomly, apart from when they are hunting, in which case they will move towards the nearest fish and attack it
- If a fish is being hunted, it will try to escape by moving away from the hunter
- At the end of each day, the player's score will be updated based on the fish in the aquarium
  - Each normal fish is worth 1 point per 100g of weight
  - Each carnivore fish is worth 1 points per 100g of weight multiplied by its age in days

## User Interface

The UI is broken into four panels.

Top pane:
- The top panel contains the game title

Left pane:
- The left panel contains general game information
- At the top is the current day and score (cummulative weight of all fish in grams)
- Below that is the debug controls with sliders and inputs for controlling various game parameters

Right pane:
- On the right is the fish pane
- At the top is a list of all the fish in the aquarium
- At the very bottom is a list of all the fish that have died
- In between is a panel that shows information about the selected fish
  - Name
  - Species
  - Age
  - Weight
  - Health

Middle pane:
- The aquarium is a HTML canvas that fills the entire pane
- The fish sprites are coloured based on their species (normal: blue, carnivore: red)
- Each fish's name is displayed above the sprite
- The fish's health is represented using its facial expression (3 health: smiling, 2 health: neutral, 1 health: frowning, 0 health: dead)
