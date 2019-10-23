(function(global) {

	var ballsState = [];

	const CANVAS_ID = "playground";

	const MAX_SPEED = 100;	// max speed in pixels per second
	const FRAME_RATE = 25;	// render executions per second
	const BALL_RADIUS = 10; // ball radius in pixels
	const GRAVITY = 9.8;	// pixels per second^2
	const BALL_MASS = 5; 	// kg
	const DRAG_COEF = 0.01;
	const ELASTIC_COEF = 0.9;	// must be between 0 and 1

	const BALL_AREA = Math.sqrt(BALL_RADIUS) * Math.PI;
	const FRAME_DURATION = 1000 / FRAME_RATE / 1000;

	function throwBall(x, y) {
		ballsState.push({
			x: x,
			y: y,
			speed: Math.random() * MAX_SPEED,
			direction: Math.random() * Math.PI * 2,
			color: "#" + Math.random().toString(16).slice(-6)
			// speed: 1 * MAX_SPEED,
			// direction: 1.75 * Math.PI
		});
	}

	function render() {
		var canvas = document.getElementById(CANVAS_ID);
		var context = canvas.getContext("2d");

		context.clearRect(0, 0, canvas.width, canvas.height);	// clear canvas from previous state

		ballsState = ballsState.reduce(function(activeBalls, ball) {
			drawBall(context, ball.x, ball.y, BALL_RADIUS, ball.color);

			const nextBallState = nextState(ball);

			if (canvas.height - BALL_RADIUS - 1 > nextBallState.y || nextBallState.speed > 0.2) {
				activeBalls.push(nextBallState);
			}

			return activeBalls;
		}, []);
	}

	function drawBall(context, x, y, r, color) {
		context.fillStyle = color;
		context.beginPath();
		context.arc(x, y, r, 0, 2 * Math.PI);
		context.closePath();
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

	function initCanvas(canvasId, width, height) {
		var canvas = document.getElementById(canvasId);

		canvas.width = width - 2;
		canvas.height = height - 2;

		canvas.addEventListener('click', function(oEvent) {
			throwBall(oEvent.x, oEvent.y);
		});

		setInterval(render, FRAME_DURATION);
	}

	function getSpeedX(ball) {
		// Vx = V * Math.cos(angle)
		return Math.abs(ball.speed * parseFloat(Math.cos(ball.direction).toFixed(5)));
	}

	function getSpeedY(ball) {
		// Vy = V * Math.sin(angle)
		return Math.abs(ball.speed * parseFloat(Math.sin(ball.direction).toFixed(5)));
	}

	function nextState(ball) {
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

		var nextSpeed = Math.sqrt(Math.pow(nextSpeedX, 2) + Math.pow(nextSpeedY, 2));

		var nextX = ball.x + (rightSign * nextSpeedX * FRAME_DURATION);
		var nextY = ball.y + (fallSign * nextSpeedY * FRAME_DURATION);

		const canvas = document.getElementById(CANVAS_ID);

		var nextDirection;

		var alpha = Math.atan2(ball.y - nextY, ball.x - nextX);

		if (nextY >= canvas.height - BALL_RADIUS ||
			nextY <= 0 + BALL_RADIUS ||
			nextX <= 0 + BALL_RADIUS||
			nextX >= canvas.width - BALL_RADIUS) {
			// bounce

			if (nextX <= 0 + BALL_RADIUS || nextX >= canvas.width - BALL_RADIUS) {
				// bounce of the side

				nextDirection = - alpha;

				if (nextX < 0 + BALL_RADIUS) {
					nextX = 2 * BALL_RADIUS - nextX;
				} else {
					nextX = 2 * (canvas.width - BALL_RADIUS) - nextX;
				}
			} else {
				// bounce of the top or bottom

				nextDirection = Math.PI - alpha;

				if (nextY < 0 + BALL_RADIUS) {
					nextY = 2 * BALL_RADIUS - nextY;
				} else {
					nextY = 2 * (canvas.height - BALL_RADIUS) - nextY;
				}
			}

			nextSpeed *= ELASTIC_COEF;	// make the ball lose some energy while bouncing
		} else {
			// movement in empty space

			nextDirection = Math.PI + alpha;
		}

		// set next direction between 0 and 2PI
		if (nextDirection < 0) {
			nextDirection += 2 * Math.PI;
		} else if (nextDirection > 2 * Math.PI) {
			nextDirection -= 2 * Math.PI;
		}

		return {
			x: nextX,
			y: nextY,
			speed: nextSpeed,
			direction: nextDirection,
			color: ball.color
		}
	}

	global["bouncingBallsV"] = {
		initCanvas: initCanvas
	}

})(window);