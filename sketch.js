// Module aliases
var Engine = Matter.Engine,
    World = Matter.World,
    Bodies = Matter.Bodies;

var engine;
var world;
var particles = [];
var plinkos = [];
var boundaries = [];
var cols = 9;
var rows = 9;

function setup() {
    var canvas = createCanvas(600,700);
    colorMode(HSB);

    // Create an engine
    engine = Engine.create();
    world = engine.world;
    world.gravity.y = 1.1;

    var spacing = width / cols;

    // Creating a pyramid shape for Plinko discs
    for (var j = 2; j < rows; j++) {
        for (var i = 0; i <= j; i++) {
            var x = width / 2 + (i - j / 2) * spacing;
            var y = spacing + j * spacing;
            var p = new Plinko(x, y, 10);
            plinkos.push(p);
        }
    }

    // Bottom boundary
    var b = new Boundary(width / 2, height + 50, width, 100);
    boundaries.push(b);

    // Side boundaries
    for (var i = 1; i < cols + 2; i++) {
        var x = i * spacing;
        var h = 60;
        var w = 10;
        var y = height - h / 2;
        var b = new Boundary(x, y, w, h);
        boundaries.push(b);
    }

    // Attach event listener to the drop button
    select('#dropButton').mousePressed(newParticle);
}

function newParticle() {
    var p = new Particle(300, 50, 15); // Adjust the position and size as needed
    particles.push(p);
}

function draw() {
    background(20, 10, 10);
    Engine.update(engine);

    // Render particles
    for (var i = 0; i < particles.length; i++) {
        particles[i].show();
        if (particles[i].offScreen()) {
            World.remove(world, particles[i].body);
            particles.splice(i, 1);
            i--;
        }
    }

    // Render plinkos and boundaries
    for (var i = 0; i < plinkos.length; i++) {
        plinkos[i].show();
    }
    for (var i = 0; i < boundaries.length; i++) {
        boundaries[i].show();
    }
}
