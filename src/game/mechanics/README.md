# Legacy Mechanics

Most modules in this directory are pre-ECS reference mechanics. They are kept so
parity tests can compare the current ECS schedule against the previous gameplay
rules during the migration cleanup.

Production simulation should enter through `src/game/appRuntime.ts` or
`src/game/ecs/schedule.ts`, not by importing these modules directly. ESLint
blocks production imports from the parity-only modules.

`foodDrop.ts` is the exception: it remains the small command boundary for
placing flakes because both player clicks and autoplay commands need the same
anti-spam and coordinate-clamping rules before the ECS step runs.
