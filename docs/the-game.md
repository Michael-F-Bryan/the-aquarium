# The Aquarium - how to play

So you want to know what this game is. Pull up a chair. The Aquarium is a chill little fish-tank sim that runs in your browser. You don't direct the fish - they swim around on their own, school up, eat each other sometimes, make babies when they're old enough, and occasionally get murdered by something with bigger teeth. Your job is to drop food in and try not to let everything die.

This is a peek-at-it-during-meetings kind of game. You feed fish, watch them grow, and over time you spend their biomass on upgrades that reshape what the tank can do. The simulation runs itself - your job is to check in when you can, intervene when something looks rough, and decide which fish to sacrifice for the next upgrade.

## What you're looking at

A rectangular tank, viewed from the side. On a fresh game there's one fish in the middle - already named, already with a face. Each fish has a randomly rolled appearance: gender, fin shape, tail shape, eye color, and sometimes eyelashes. They're cute. You'll get attached.

Time runs in "days." One day takes about six and a half seconds of real time at the default speed, so a lot happens fast. Nothing special happens at the day rollover in terms of gameplay - the day counter is just a clock. Hit pause and the whole tank freezes.

## Day and night

There's a sky above the tank, and the day cycle plays out across it.

A sun rises at the start of each day, slowly arcs across the top of the screen, and sets when the day is half done. Then a moon picks up the same arc, climbs through the night, and sets just as the next sun rises behind it. The whole cycle takes one game day - about six and a half seconds at the default speed.

The sky shifts color as the cycle plays out. Dawn pulls in pinks and oranges behind the rising sun. Midday is a bright, washed-out blue. Sunset bleeds back through deeper oranges and reds into the purples of dusk. Night is a deep navy scattered with stars, with the moon as the brightest thing up there. The tank water below picks up some of the light through the surface, so a sunset warms the top of the water and a clear midday tints everything cooler.

The cycle is purely cosmetic. Fish don't sleep, hunger doesn't pause, carnivores don't get hunting bonuses in the dark. Think of it as a visual clock - one glance at the sky tells you where you are in the day. Sun overhead means you're roughly midway through daytime. Moon dipping back to the horizon means the next save is moments away.

## Feeding

Click anywhere in the tank and a flake of food drops in. That's the whole control scheme.

Two rules of thumb:

- You can't drop two flakes right on top of each other. The game refuses the second one. Spread them out.
- Flakes don't sit there forever. If nobody eats a flake within half a day, it disappears.

A hungry fish will notice the closest flake and swim toward it. Once they're close enough, they snap it up.

Here's the bit that takes a minute to get used to. A fish has a health meter from 0 to 3. Eating works two ways depending on health:

- Below max: they gain a health point.
- Already at max: they gain 100 grams of weight instead.

Weight matters later for breeding and for whether a carnivore can eat them. So overfeeding a healthy fish isn't a waste - it's how you build up biomass.

## Hunger and dying

Every fish has its own private hunger clock. It starts ticking the moment they're born and resets every time they eat. As the clock climbs, they lose health at fixed milestones:

- 1.5 days since their last meal: 3 down to 2. They go "hungry."
- 3 days since their last meal: 2 down to 1. They're "starving."
- 4.5 days since their last meal: 1 down to 0. They're "famished," and then they die.

Each fish runs on their own clock, so a fish that ate a few seconds ago is fine while one across the tank is on the brink. Feed at any point and the clock snaps back to zero.

You'll see toast messages every time a fish drops a level. The toast log on the side is your early warning - if you see the same name appearing over and over, that fish is about to die.

Dead fish become corpses. They drift to the bottom of the tank, hang around for about ten days, then disappear.

A note on the very first fish: she's brand new and has never eaten anything, so her clock starts ticking from second one. You've got about ten seconds of real time before she goes hungry. Don't walk away.

## Babies

Adults breed on their own. The rules:

