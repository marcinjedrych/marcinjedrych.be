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

const startX = render.options.width / 2; // Starting point for the first peg in the row
const startY = 0; // Vertical starting point for the pegs

// Calculate peg spacing based on the canvas width
const canvasWidth = render.options.width;
const pegSize = 2.5; // Size of the pegs
let pegSpacingX = canvasWidth / (rows * 1.3); // Dynamic horizontal spacing
let pegSpacingY = 40; // You can also make this dynamic if needed

// Base width (your current optimized canvas width)
const baseWidth = 800; // Adjust this to your current setup

// Function to calculate and update pegs based on screen size
function updatePegsForScreenSize() {
    const screenWidth = window.innerWidth;
    const scaleFactor = screenWidth / baseWidth;

    // Clear existing pegs
    pegs.forEach(peg => World.remove(world, peg));
    pegs.length = 0;

    // Calculate new positions and sizes of pegs
    for (let row = 2; row < rows; row++) {
        for (let col = 0; col <= row; col++) {
            const x = (startX - row * pegSpacingX / 2 + col * pegSpacingX) * scaleFactor;
            const y = (startY + row * pegSpacingY) * scaleFactor;
            const pegSize = 2.5 * scaleFactor; // Scaling the peg size
            const peg = Bodies.circle(x, y, pegSize, { isStatic: true, render: { fillStyle: '#ffffff' } });
            pegs.push(peg);
        }
    }

    World.add(world, pegs);

    currentScaleFactor = scaleFactor;
}

let currentScaleFactor = 1;

// Function to resize the canvas and update the game view
function resizeCanvas() {
    // Set canvas dimensions to match the window
    render.canvas.width = window.innerWidth;
    render.canvas.height = window.innerHeight;
    
    // Update render bounds
    render.bounds.max.x = window.innerWidth;
    render.bounds.max.y = window.innerHeight;
    
    // Recalculate peg positions and sizes
    updatePegsForScreenSize(); // Make sure to implement this function based on the previous example

    // You may also need to reposition other game elements relative to the new canvas size
}

// Initial canvas resize
resizeCanvas();

// Resize the canvas every time the window is resized
window.addEventListener('resize', resizeCanvas);


// Adjust the base position if necessary
const baseHeight = 20; // Height of the base
const base = Bodies.rectangle(render.options.width / 2, render.options.height - baseHeight / 3, render.options.width, baseHeight, { isStatic: false, render: { fillStyle: '#ffffff' } });
World.add(world, base);

// Function to drop a ball from the top center with slight randomness and scaled size
function dropBall() {
    const canvasWidth = render.canvas.width;
    const ballSize = 12 * currentScaleFactor; // Scale the ball size
    const randomOffset = (Math.random() * 10 - 5) * currentScaleFactor; // Adjust the range for more or less randomness
    let ball = Bodies.circle(canvasWidth / 2 + randomOffset, 30, ballSize, {
        restitution: 0.6, // This will give the ball a bit of bounce,
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
