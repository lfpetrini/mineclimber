// Chest

function Chest() {
	this.width = 34;
	this.height = 24;
	this.halfWidth = 17;
	this.animation = new Animation(0, ANIMATION_SET_REPO.get("chest_closed"));
	this.closed = true;
	this.items = Array();
	this.coins = Array();
}

Chest.prototype = new GameObject();

Chest.prototype.draw = function(context, x, y) {
	this.animation.draw(context, x, y, this.lookingLeft, this.lastUpdate);
}

Chest.prototype.update = function(gameTime) {
	var elapsedTime = gameTime - this.lastUpdate;

	this.lastUpdate = gameTime;
}

Chest.prototype.collide = function(object, gameTime) {
	if(this.closed && object instanceof Player) {
		ASSET_MANAGER.getAsset("chest_sound").play();
		this.closed = false;
		this.animation = new Animation(0, ANIMATION_SET_REPO.get("chest_open"));
		var available = gameTime + 600;
		for(var i = 0; i < this.items.length; i++) {
			var item;
			item = this.items[i].createCollectable(available);
			item.velocityX = Math.random() * 0.24 - 0.12;
			item.velocityY = Math.random() * -0.1 - 0.05;
			item.x = this.x + this.halfWidth; item.y = this.y;
			this.map.addObject(item);
		}
		for(var coinType = 0; coinType < this.coins.length; coinType++)
			for(var i = 0; i < this.coins[coinType]; i++) {
				var item;
				switch(coinType) {
					case 1: item = new GoldCoin(available); break;
					case 2: item = new Emerald(available); break;
					case 3: item = new Ruby(available); break;
					case 0:
					default: item = new SilverCoin(available); break;
				}
				item.velocityX = Math.random() * 0.24 - 0.12;
				item.velocityY = Math.random() * -0.1 - 0.05;
				item.x = this.x + this.halfWidth; item.y = this.y;
				this.map.addObject(item);
			}
	}
}

Chest.prototype.tileCollide = function(direction, tileType, gameTime) {
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