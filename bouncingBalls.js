const ballState = {
	x: -1,
	y: -1,
	speed: 0,	// pixels per second
	direction: 0	// radians
}

const MAX_SPEED = 100;	// max speed in pixels per second
const FRAME_RATE = 25;	// render executions per second
const BALL_RADIUS = 5; 	// ball radius in pixels

function throwBall(x, y) {
	ballState.x = x;
	ballState.y = y;
	ballState.speed = Math.random() * MAX_SPEED;	
	ballState.direction = Math.random() * Math.PI;
}

function render() {
	if(ballState.x >= 0 && ballState.y >= 0) {
		var canvas = document.getElementById("playground");
		var context = canvas.getContext("2d");

		context.clearRect(0, 0, canvas.width, canvas.height);	// clear canvas from previous state

		drawBall(context, ballState.x, ballState.y, BALL_RADIUS);
	}
}

function drawBall(context, x, y, r) {
	context.beginPath();
	context.arc(x, y, r, 0, 2 * Math.PI);
	context.fill();
}

window.addEventListener('load', function(oEvent) {
	var canvas = document.getElementById("playground");

	// resize the canvas to fill browser window dynamically
	window.addEventListener('resize', resizeCanvas, false);

	function resizeCanvas() {
		canvas.width = window.innerWidth;
		canvas.height = window.innerHeight;
	}
	resizeCanvas();

	setInterval(render, 1000 / FRAME_RATE);
});

window.addEventListener('click', function(oEvent) {
	throwBall(oEvent.x, oEvent.y);
});