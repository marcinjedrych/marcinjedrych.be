
// Import Matter.js modules
const { Engine, Render, Runner, World, Bodies, MouseConstraint, Mouse } = Matter;

// Create an engine
const engine = Engine.create();
const { world } = engine;

// Create a renderer
const render = Render.create({
    element: document.body,
    engine: engine,
    canvas: document.getElementById('plinkoCanvas'),
    options: {
        wireframes: false
    }
});

Render.run(render);

// Create a runner
const runner = Runner.create();
Runner.run(runner, engine);

// Add mouse control
const mouse = Mouse.create(render.canvas);
const mouseConstraint = MouseConstraint.create(engine, {
    mouse: mouse,
    constraint: {
        stiffness: 0.2,
        render: {
            visible: false
        }
    }
});
World.add(world, mouseConstraint);

// Keep the mouse in sync with rendering
render.mouse = mouse;

// Create Plinko pegs in a pyramid shape
const pegs = [];
const rows = 15; // Adjust the number of rows for the pyramid shape
const pegSpacingX = 50; // Horizontal spacing between pegs
const pegSpacingY = 40; // Vertical spacing between pegs
const startX = render.options.width / 2; // Starting point for the first peg in the row
const startY = 0; // Vertical starting point for the pegs

for (let row = 2; row < rows; row++) {
    for (let col = 0; col <= row; col++) {
        const x = startX - row * pegSpacingX / 2 + col * pegSpacingX;
        const y = startY + row * pegSpacingY;
        const peg = Bodies.circle(x, y, 2.5, { isStatic: true, render: { fillStyle: '#ffffff' } });
        pegs.push(peg);
    }
}

World.add(world, pegs);

// Adjust the base position if necessary
const baseHeight = 20; // Height of the base
const base = Bodies.rectangle(render.options.width / 2, render.options.height - baseHeight / 3, render.options.width, baseHeight, { isStatic: false, render: { fillStyle: '#ffffff' } });
World.add(world, base);

// Function to drop a ball from the top center with slight randomness
function dropBall() {
    // Random offset for the x-coordinate
    const randomOffset = Math.random() * 10 - 5; // Adjust the range for more or less randomness
    let ball = Bodies.circle(render.options.width / 2 + randomOffset, 30, 12, {
        restitution: 0.6, // This will give the ball a bit of a bounce
        render: {
            fillStyle: 'red' // Color the ball red (or any color you prefer)
        }
    });
    World.add(world, ball);
}

// Add event listener to the drop button
document.getElementById('drop-button').addEventListener('click', dropBall);

// Start the Matter.js engine
Engine.run(engine);
Render.run(render);
