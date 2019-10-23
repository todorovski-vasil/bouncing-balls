(function(global) {

	var ballsState = [];

	var canvasId = null;
	var canvas = null;

	var env = initDefaultEnv();

	function initDefaultEnv() {
		const env = {
			max_speed: 100,	// max speed in pixels per second
			frame_rate: 25,	// render executions per second
			ball_radius: 10, // ball radius in pixels
			gravity: 9.8,	// pixels per second^2
			ball_mass: 5, 	// kg
			drag_coef: 0.01,
			elastic_coef: 0.9	// must be between 0 and 1
		};

		env.ball_area = Math.sqrt(env.ball_radius) * Math.PI;
		env.frame_duration =  1000 / env.frame_rate / 1000;

		return env;
	}

	function initCanvas(cId, width, height) {
		canvasId = cId
		canvas = document.getElementById(canvasId);

		canvas.width = width;
		canvas.height = height;

		canvas.addEventListener('click', function(oEvent) {
			throwBall(oEvent.layerX, oEvent.layerY);
		});

		setInterval(render, env.frame_duration);
	}

	function throwBall(x, y) {
		ballsState.push({
			x: x,
			y: y,
			speed: Math.random() * env.max_speed,
			direction: Math.random() * Math.PI * 2,
			color: "#" + Math.random().toString(16).slice(-6)
			// speed: 1 * env.max_speed,
			// direction: 1.75 * Math.PI
		});
	}

	function render() {
		var context = canvas.getContext("2d");

		context.clearRect(0, 0, canvas.width, canvas.height);	// clear canvas from previous state

		ballsState = ballsState.reduce(function(activeBalls, ball) {
			drawBall(context, ball.x, ball.y, env.ball_radius, ball.color);

			const nextBallState = nextState(ball);

			if (canvas.height - env.ball_radius - 1 > nextBallState.y || nextBallState.speed > 0.2) {
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
		var nextX = ball.x + (getSpeedX(ball) * env.frame_duration);
		return nextX;
	}

	function ballNextY(ball) {
		// deltaS = V * deltaT;
		var nextY = ball.y + (getSpeedY(ball) * env.frame_duration);
		return nextY;
	}

	function getSpeedX(ball) {
		// Vx = V * Math.cos(angle)
		return Math.abs(ball.speed * parseFloat(Math.cos(ball.direction).toFixed(7)));
	}

	function getSpeedY(ball) {
		// Vy = V * Math.sin(angle)
		return Math.abs(ball.speed * parseFloat(Math.sin(ball.direction).toFixed(7)));
	}

	function getVectorSpeed(speedX, speedY) {
		return Math.sqrt(Math.pow(speedX, 2) + Math.pow(speedY, 2));
	}

	function trimDirection(direction) {
		// set direction between 0 and 2PI
		if (direction < 0 || direction > 2 * Math.PI) {
			return direction - Math.floor(direction / (2 * Math.PI)) * 2 * Math.PI;
		} else {
			return direction;
		}
	}

	function isBallDirectionRight(direction) {
		direction = trimDirection(direction);
		return direction < Math.PI / 2 || direction > Math.PI * 1.5;
	}

	function isBallFalling(direction) {
		return direction < Math.PI && direction > 0;
	}

	function nextState(ball) {
		// aY = F / m
		// F = m * g - dragCoef * 0.5 * r * speedY^2 * A
		var speedX = getSpeedX(ball);
		var speedY = getSpeedY(ball);

		var forceGrav = env.ball_mass * env.gravity;
		var forceDragX = env.drag_coef * env.ball_area * speedX;
		var forceDragY = env.drag_coef * env.ball_area * speedY;
		
		var fallSign = (isBallFalling(ball.direction) ? 1 : -1);
		var rightSign = (isBallDirectionRight(ball.direction) ? 1 : -1);

		aX = - (forceDragX / env.ball_mass);	// always slowing down on the X axis
		aY = (fallSign * forceGrav - forceDragY) / env.ball_mass;

		// var deltaV = a * deltaT	,	V' = V + deltaV
		var nextSpeedX = speedX + aX * env.frame_duration;
		var nextSpeedY = speedY + aY * env.frame_duration;

		var nextSpeed = getVectorSpeed(nextSpeedX, nextSpeedY);

		// x' = x +- deltaS	,	deltaS = V * T 
		var nextX = ball.x + (rightSign * nextSpeedX * env.frame_duration);
		var nextY = ball.y + (fallSign * nextSpeedY * env.frame_duration);

		var nextDirection = Math.PI + Math.atan2(ball.y - nextY, ball.x - nextX);

		// adjust for bounce if crossing over an edge
		if (nextY >= canvas.height - env.ball_radius ||
			nextY <= 0 + env.ball_radius ||
			nextX <= 0 + env.ball_radius||
			nextX >= canvas.width - env.ball_radius) {
			// bounce

			if (nextX <= 0 + env.ball_radius || nextX >= canvas.width - env.ball_radius) {
				// bounce of the side

				nextDirection = Math.PI - nextDirection;

				if (nextX < 0 + env.ball_radius) {
					nextX = 2 * env.ball_radius - nextX;
				} else {
					nextX = 2 * (canvas.width - env.ball_radius) - nextX;
				}
			} else {
				// bounce of the top or bottom

				nextDirection = Math.PI * 2 - nextDirection;

				if (nextY < 0 + env.ball_radius) {
					nextY = 2 * env.ball_radius - nextY;
				} else {
					nextY = 2 * (canvas.height - env.ball_radius) - nextY;
				}
			}

			nextSpeed *= env.elastic_coef;	// make the ball lose some energy while bouncing
		}

		// set next direction between 0 and 2PI
		nextDirection = trimDirection(nextDirection);

		return {
			x: nextX,
			y: nextY,
			speed: nextSpeed,
			direction: nextDirection,
			color: ball.color
		}
	}

	function getGravity() { 
		return env.gravity; 
	}

	function setGravity(value) { 
		if(typeof value === "number" && value >= 0) {
			env.gravity = value; 
		} else {
			alert("The gravity has to be larger than 0");
		}
	}

	function getDragCoef() { 
		return env.drag_coef; 
	}

	function setDragCoef(value) { 
		if(typeof value === "number" && value >= 0) {
			env.drag_coef = value; 
		} else {
			alert("The drag coefficient has to be larger than 0");
		}
	}

	function getElasticityCoef() { 
		return env.elastic_coef; 
	}

	function setElasticityCoef(value) { 
		if(typeof value === "number" && value >= 0 && value <= 1) {
			env.elastic_coef = value; 
		} else {
			alert("The elastic coefficient has to be between 0 and 1");
		}
	}

	/**********/
	/* Export */
	/**********/
	global["bouncingBallsV"] = {
		initCanvas: initCanvas,
		getGravity: getGravity,
		setGravity: setGravity,
		getDragCoef: getDragCoef,
		setDragCoef: setDragCoef,
		getElasticityCoef: getElasticityCoef,
		setElasticityCoef: setElasticityCoef
	}

	/**********************************************************/
	/* Tests
	/**********************************************************/

	var oldEnv = env;

	var testBalls = [{
		x: Math.random() * 8098, y: Math.random() * 3098,
		speed: Math.random() * env.max_speed,
		direction: Math.random() * Math.PI * 2,
		color: "#ffffff"
	}, {
		x: 0, y: 1000,
		speed: 1e-15,
		direction: 1e-15,
		color: "#ffffff"
	}, {
		x: 1000, y: 0,
		speed: 1e-15,
		direction: 1e-15,
		color: "#ffffff"
	}, {
		x: 100, y: 100,
		speed: Math.random() * env.max_speed,
		direction: Math.random() * Math.PI * 2 + Math.PI * 2,
		color: "#ffffff"
	}, {
		x: 100, y: 100,
		speed: Math.random() * env.max_speed,
		direction: Math.random() * Math.PI * 2 - Math.PI * 2,
		color: "#ffffff"
	}];

	var testOffsets = [
		0,
		- 2 * Math.PI,
		2 * Math.PI,
		18 * Math.PI,
		- 18 * Math.PI,
		Math.floor(Math.random() * 10) * 2 * Math.PI,
		- Math.floor(Math.random() * 10) * 2 * Math.PI
	];

	try{
		testBalls.forEach(function(testBall){
			unitjs.number(testBall.speed)
				.isApprox(getVectorSpeed(getSpeedX(testBall), getSpeedY(testBall)), 1e-5);
		});
		
		testOffsets.forEach(function(testOffset) { // doesn't pass the test if the angle is > 2PI or < 0
			unitjs.bool(isBallDirectionRight(0 + testOffset)).isTrue();
			unitjs.bool(isBallDirectionRight(Math.PI * 0.25 + testOffset)).isTrue();
			unitjs.bool(isBallDirectionRight(Math.PI * (0.5 - 1e-15) + testOffset)).isTrue();	// Math.PI has 16 decimal places
			unitjs.bool(isBallDirectionRight(Math.PI * 0.5 + testOffset)).isNotTrue();
			unitjs.bool(isBallDirectionRight(Math.PI * 0.75 + testOffset)).isNotTrue();
			unitjs.bool(isBallDirectionRight(Math.PI + testOffset)).isNotTrue();
			unitjs.bool(isBallDirectionRight(Math.PI * 1.25 + testOffset)).isNotTrue();
			unitjs.bool(isBallDirectionRight(Math.PI * (1.5 + 1e-15) + testOffset)).isTrue();	// Math.PI has 16 decimal places
			unitjs.bool(isBallDirectionRight(Math.PI * 1.75 + testOffset)).isTrue();
			unitjs.bool(isBallDirectionRight(Math.PI * 2 + testOffset)).isTrue();	
		
			unitjs.bool(isBallFalling(0)).isNotTrue();
			unitjs.bool(isBallFalling(Math.PI * 1e-15)).isTrue();
			unitjs.bool(isBallFalling(Math.PI * 0.25)).isTrue();
			unitjs.bool(isBallFalling(Math.PI * 0.5)).isTrue();
			unitjs.bool(isBallFalling(Math.PI * 0.75)).isTrue();
			unitjs.bool(isBallFalling(Math.PI * (1 - 1e-15))).isTrue();
			unitjs.bool(isBallFalling(Math.PI)).isNotTrue();
			unitjs.bool(isBallFalling(Math.PI * 1.25)).isNotTrue();
			unitjs.bool(isBallFalling(Math.PI * 1.5)).isNotTrue();
			unitjs.bool(isBallFalling(Math.PI * 1.75)).isNotTrue();
			unitjs.bool(isBallFalling(Math.PI * 2)).isNotTrue();
		});

		console.log("Success: all assertions passed!")
	} catch(e){
		console.error(e);
		console.error(e.stack);
	} finally {
		env = oldEnv;
	}

})(window);