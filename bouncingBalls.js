var ballsState = [{
	x: -1,
	y: -1,
	speed: 0,	// pixels per second
	direction: 0	// radians
}]

const CANVAS_ID = "playground";

const MAX_SPEED = 50;	// max speed in pixels per second
const FRAME_RATE = 25;	// render executions per second
const BALL_RADIUS = 5; 	// ball radius in pixels
const GRAVITY = 9.8;	// pixels per second^2
const BALL_MASS = 0.5; 	// kg
const DRAG_COEF = 0.01;
const ELASTIC_COEF = 0.9;

const BALL_AREA = Math.sqrt(BALL_RADIUS) * Math.PI;
const FRAME_DURATION = 1000 / FRAME_RATE / 1000;

function throwBall(x, y) {
	const k = ballsState.length - 1;

	ballsState[k].x = x;
	ballsState[k].y = y;
	// ballsState[k].x = 100;
	// ballsState[k].y = 100;
	ballsState[k].speed = Math.random() * MAX_SPEED;
	ballsState[k].direction = Math.random() * Math.PI * 2;
	// ballsState[k].speed = 1 * MAX_SPEED;
	// ballsState[k].direction = 0.75 * Math.PI;
}

function render() {
	var canvas = document.getElementById(CANVAS_ID);
	var context = canvas.getContext("2d");

	ballsState = ballsState.map(function(ball) {
		if(ball.x >= 0 && ball.y >= 0) {
			context.clearRect(0, 0, canvas.width, canvas.height);	// clear canvas from previous state

			drawBall(context, ball.x, ball.y, BALL_RADIUS);

			// moveBall(ball);
		}

		// return ball;
		return nextState(ball);
	});
}

function drawBall(context, x, y, r) {
	context.beginPath();
	context.arc(x, y, r, 0, 2 * Math.PI);
	context.fill();
}

function ballNextX(ball) {
	// deltaS = V * deltaT;
	var nextX = ball.x + (getSpeedX(ball) * FRAME_DURATION);
	return nextX;
}

function ballNextY(ball) {
	// deltaS = V * deltaT;
	var nextY = ball.y + (getSpeedY(ball) * FRAME_DURATION);
	return nextY;
}

function moveBall(ball) {
	var nextX = ballNextX(ball);
	var nextY = ballNextY(ball);

	var newDirection = Math.atan2(
		ball.y - nextY,
		ball.x - nextX
	) + Math.PI;

	var newSpeed = Math.round(
		Math.sqrt(
			Math.pow(Math.abs(ball.x - nextX), 2) +
			Math.pow(Math.abs(ball.y - nextY), 2)
		) / FRAME_DURATION
	, 3);

	ball.x = nextX;
	ball.y = nextY;
	ball.direction = newDirection;
	ball.speed = newSpeed;
}

window.addEventListener('load', function(oEvent) {
	var canvas = document.getElementById(CANVAS_ID);

	// resize the canvas to fill browser window dynamically
	window.addEventListener('resize', resizeCanvas, false);

	function resizeCanvas() {
		canvas.width = window.innerWidth;
		canvas.height = window.innerHeight;
	}
	resizeCanvas();

	setInterval(render, FRAME_DURATION);
});

window.addEventListener('click', function(oEvent) {
	throwBall(oEvent.x, oEvent.y);
});

function getSpeedX(ball) {
	// Vx = V * Math.cos(angle)
	return Math.abs(ball.speed * parseFloat(Math.cos(ball.direction).toFixed(2)));
}

function getSpeedY(ball) {
	// Vy = V * Math.sin(angle)
	return Math.abs(ball.speed * parseFloat(Math.sin(ball.direction).toFixed(2)));
}

function nextState(ball) {
	if (ball.x < 0 || ball.y < 0) {
		return ball;
	}
	// aY = F / m
	// F = m * g - dragCoef * 0.5 * r * speedY^2 * A
	var speedX = getSpeedX(ball);
	var speedY = getSpeedY(ball);
	var forceGrav = BALL_MASS * GRAVITY;
	var forceDragX = DRAG_COEF * BALL_AREA * speedX;
	var forceDragY = DRAG_COEF * BALL_AREA * speedY;
	var falling = ball.direction < Math.PI;
	var fallSign = (falling ? 1 : -1);
	var right = ball.direction < Math.PI / 2 || ball.direction > Math.PI * 1.5;
	var rightSign = (right ? 1 : -1);

	aX = - forceDragX / BALL_MASS;
	aY = (fallSign * forceGrav - forceDragY) / BALL_MASS;

	// var deltaV = a * deltaT;
	var nextSpeedX = speedX + aX * FRAME_DURATION;
	var nextSpeedY = speedY + aY * FRAME_DURATION;

	var nextX = ball.x + (rightSign * nextSpeedX * FRAME_DURATION);
	var nextY = ball.y + (fallSign * nextSpeedY * FRAME_DURATION);

	const canvas = document.getElementById(CANVAS_ID);

	var nextDirection, nextSpeed;

	if (nextY >= canvas.height) {
		nextDirection = Math.PI - Math.atan2(
			ball.y - nextY,
			ball.x - nextX
		);

		nextY = 2 * canvas.height - nextY;

		nextSpeed = Math.sqrt(Math.pow(nextSpeedX, 2) + Math.pow(nextSpeedY, 2)) * ELASTIC_COEF;
	} else {
		nextDirection = Math.PI + Math.atan2(
			ball.y - nextY,
			ball.x - nextX
		);

		nextSpeed = Math.sqrt(Math.pow(nextSpeedX, 2) + Math.pow(nextSpeedY, 2));
	}

	return {
		x: nextX,
		y: nextY,
		speed: nextSpeed,
		direction: nextDirection
	}
}