- A fish has to weigh at least 300g to count as an adult and become eligible to reproduce. Anything under that is a baby.
- Babies are easy to spot in the toast log because their name is prefixed with "Baby." Charles weighing 200g shows up as "Baby Charles." Once Charles crosses 300g, the prefix drops and he's just Charles.
- Eligible adults have an ongoing chance to produce a baby over time. Older adults are more likely than younger ones, with the odds climbing as they age and capping at the high end. There's no fixed schedule - you'll just see "Baby Pebble was born" pop up in the log when it happens.
- A new baby pops in right next to the parent.

Babies start at 100g, full health, with a brand new name and a brand new face. Their hunger clock starts ticking the moment they exist, so the first day and a half of a baby's life is critical. Drop them a flake or they'll be on the path to "hungry" before they've grown at all.

Yes, even your starter fish counts as a baby. She spawns at 100g, so she'll be "Baby [her name]" until you fatten her past 300g.

There's also a roughly 1-in-100 chance any baby is born a carnivore, even if the parent isn't. Your peaceful school can spontaneously produce a monster. Watch for it.

## Carnivores

These are the spicy ones. A carnivore looks for any fish lighter than itself within sight, picks the closest one, and dashes at it. If it gets close enough, it kills and eats.

When that happens:

- The prey is gone. They don't leave a normal corpse - they leave a skeleton, which sinks and disappears after a couple of days.
- The carnivore gains 10% of the prey's weight.
- You see a "Whiskers ate Bubbles" message.

Worth knowing: there's no separate "died" toast for predation, only the eating one. If a fish vanishes from your tank and you didn't see a death message, that means a carnivore got them.

Carnivores swim a little faster than normals. When they don't see prey nearby, they wander around aimlessly.

## What the normal fish do

Normal fish school together. They try to stay near each other, line up their swimming direction, and stick together as a group, while keeping a comfortable distance so they're not piled up. The result looks pretty good in motion.

If a heavier carnivore comes within sight, they panic and flee. A smaller carnivore won't scare them, though, which is why a freshly mutated baby carnivore can swim right up to its siblings - the school doesn't see it as a threat until it's already grown and started killing.

## Score

There's a score in the UI that reflects the live state of the tank. It rewards two things:

- Each normal fish adds its weight (in 100g units).
- Each carnivore adds weight times age. A heavy old carnivore is worth a fortune.

The number ticks up and down in real time. Feed a fish, watch the number climb. A carnivore makes a kill, the prey vanishes from the tally and the carnivore's contribution jumps. A fish dies of hunger, the number drops the same instant.

This is the engine that drives the game. Big stable schools score steadily. A massive ancient carnivore that's been farming your school for weeks scores absurdly. There's a tradeoff baked in: feed the school and grow biomass slowly, or let a predator eat the weaker fish and bank on age.

## Biomass

Biomass is the game's spending currency. You earn it by sacrificing fish back into the tank. You spend it on upgrades.

Each fish has a biomass value tied to their weight, age, and condition. Older heavier fish are worth more. Conversion has diminishing returns above a certain weight, so fattening one mega-fish to fund an infinite upgrade run doesn't work - you'd get a chunky boost on the first sacrifice and meaningfully less from the next equivalent fish.

Sacrificed fish vanish cleanly. No corpse, no skeleton, no death toast. Just a quiet conversion to a number on your upgrade screen. The tank moves on without them.

Two safety rules to keep the game from breaking itself:

- You can't sacrifice your last breeding adult. The game won't let you go extinct by accident.
- Babies don't convert well. Their conversion rate is low enough that culling them for biomass is rarely worth losing the future adult.

## Upgrades

Upgrades are how you grow the aquarium long-term. Each one tweaks a single dial in the simulation - bigger tank, slower hunger, richer food - and they stack to reshape what your tank can support.

To buy an upgrade you need biomass. To get biomass you sacrifice fish. That's the loop.

