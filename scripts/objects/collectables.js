// Collectables

function Collectable() {
	this.maxVelocityX = 0.24;
	this.availableTime = 0;
	this.item = null;
}

Collectable.prototype = new GameObject();

Collectable.prototype.draw = function(context, x, y) {
	this.animation.draw(context, x, y, this.lookingLeft, this.lastUpdate);
}

Collectable.prototype.update = function(gameTime) {
	var elapsedTime = gameTime - this.lastUpdate;

	this.lastUpdate = gameTime;
}

Collectable.prototype.collide = function(object, gameTime) {
	if(object instanceof Player && this.lastUpdate >= this.availableTime && object.items.length < object.inventorySize) {
		ASSET_MANAGER.getAsset("potion_sound").play();
		this.state = -1;
		//object.setHealth(object.health + 20);
		object.items.push(new Item(this.item, object));
	}
}

Collectable.prototype.tileCollide = function(direction, tileType, gameTime) {
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
	else if(tileType == 1 || tileType == 2)
		this.velocityX = 0;
}

// HealthPotion

function HealthPotion(available) {
	this.width = 14;
	this.height = 18;
	this.availableTime = available;
	this.animation = new Animation(0, ANIMATION_SET_REPO.get("health_potion"));
	this.item = ITEMS_REPO.get("health_potion");
}
HealthPotion.prototype = new Collectable();

function Beer(available) {
	this.width = 14;
	this.height = 18;
	this.availableTime = available;
	this.animation = new Animation(0, ANIMATION_SET_REPO.get("beer"));
	this.item = ITEMS_REPO.get("beer");
}
Beer.prototype = new Collectable();

function WeaponCollectable(available) {
	this.width = 14;
	this.height = 18;
	this.availableTime = available;
	this.animation = new Animation(0, ANIMATION_SET_REPO.get("pick"));
}
WeaponCollectable.prototype = new Collectable();

function ShieldCollectable(available) {
	this.width = 14;
	this.height = 18;
	this.availableTime = available;
	this.animation = new Animation(0, ANIMATION_SET_REPO.get("shield"));
}
ShieldCollectable.prototype = new Collectable();