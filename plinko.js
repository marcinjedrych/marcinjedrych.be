// script.js
const canvas = document.getElementById('plinkoCanvas');
const ctx = canvas.getContext('2d');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// Game variables
let balls = [];
const ballCount = 10;
const ballRadius = 10;

// Initialize balls
function initBalls() {
    for (let i = 0; i < ballCount; i++) {
        balls.push({
            x: Math.random() * canvas.width,
            y: 0,
            dy: 2 + Math.random() * 3, // vertical speed
        });
    }
}

// Draw balls
function drawBalls() {
    balls.forEach(ball => {
        ctx.beginPath();
        ctx.arc(ball.x, ball.y, ballRadius, 0, Math.PI * 2);
        ctx.fillStyle = 'blue';
        ctx.fill();
        ctx.closePath();
    });
}

// Update game state
function update() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawBalls();

    // Update ball positions
    balls.forEach(ball => {
        ball.y += ball.dy;

        // Reset ball to the top once it falls out of the canvas
        if (ball.y > canvas.height) {
            ball.y = 0;
            ball.dy = 2 + Math.random() * 3;
        }
    });

    requestAnimationFrame(update);
}

// Start game
initBalls();
update();
