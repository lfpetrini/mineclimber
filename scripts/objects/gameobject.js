// GameObject

function GameObject() {
	this.x = 0;
	this.y = 0;
	this.lastX = 0;
	this.lastY = 0;
	this.velocityX = 0;
	this.maxVelocityX = 0;
	this.velocityY = 0;
	this.maxVelocityY = 0;
	this.bounceFactor = 0;
	this.canFallThrough = false;
	this.width = 0;
	this.height = 0;
	this.lastUpdate = 0;
	this.state = 0;
	this.stateStart = 0;
	this.affectedByGravity = true;
	this.lookingLeft = false;
	this.animation = null;
	this.map = null;
}

GameObject.prototype.draw = function(context, x, y) {
}

GameObject.prototype.update = function(gameTime) {
}

GameObject.prototype.collide = function(object, gameTime) {
}

GameObject.prototype.tileCollide = function(direction, tileType, gameTime) {
}