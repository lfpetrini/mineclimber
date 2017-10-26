// Particle

function Particle(gameTime, color, x, y, velocityX, velocityY, timeLimit) {
	this.width = 2;
	this.height = 2;
	if(typeof color != "undefined") {
		this.color = color;
		if(typeof x != "undefined") {
			this.x = x;
			this.y = y;
			if(typeof velocityX != "undefined") {
				this.velocityX = velocityX;
				this.velocityY = velocityY;
				if(typeof timeLimit != "undefined") {
					this.timeLimit = timeLimit;
				}
				else {
					this.timeLimit = gameTime + Math.floor(Math.random() * 700) + 300;
				}
			}
			else {
				this.velocityX = Math.random() * 0.2 - 0.1;
				this.velocityY = Math.random() * 0.2 - 0.1;
				this.timeLimit = gameTime + Math.floor(Math.random() * 700) + 300;
			}
		}
		else {
			this.velocityX = Math.random() * 0.2 - 0.1;
			this.velocityY = Math.random() * 0.2 - 0.1;
			this.timeLimit = gameTime + Math.floor(Math.random() * 700) + 300;
		}
	}
	else {
		this.velocityX = Math.random() * 0.2 - 0.1;
		this.velocityY = Math.random() * 0.2 - 0.1;
		this.timeLimit = gameTime + Math.floor(Math.random() * 700) + 300;
	}
	this.maxVelocityX = 0.24;
	this.lastUpdate = gameTime;
}

Particle.prototype = new GameObject();

Particle.prototype.draw = function(context, x, y) {
	context.fillStyle = this.color;
	context.fillRect(x, y, this.width, this.height);
}

Particle.prototype.update = function(gameTime) {

	// This should be checked by map.js for each object
	if(this.x < 0) {
		this.state = -1;
		return;
	}
	if(this.x + this.width > this.map.widthInPixels) {
		this.state = -1;
		return;
	}
	if(this.y < 0) {
		this.state = -1;
		return;
	}
	if(this.y + this.height > this.map.heightInPixels) {
		this.state = -1;
		return;
	}
	
	if(gameTime > this.timeLimit) {
		this.state = -1;
	}
}