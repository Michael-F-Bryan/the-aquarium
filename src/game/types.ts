export type State = {
  currentDay: number
  liveFish: Fish[]
  deadFish: DeadFish[]
  food: Food[]
}

export type Food = {
  id: string
  physics: Physics
  createdOnDay: number
}

export type Species = 'normal' | 'carnivore'

export type Fish = {
  id: string
  name: string
  species: Species
  ageDays: number
  weightG: number
  health: 0 | 1 | 2 | 3
  physics: Physics
}

export type DeadFish = Fish & {
  diedOnDay: number
}

export type Physics = {
  position: {
    x: number
    y: number
  }
  velocity: {
    x: number
    y: number
  }
}

export function newGameState(): State {
  return {
    currentDay: 9,
    liveFish: stubLiveFish,
    deadFish: stubDeadFish,
    food: stubFood,
  }
}

const stubFood: Food[] = [
  {
    id: 'food-1',
    physics: phys(100, 100),
    createdOnDay: 0,
  },
  {
    id: 'food-2',
    physics: phys(360, 200),
    createdOnDay: 0,
  },
  {
    id: 'food-3',
    physics: phys(220, 320),
    createdOnDay: 0,
  },
]

function phys(x: number, y: number, vx = 0, vy = 0): Physics {
  return {
    position: { x, y },
    velocity: { x: vx, y: vy },
  }
}

const stubLiveFish: Fish[] = [
  {
    id: 'f-kelp',
    name: 'Kelp',
    species: 'normal',
    ageDays: 6,
    weightG: 340,
    health: 3,
    physics: phys(120, 160, 0.4, -0.2),
  },
  {
    id: 'f-ripple',
    name: 'Ripple',
    species: 'normal',
    ageDays: 4,
    weightG: 260,
    health: 3,
    physics: phys(280, 220, -0.35, 0.15),
  },
  {
    id: 'f-brine',
    name: 'Brine',
    species: 'normal',
    ageDays: 2,
    weightG: 190,
    health: 2,
    physics: phys(200, 280, 0.2, 0.45),
  },
  {
    id: 'f-mako',
    name: 'Mako',
    species: 'carnivore',
    ageDays: 8,
    weightG: 510,
    health: 3,
    physics: phys(340, 140, -0.55, 0.3),
  },
  {
    id: 'f-sprat',
    name: 'Sprat',
    species: 'normal',
    ageDays: 1,
    weightG: 120,
    health: 1,
    physics: phys(90, 240, 0.5, -0.1),
  },
  {
    id: 'f-cove',
    name: 'Cove',
    species: 'normal',
    ageDays: 3,
    weightG: 210,
    health: 2,
    physics: phys(420, 260, -0.15, -0.35),
  },
]

const stubDeadFish: DeadFish[] = [
  {
    id: 'f-ghost',
    name: 'Ghost',
    species: 'normal',
    ageDays: 5,
    weightG: 300,
    health: 0,
    diedOnDay: 6,
    physics: phys(260, 320, 0, 0),
  },
  {
    id: 'f-ember',
    name: 'Ember',
    species: 'carnivore',
    ageDays: 4,
    weightG: 380,
    health: 0,
    diedOnDay: 8,
    physics: phys(180, 340, 0, 0),
  },
]
