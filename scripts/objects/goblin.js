// Goblin

function Goblin() {
	this.width = 16;
	this.halfWidth = 8;
	this.height = 30;
	this.attack = 15;
	this.defense = 6;
	this.maxVelocityX = 0.24;
	this.attackInterval = 1000;
	this.exp = 25;
	this.bloodColor1 = "#FF0000";
	this.bloodColor2 = "#CC0000";
	// used to draw the health bar
	this.uiPixelPerHealth = 0;
	this.uiTotalHealthBarWidth = 30;
	this.uiCurrentHealthBarWidth = 0;
	this.uiHealthBarOffsetX = this.width / 2 - this.uiTotalHealthBarWidth / 2;
	// used to draw border and background of health bar
	this.uiHealthBarBgOffsetX = this.uiHealthBarOffsetX - 1;
	this.uiTotalHealthBarBgWidth = this.uiTotalHealthBarWidth + 2;
	this.setMaxHealth(40);
	this.setHealth(40);
	this.lookingLeft = false;
	this.awareOfPlayer = false;
	this.awarenessDistance = 600;
	this.awarenessDistanceBack = 200;
	this.animation = new Animation(0, ANIMATION_SET_REPO.get("goblin_standing"));
	this.state = "standing";
	this.falling = true;
}

Goblin.prototype = new Character();

Goblin.prototype.draw = function(context, x, y) {
	this.animation.draw(context, x, y, this.lookingLeft, this.lastUpdate);
	context.fillStyle = "#808080";
	context.font = "16px SilkScreenRegular";
	context.textBaseline = "top";
	context.textAlign = "center";
	context.fillText("LV" + this.level + " GOBLIN", x + this.halfWidth, y - 26);
	context.fillRect(x + this.uiHealthBarBgOffsetX, y - 10, this.uiTotalHealthBarBgWidth, 4);
	context.fillStyle = "red";
	context.fillRect(x + this.uiHealthBarOffsetX, y - 9, this.uiCurrentHealthBarWidth, 2);
	//context.fillStyle = "red";
	//context.fillRect(x, y, this.width, this.height);
}

// I was going to create an object to keep all the input states, but this lot of global vars works and I have no time to improve it
Goblin.prototype.update = function(gameTime) {
	var elapsedTime = gameTime - this.lastUpdate;
	if(!this.dead) {
		if(this.awareOfPlayer) {
			if(this.x > this.map.player.x + this.map.player.width) {
				if(this.state != "attacking") {
					if(this.x - this.map.player.x + this.map.player.width <= 50) {
						if(gameTime - this.lastAttack >= this.attackInterval) {
							ASSET_MANAGER.getAsset("hit_sound").play();
							this.animation = new Animation(gameTime, ANIMATION_SET_REPO.get("goblin_attacking"));
							var tempAttackBox = new EnemyAttackBox(gameTime, this, gameTime + 300);
							tempAttackBox.x = this.lookingLeft ? this.x - 22 : this.x + 7;
							tempAttackBox.y = this.y + 8;
							this.map.addObject(tempAttackBox);
							this.state = "attacking";
							this.stateStart = this.lastAttack = gameTime;
						}
					}
					else
						this.velocityX -= 0.025;
				}
				this.lookingLeft = true;
			}
			else if(this.x + this.width < this.map.player.x) {
				if(this.state != "attacking") {
					if(this.map.player.x - this.x + this.width <= 50) {
						if(gameTime - this.lastAttack >= this.attackInterval) {
							ASSET_MANAGER.getAsset("hit_sound").play();
							this.animation = new Animation(gameTime, ANIMATION_SET_REPO.get("goblin_attacking"));
							var tempAttackBox = new EnemyAttackBox(gameTime, this, gameTime + 300);
							tempAttackBox.x = this.lookingLeft ? this.x - 22 : this.x + 7;
							tempAttackBox.y = this.y + 8;
							this.map.addObject(tempAttackBox);
							this.state = "attacking";
							this.stateStart = this.lastAttack = gameTime;
						}
					}
					else
						this.velocityX += 0.025;
				}
				this.lookingLeft = false;
			}
			else {
				if(this.lookingLeft) {
					this.velocityX -= 0.025;
				}
				else {
					this.velocityX += 0.025;
				}
			}
		}
		else if (this.y < this.map.player.y + this.map.player.height && this.y + this.height > this.map.player.y) {
			if(this.x > this.map.player.x + this.map.player.width) {
				var awarenessDistance = this.lookingLeft ? this.awarenessDistance : this.awarenessDistanceBack;
				if(this.x - (this.map.player.x + this.map.player.width) <= awarenessDistance)
					this.awareOfPlayer = true;
			}
			else if(this.x + this.width < this.map.player.x) {
				var awarenessDistance = this.lookingLeft ? this.awarenessDistanceBack : this.awarenessDistance;
				if((this.map.player.x - (this.x + this.width)) <= awarenessDistance)
					this.awareOfPlayer = true;
			}
			else {
				this.awareOfPlayer = true;
			}
		}
		
		
		if(parseInt(this.lastY) < parseInt(this.y)) {
			if(!this.falling) {
				this.falling = true;
				//if(this.state != "attacking" && this.state != "blocking")
				//	this.animation = new Animation(gameTime, ANIMATION_SET_REPO.get("player_falling"));
			}
		}
		else {
			if(this.lastY == this.y) {
				if(this.lastX != this.x) {
					if(this.state != "running" && this.state != "attacking") {
						this.animation = new Animation(gameTime, ANIMATION_SET_REPO.get("goblin_running"));
						this.state = "running";
						this.stateStart = gameTime;
					}
					if(this.velocityX > 0) {
						this.velocityX -= elapsedTime * 0.0006;
						if(this.velocityX < 0)
							this.velocityX = 0;
					}
					else if(this.velocityX < 0) {
						this.velocityX += elapsedTime * 0.0006;
						if(this.velocityX > 0)
							this.velocityX = 0;
					}
				}
				else if(this.state != "attacking") {
					if(this.state != "standing") {
						this.animation = new Animation(gameTime, ANIMATION_SET_REPO.get("goblin_standing"));
						this.state = "standing";
						this.stateStart = gameTime;
					}
				}
			}
		}
	}
	
	if(this.state == "attacking") {
		if(gameTime - this.stateStart >= 300) {
			this.animation = new Animation(gameTime, ANIMATION_SET_REPO.get("goblin_standing"));
			this.state = "standing";
			this.stateStart = gameTime;
		}
	}
	
	this.lastUpdate = gameTime;
}