Picking which fish to sacrifice is the central decision in the game. A 2000g carnivore is worth a fortune in both score and biomass, and you can't have both. Babies are nearly worthless to convert. The interesting choices live in the middle, with the medium adults you've grown attached to.

Early upgrades available out of the gate:

- Bigger tank, one step at a time. More room to swim, more space for the school.
- Slower hunger. Push the 1.5 / 3 / 4.5 day milestones out to 2 / 4 / 6, then further.
- Richer food. Each flake heals more health, or adds more grams when eaten at full health.
- Cheaper food. Two flakes per click instead of one.
- Higher max health. The cap rises from 3 to 4 to 5, giving more buffer before starvation kicks in.
- Faster baby growth. Babies reach adult weight in fewer days.
- Quicker corpse cleanup. Corpses despawn in a couple of days instead of ten.
- Carnivore mutation control. Slide the 1-in-100 mutation chance lower for a safer tank or higher for chaos.
- Auto-feeder. Unlock the auto-feeder feature, then improve its rate and targeting in tiers.

Some upgrades overlap. "Slower hunger" and "richer food" both reduce starvation pressure, and you generally pick one of those paths rather than stack both. The early game forces a build choice, which is the point - two players with the same biomass spend won't end up with the same tank.

## Saving

Dawn is the auto-save tick. Every time a new day begins - the moon sets, the sun rises behind it - the game writes a snapshot to your browser, complete with a little thumbnail of the tank. Close the tab, come back tomorrow, your aquarium picks up exactly where it left off.

That's the only thing the day boundary does in the new model. No fish gain or lose anything at the rollover, no events fire. It's purely a save tick. Watch the sun come up and that's your save.

## Pause

Hit pause and the whole tank freezes. No day advances, no eating, no dying. Clicks don't even drop food while you're paused. Unpause and time picks up where it stopped, not at wall-clock time, so you don't get a sudden burst of action.

## Auto-feeder

Buy the auto-feeder upgrade and the game starts dropping flakes for you on a timer. It picks the hungriest, sickest fish in the tank and drops a flake near them. The base tier feeds slowly and only targets the fish closest to dying. Higher tiers drop faster, target smarter, and eventually keep your whole school topped up without you doing anything.

This is the upgrade that flips the game from "actively play" to "actively idle." Once it's on, you can leave the tab in another window and come back to a tank that's been ticking along on its own. The simulation keeps running while you're elsewhere - the auto-feeder just makes sure nobody starves while you're not watching.

## Tips after you've played a few hours

- A single carnivore in a school of normals is a slow apocalypse. Each kill makes them heavier, which means they can take down bigger prey next time. Decide early whether you want to protect the school or let it run its course.
- Babies need food fast. They show up at full health but with no meals on record. They'll go "hungry" 1.5 game days after they appear if nothing eats first.
- The score moves in real time, so feeding has an immediate visible payoff. Watch the number while you click and you'll feel it.
- If you want a giant fish, pick one and overfeed it. They grow indefinitely - but biomass conversion has diminishing returns past a certain weight, so giant fish are great for score and not great for upgrade farming.
- Sacrifice older, heavier mid-tier fish for the best biomass payout. Babies are barely worth converting and your top breeders are probably more valuable alive.
- Don't sacrifice your last carnivore unless you're committing to a vegetarian tank. Carnivores are your top scorers in the long run because of the age multiplier. Losing one you've grown for weeks stings.
- Slower hunger is the quiet game-changer. It buys time, which every other decision in the game runs on.
- The school drifts toward wherever you're feeding. If you always click on the left side of the tank, that's where the fish will live.
- Watch the toast messages on the side. They're the only way to spot a quiet predator picking off your fish one by one.

That's the whole game. Click food, watch fish, sacrifice one when you need to grow, try not to weep when your favorite gets eaten - or when you're the one doing the eating.
