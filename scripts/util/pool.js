function ObjectPoolClass() {
	var temp;
	this.particles = new Array();
	temp = new Particle();
	temp.POOLactive = false;
	this.particles.push(temp);
}

ObjectPoolClass.prototype.newParticle = function(gameTime, color, x, y, velocityX, velocityY, timeLimit) {
	for(var i = 0; i < this.particles.length; i++)
		if(this.particles[i].POOLactive)
			continue;
		else {
			// ORIGINAL CONSTRUCTOR
			this.particles[i].width = 2;
			this.particles[i].height = 2;
			if(typeof color != "undefined") {
				this.particles[i].color = color;
				if(typeof x != "undefined") {
					this.particles[i].x = x;
					this.particles[i].y = y;
					if(typeof velocityX != "undefined") {
						this.particles[i].velocityX = velocityX;
						this.particles[i].velocityY = velocityY;
						if(typeof timeLimit != "undefined") {
							this.particles[i].timeLimit = timeLimit;
						}
						else {
							this.particles[i].timeLimit = gameTime + Math.floor(Math.random() * 700) + 300;
						}
					}
					else {
						this.particles[i].velocityX = Math.random() * 0.2 - 0.1;
						this.particles[i].velocityY = Math.random() * 0.2 - 0.1;
						this.particles[i].timeLimit = gameTime + Math.floor(Math.random() * 700) + 300;
					}
				}
				else {
					this.particles[i].velocityX = Math.random() * 0.2 - 0.1;
					this.particles[i].velocityY = Math.random() * 0.2 - 0.1;
					this.particles[i].timeLimit = gameTime + Math.floor(Math.random() * 700) + 300;
				}
			}
			else {
				this.particles[i].velocityX = Math.random() * 0.2 - 0.1;
				this.particles[i].velocityY = Math.random() * 0.2 - 0.1;
				this.particles[i].timeLimit = gameTime + Math.floor(Math.random() * 700) + 300;
			}
			this.particles[i].maxVelocityX = 0.24;
			this.particles[i].lastUpdate = gameTime;
			
			this.particles[i].POOLactive = true;
			this.particles[i].state = 0;
			this.particles[i].stateStart = gameTime;
			return this.particles[i];
		}
	var temp = new Particle(gameTime, color, x, y, velocityX, velocityY, timeLimit);
	this.particles.push(temp);
	temp.POOLactive = true;
	return temp;
}

ObjectPoolClass.prototype.destroy = function(object) {
	object.POOLactive = false;
}