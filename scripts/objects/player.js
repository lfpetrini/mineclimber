// Player

function Player() {
	this.width = 16;
	this.height = 31;
	this.attack = 10;
	this.defense = 5;
	this.money = 52;
	this.maxVelocityX = 0.15;
	this.attackInterval = 300;
	this.uiPixelPerExp = 0;
	this.uiTotalExpBarWidth = 200;
	this.uiCurrentExpBarWidth = 0;
	this.uiPixelPerHealth = 0;
	this.uiTotalHealthBarWidth = 200;
	this.uiCurrentHealthBarWidth = 0;
	this.setMaxHealth(100);
	this.setHealth(100);
	this.healthPerMs = 0.0015;
	this.expNeeded = 0;
	this.lastExpNeeded = 0;
	this.setExpNeeded(100);
	this.setExp(0);
	this.lookingLeft = false;
	this.floorsClimbed = 0;
	this.animation = new Animation(0, ANIMATION_SET_REPO.get("player_falling"));
	this.inventorySize = 25;
	this.drunkTime = 0;
	this.items = Array();
	this.items.push(new Item(ITEMS_REPO.get("dodgy_pick"), this));
	this.items.push(new Item(ITEMS_REPO.get("wooden_shield"), this));
	this.weapon = this.items[0];
	this.shield = this.items[1];
	this.seller = null;
	this.state = "standing";
	// States: blocking, attacking, running, standing
	
	
	this.maxVelocityXLevelUpRate = 0.01;
	this.attackLevelUpRate = 2;
	this.defenseLevelUpRate = 2;
}

Player.prototype = new Character();

Player.prototype.draw = function(context, x, y) {
	if(!this.dead)
		this.animation.draw(context, x, y, this.lookingLeft, this.lastUpdate);
	//context.fillStyle = "blue";
	//context.fillRect(x, y, this.width, this.height);
}

// I was going to create an object to keep all the input states, but this lot of global vars works and I have no time to improve it
Player.prototype.update = function(gameTime) {
	var elapsedTime = gameTime - this.lastUpdate;

	if(!this.dead) {
		// I know, this is a mess, I could create a lot of stuff to optimize this like a canMove property instead of check for states which the player can't move
		// but 48 hours is a short time span and I can't afford to do that
		if(this.health < this.maxHealth)
			this.setHealth(this.health + elapsedTime * this.healthPerMs);
		if(currentKeys[KEY_LEFT] && this.state != "blocking") {
			this.velocityX -= 0.02;
			this.lookingLeft = true;
		}
		if(currentKeys[KEY_RIGHT] && this.state != "blocking") {
			this.velocityX += 0.02;
			this.lookingLeft = false;
		}
		if(currentKeys[KEY_UP] && this.state != "blocking") {
			if(!this.falling && !this.jumping) {
				ASSET_MANAGER.getAsset("jump_sound").play();
				this.velocityY = -0.24;
				if(this.state != "attacking" && this.state != "blocking")
					this.animation = new Animation(gameTime, ANIMATION_SET_REPO.get("player_jumping"));
				this.jumping = true;
				//this.stateStart = gameTime;
			}
		}
		if(currentKeys[KEY_DOWN]) {
			this.canFallThrough = true;
		}
		else {
			this.canFallThrough = false;
		}
		if((currentKeys[KEY_X] && !lastKeys[KEY_X]) &&  gameTime - this.lastAttack >= this.attackInterval && this.state != "blocking") {
			ASSET_MANAGER.getAsset("hit_sound").play();
			this.animation = new Animation(gameTime, ANIMATION_SET_REPO.get("player_attacking"));
			var tempAttackBox = new PlayerAttackBox(gameTime, this, gameTime + 300);
			tempAttackBox.x = this.lookingLeft ? this.x - 12 : this.x + 12;
			tempAttackBox.y = this.y + 8;
			this.map.addObject(tempAttackBox);
			this.state = "attacking";
			this.stateStart = this.lastAttack = gameTime;
		}
		if(currentKeys[KEY_C]) {
			if(this.state != "blocking") {
				this.animation = new Animation(gameTime, ANIMATION_SET_REPO.get("player_blocking"));
				this.state = "blocking";
				this.stateStart = gameTime;
			}
		}
		else if(this.state == "blocking") {
			this.animation = new Animation(gameTime, ANIMATION_SET_REPO.get("player_standing"));
			this.state = "standing";
			this.stateStart = gameTime;
		}
		
		if(parseInt(this.lastY) < parseInt(this.y)) {
			if(!this.falling) {
				this.falling = true;
				this.jumping = false;
				if(this.state != "attacking" && this.state != "blocking")
					this.animation = new Animation(gameTime, ANIMATION_SET_REPO.get("player_falling"));
				//this.state = "falling";
				//this.stateStart = gameTime;
			}
		}
		else {
			if(this.lastY == this.y && !this.jumping) {
				if(this.lastX != this.x) {
					if(this.state != "running" && this.state != "attacking" && this.state != "blocking") {
						this.animation = new Animation(gameTime, ANIMATION_SET_REPO.get("player_running"));
						this.state = "running";
						this.stateStart = gameTime;
					}
					if(this.velocityX > 0) {
						this.velocityX -= elapsedTime * 0.0003;
						if(this.velocityX < 0)
							this.velocityX = 0;
					}
					else if(this.velocityX < 0) {
						this.velocityX += elapsedTime * 0.0003;
						if(this.velocityX > 0)
							this.velocityX = 0;
					}
				}
				else if(this.state != "attacking" && this.state != "blocking") {
					if(this.state != "standing") {
						this.animation = new Animation(gameTime, ANIMATION_SET_REPO.get("player_standing"));
						this.state = "standing";
						this.stateStart = gameTime;
					}
				}
			}
		}
	}
	if(this.state == "attacking") {
		if(gameTime - this.stateStart >= 300) {
			if(this.jumping)
				this.animation = new Animation(gameTime, ANIMATION_SET_REPO.get("player_jumping"));
			else if(this.falling)
				this.animation = new Animation(gameTime, ANIMATION_SET_REPO.get("player_falling"));
			else
				this.animation = new Animation(gameTime, ANIMATION_SET_REPO.get("player_standing"));
			this.state = "standing";
			this.stateStart = gameTime;
		}
	}
	else if(this.state == "dying") {
	}
	else if(this.state == "dead") {
		this.velocityX = 0;
		this.velocityY = 0;
		if(gameTime - this.stateStart > 2000) {
			var state = new GameOverState(this.floorsClimbed);
			this.map.game.stateManager.changeState(state, gameTime);
			this.state = -1; // I know it doesnt matter :)
		}
	}
	
	this.lastUpdate = gameTime;
}

