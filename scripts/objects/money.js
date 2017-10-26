// MONEY

function Money() {
	this.width = 12;
	this.halfWidth = 6;
	this.height = 12;
	this.maxVelocityX = 0.24;
	this.value = 5;
	this.textColor = "#FFFF00";
}

Money.prototype = new GameObject();

Money.prototype.draw = function(context, x, y) {
	this.animation.draw(context, x, y, this.lookingLeft, this.lastUpdate);
}

Money.prototype.update = function(gameTime) {
	var elapsedTime = gameTime - this.lastUpdate;

	this.lastUpdate = gameTime;
}

function MoneyUiDeleteCondition() {
	return this.y < 50;
}

Money.prototype.collide = function(object, gameTime) {
	if(object instanceof Player && this.lastUpdate >= this.availableTime) {
		ASSET_MANAGER.getAsset("money_sound").play();
		object.money += this.value;
		var uiObject = new UIObject();
		uiObject.x = this.x - this.map.camera.x;
		uiObject.y = this.y - this.map.camera.y;
		uiObject.velocityX = (322 - uiObject.x) / 400;
		uiObject.velocityY = (50 - uiObject.y) / 400;
		uiObject.animation = this.animation;
		uiObject.deleteCondition = MoneyUiDeleteCondition;
		this.map.camera.addObject(uiObject);
		this.state = -1;
		var temp = new GameText(gameTime, this.value, this.textColor, gameTime + 1500);
		temp.x = this.x + this.halfWidth;
		temp.y = this.y;
		temp.velocityY = -0.015;
		this.map.addObject(temp);
	}
}

Money.prototype.tileCollide = function(direction, tileType, gameTime) {
	if(tileType == 3) {
		for(var i = 0; i < 5; i++) {
			var p = new Particle(this.lastUpdate, "#8080FF");
			p.x = this.x + Math.random() * this.width;
			p.y = this.y + Math.random() * this.height;
			p.width = p.height = 2;
			this.map.addObject(p);
		}
		for(var i = 0; i < 5; i++) {
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

function SilverCoin(available) {
	//this.value = 5;
	this.availableTime = available;
	this.animation = new Animation(0, ANIMATION_SET_REPO.get("silver_coin"));
}

SilverCoin.prototype = new Money();

function GoldCoin(available) {
	this.value = 10;
	this.availableTime = available;
	this.animation = new Animation(0, ANIMATION_SET_REPO.get("gold_coin"));
}

GoldCoin.prototype = new Money();

function Emerald(available) {
	this.value = 20;
	this.availableTime = available;
	this.animation = new Animation(0, ANIMATION_SET_REPO.get("emerald"));
}

Emerald.prototype = new Money();

function Ruby(available) {
	this.value = 25;
	this.availableTime = available;
	this.animation = new Animation(0, ANIMATION_SET_REPO.get("ruby"));
}

Ruby.prototype = new Money();