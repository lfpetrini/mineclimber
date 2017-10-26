// Character

function Character() {
	this.level = 1;
	this.attackInterval = 0;
	this.lastAttack = 0;
	this.falling = true;
	this.jumping = false;
	this.dead = false;
	this.health = 0;
	this.maxHealth = 0;
	this.attack = 0;
	this.defense = 0;
}

Character.prototype = new GameObject();

Character.prototype.setHealth = function(health) {
	this.health = Math.max(0, Math.min(this.maxHealth, health));
}