Player.prototype.setMaxHealth = function(health) {
	this.maxHealth = health;
	this.uiPixelPerHealth = this.uiTotalHealthBarWidth / health;
}

Player.prototype.setHealth = function(health) {
	this.health = Math.max(0, Math.min(this.maxHealth, health));
	this.uiCurrentHealthBarWidth = this.uiPixelPerHealth * this.health;
	if(this.health == 0) {
		this.dead = true;
		this.state = "dead";
		this.stateStart = this.lastUpdate;
		this.floorsClimbed = parseInt((this.map.bottomInPixels + this.map.heightInPixels - this.y) / this.map.floorInPixels);
		for(var i = 0; i < 15; i++) {
			var p = new Particle(this.lastUpdate, "#FF0000");
			p.x = this.x + Math.random() * this.width;
			p.y = this.y + Math.random() * this.height;
			p.width = p.height = 6;
			this.map.addObject(p);
		}
		for(var i = 0; i < 15; i++) {
			var p = new Particle(this.lastUpdate, "#900000");
			p.x = this.x + Math.random() * this.width;
			p.y = this.y + Math.random() * this.height;
			p.width = p.height = 4;
			this.map.addObject(p);
		}
	}
}

Player.prototype.setExpNeeded = function(exp) {
	this.lastExpNeeded = this.expNeeded;
	this.expNeeded = exp;
	this.uiPixelPerExp = this.uiTotalExpBarWidth / (exp - this.lastExpNeeded);
}

Player.prototype.setExp = function(exp) {
	this.exp = exp;
	if(exp >= this.expNeeded)
		this.levelUp();
	this.uiCurrentExpBarWidth = this.uiPixelPerExp * (this.exp - this.lastExpNeeded);
}

Player.prototype.levelUp = function() {
	ASSET_MANAGER.getAsset("levelup_sound").play();
	this.level++;
	
	this.setExpNeeded(this.lastExpNeeded + this.level * 100);
	
	var temp = new GameText(this.lastUpdate, "LEVEL UP", "#00FFFF", this.lastUpdate + 1500);
	temp.x = this.x + this.width / 2;
	temp.y = this.y - 36;
	temp.velocityY = -0.015;
	this.map.addObject(temp);
	
	this.maxVelocityX = Math.min(0.28, this.maxVelocityX + this.maxVelocityXLevelUpRate);
	this.attack += this.attackLevelUpRate;
	this.defense += this.defenseLevelUpRate;
}

Player.prototype.collide = function(object, gameTime) {
	if(!this.dead) {
		if(object instanceof Seller)
			this.seller = object;
	}
}

Player.prototype.tileCollide = function(direction, tileType, gameTime) {
	if(tileType == 3 && !this.dead) {
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
		this.dead = true;
		this.state = "dead";
		this.stateStart = gameTime;
		this.floorsClimbed = parseInt((this.map.bottomInPixels + this.map.heightInPixels - this.y) / this.map.floorInPixels);
	}
	else if(direction == 2) {
		if(this.falling) {
			this.falling = false;
			if(this.state == "standing")
				this.animation = new Animation(gameTime, ANIMATION_SET_REPO.get("player_standing"));
			else if(this.state == "running")
				this.animation = new Animation(gameTime, ANIMATION_SET_REPO.get("player_running"));
			this.lastY = this.Y; // SUMPREME WORKAROUND, so the state won't be changed to falling
		}
	}
}