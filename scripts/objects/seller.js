// Seller

function Seller() {
	this.width = 46;
	this.height = 34;
	this.maxVelocityX = 0;
	this.inventorySize = 25;
	this.items = Array();
	this.animation = new Animation(0, ANIMATION_SET_REPO.get("seller"));
}

Seller.prototype = new GameObject();

Seller.prototype.draw = function(context, x, y) {
	this.animation.draw(context, x, y, this.lookingLeft, this.lastUpdate);
}

Seller.prototype.update = function(gameTime) {
	var elapsedTime = gameTime - this.lastUpdate;

	this.lastUpdate = gameTime;
}

Seller.prototype.tileCollide = function(direction, tileType, gameTime) {
	if(tileType == 3) {
		for(var i = 0; i < 7; i++) {
			var p = new Particle(this.lastUpdate, "#8080FF");
			p.x = this.x + Math.random() * this.width;
			p.y = this.y + Math.random() * this.height;
			p.width = p.height = 2;
			this.map.addObject(p);
		}
		for(var i = 0; i < 7; i++) {
			var p = new Particle(this.lastUpdate, "#AAAAEE");
			p.x = this.x + Math.random() * this.width;
			p.y = this.y + Math.random() * this.height;
			p.width = p.height = 2;
			this.map.addObject(p);
		}
		this.state = -1;
	}
}