Goblin.prototype.setMaxHealth = function(health) {
	this.maxHealth = health;
	this.uiPixelPerHealth = this.uiTotalHealthBarWidth / health;
}

Goblin.prototype.setHealth = function(health) {
	this.health = Math.max(0, Math.min(this.maxHealth, health));
	this.uiCurrentHealthBarWidth = this.uiPixelPerHealth * this.health;
	if(this.health == 0) {
		this.dead = true;
		this.state = -1;
		for(var i = 0; i < 7; i++) {
			var p = new Particle(this.lastUpdate, "#50BB50");
			p.x = this.x + Math.random() * this.width;
			p.y = this.y + Math.random() * this.height;
			p.width = p.height = 6;
			this.map.addObject(p);
		}
		for(var i = 0; i < 7; i++) {
			var p = new Particle(this.lastUpdate, "#308030");
			p.x = this.x + Math.random() * this.width;
			p.y = this.y + Math.random() * this.height;
			p.width = p.height = 4;
			this.map.addObject(p);
		}
	}
}

Goblin.prototype.collide = function(object, gameTime) {
	//if(this.dead)
	//	return;
}

Goblin.prototype.tileCollide = function(direction, tileType, gameTime) {
	if(tileType == 3) {
		for(var i = 0; i < 15; i++) {
			var p = new Particle(this.lastUpdate, "#8080FF");
			p.x = this.x + Math.random() * this.width;
			p.y = this.y + Math.random() * this.height;
			p.width = p.height = 2;
			this.map.addObject(p);
		}
		for(var i = 0; i < 15; i++) {
			var p = new Particle(this.lastUpdate, "#AAAAEE");
			p.x = this.x + Math.random() * this.width;
			p.y = this.y + Math.random() * this.height;
			p.width = p.height = 2;
			this.map.addObject(p);
		}
		this.dead = true;
		this.state = -1;
	}
	else if(direction == 2) {
		if(this.falling) {
			this.falling = false;
			if(this.state == "standing")
				this.animation = new Animation(gameTime, ANIMATION_SET_REPO.get("goblin_standing"));
			else if(this.state == "running")
				this.animation = new Animation(gameTime, ANIMATION_SET_REPO.get("goblin_running"));
			this.lastY = this.Y; // SUMPREME WORKAROUND, so the state won't be changed to falling
		}
	}
}