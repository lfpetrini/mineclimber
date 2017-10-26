// Goblin

function CommonEnemy() {
	this.width = 16;
	this.halfWidth = 8;
	this.height = 30;
	this.attack = 15;
	this.defense = 6;
	this.maxVelocityX = 0.24;
	this.attackInterval = 1000;
	this.exp = 25;
	this.name = "GOBLIN";
	this.bloodColor1 = "#FF0000";
	this.bloodColor2 = "#CC0000";
	this.fleshColor1 = "#50BB50";
	this.fleshColor2 = "#308030";
	this.attackBoxX = [22, 7]; // lookingLeft (subtracts), looking right (adds)
	this.attackBoxY = 8;
	this.attackBoxSize = [32, 10];
	// used to draw the health bar
	this.uiPixelPerHealth = 0;
	this.uiTotalHealthBarWidth = 30;
	this.uiCurrentHealthBarWidth = 0;
	//this.setMaxHealth(100);
	//this.setHealth(100);
	this.lookingLeft = false;
	this.awareOfPlayer = false;
	this.awarenessDistance = 600;
	this.awarenessDistanceBack = 200;
	this.attackDistance = 50;
	this.animation = null;
	this.standingAnimationSet = null;
	this.attackingAnimationSet = null;
	this.fallingAnimationSet = null;
	this.runningAnimationSet = null;
	this.state = "standing";
	this.falling = true;
}

CommonEnemy.prototype = new Character();

CommonEnemy.prototype.updateInfo = function() {
	this.uiHealthBarOffsetX = this.width / 2 - this.uiTotalHealthBarWidth / 2;
	// used to draw border and background of health bar
	this.uiHealthBarBgOffsetX = this.uiHealthBarOffsetX - 1;
	this.uiTotalHealthBarBgWidth = this.uiTotalHealthBarWidth + 2;
}

CommonEnemy.prototype.draw = function(context, x, y) {
	this.animation.draw(context, x, y, this.lookingLeft, this.lastUpdate);
	context.fillStyle = "#808080";
	context.font = "16px SilkScreenRegular";
	context.textBaseline = "top";
	context.textAlign = "center";
	context.fillText("LV" + this.level + " " + this.name, x + this.halfWidth, y - 26);
	context.fillRect(x + this.uiHealthBarBgOffsetX, y - 10, this.uiTotalHealthBarBgWidth, 4);
	context.fillStyle = "red";
	context.fillRect(x + this.uiHealthBarOffsetX, y - 9, this.uiCurrentHealthBarWidth, 2);
	//context.fillStyle = "red";
	//context.fillRect(x, y, this.width, this.height);
}

// I was going to create an object to keep all the input states, but this lot of global vars works and I have no time to improve it
CommonEnemy.prototype.update = function(gameTime) {
	var elapsedTime = gameTime - this.lastUpdate;
	if(!this.dead) {
		if(this.awareOfPlayer) {
			if(this.x > this.map.player.x + this.map.player.width) {
				if(this.state != "attacking") {
					if(this.x - (this.map.player.x + this.map.player.width) <= this.attackDistance) {
						if(gameTime - this.lastAttack >= this.attackInterval) {
							ASSET_MANAGER.getAsset("hit_sound").play();
							this.animation = new Animation(gameTime, this.attackingAnimationSet);
							var tempAttackBox = new EnemyAttackBox(gameTime, this, gameTime + this.attackingAnimationSet.totalTime);
							tempAttackBox.x = this.lookingLeft ? this.x - this.attackBoxX[0] : this.x + this.attackBoxX[1];
							tempAttackBox.y = this.y + this.attackBoxY;
							tempAttackBox.width = this.attackBoxSize[0];
							tempAttackBox.height = this.attackBoxSize[1];
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
					if(this.map.player.x - (this.x + this.width) <= this.attackDistance) {
						if(gameTime - this.lastAttack >= this.attackInterval) {
							ASSET_MANAGER.getAsset("hit_sound").play();
							this.animation = new Animation(gameTime, this.attackingAnimationSet);
							var tempAttackBox = new EnemyAttackBox(gameTime, this, gameTime + this.attackingAnimationSet.totalTime);
							tempAttackBox.x = this.lookingLeft ? this.x - this.attackBoxX[0] : this.x + this.attackBoxX[1];
							tempAttackBox.y = this.y + this.attackBoxY;
							tempAttackBox.width = this.attackBoxSize[0];
							tempAttackBox.height = this.attackBoxSize[1];
							this.map.addObject(tempAttackBox);
							this.state = "attacking";
							this.stateStart = this.lastAttack = gameTime;
						}
					}
					else
						this.velocityX += 0.025;
				}
				this.lookingLeft = false;
			} // these last lines change the way the mob is running if it stays standing still for over 500ms
			// so they can't be 'trapped' against a wall
			else if(gameTime - this.stateStart < 500) {
				if(this.lookingLeft) 
					this.velocityX -= 0.025;
				else
					this.velocityX += 0.025;
			}
			else {
				if(this.lookingLeft) {
					this.velocityX += 0.025;
					this.lookingLeft = false;
				}
				else {
					this.velocityX -= 0.025;
					this.lookingLeft = true;
				}
				this.stateStart = gameTime;
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
						this.animation = new Animation(gameTime, this.runningAnimationSet);
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
						this.animation = new Animation(gameTime, this.standingAnimationSet);
						this.state = "standing";
						this.stateStart = gameTime;
					}
				}
			}
		}
	}
	
	if(this.state == "attacking") {
		if(gameTime - this.stateStart > this.attackingAnimationSet.totalTime) {
			this.animation = new Animation(gameTime, this.standingAnimationSet);
			this.state = "standing";
			this.stateStart = gameTime;
		}
	}
	
	this.lastUpdate = gameTime;
}

CommonEnemy.prototype.setMaxHealth = function(health) {
	this.maxHealth = health;
	this.uiPixelPerHealth = this.uiTotalHealthBarWidth / health;
}

CommonEnemy.prototype.setHealth = function(health) {
	this.health = Math.max(0, Math.min(this.maxHealth, health));
	this.uiCurrentHealthBarWidth = this.uiPixelPerHealth * this.health;
	if(this.health == 0) {
		this.dead = true;
		this.state = -1;
		for(var i = 0; i < 7; i++) {
			var p = new Particle(this.lastUpdate, this.fleshColor1);
			p.x = this.x + Math.random() * this.width;
			p.y = this.y + Math.random() * this.height;
			p.width = p.height = 6;
			this.map.addObject(p);
		}
		for(var i = 0; i < 7; i++) {
			var p = new Particle(this.lastUpdate, this.fleshColor2);
			p.x = this.x + Math.random() * this.width;
			p.y = this.y + Math.random() * this.height;
			p.width = p.height = 4;
			this.map.addObject(p);
		}
		// LOOT
		if(this.items.length > 0 || this.coins[0] > 0 || this.coins[1] > 0 || this.coins[2] > 0 || this.coins[3] > 0)
			ASSET_MANAGER.getAsset("chest_sound").play();
		else
			return; // no items
		var available = this.lastUpdate + 600;
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

CommonEnemy.prototype.collide = function(object, gameTime) {
	//if(this.dead)
	//	return;
}

CommonEnemy.prototype.tileCollide = function(direction, tileType, gameTime) {
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
				this.animation = new Animation(gameTime, this.standingAnimationSet);
			else if(this.state == "running")
				this.animation = new Animation(gameTime, this.runningAnimationSet);
			this.lastY = this.Y; // SUMPREME WORKAROUND, so the state won't be changed to falling
		}
	}
}

function Goblin() {
	this.setMaxHealth(40);
	this.setHealth(40);
	this.standingAnimationSet = ANIMATION_SET_REPO.get("goblin_standing");
	this.attackingAnimationSet = ANIMATION_SET_REPO.get("goblin_attacking");
	this.fallingAnimationSet = null;
	this.runningAnimationSet = ANIMATION_SET_REPO.get("goblin_running");
	this.animation = new Animation(0, this.standingAnimationSet);
	this.updateInfo();
	
	this.items = Array();
	this.coins = Array();
}
Goblin.prototype = new CommonEnemy();

function Ogre() {
	this.width = 22;
	this.halfWidth = 11;
	this.height = 42;
	this.attack = 32;
	this.defense = 7;
	this.maxVelocityX = 0.18;
	this.attackInterval = 1500;
	this.exp = 55;
	this.name = "OGRE";
	this.bloodColor1 = "#00FF00";
	this.bloodColor2 = "#008800";
	this.fleshColor1 = "#6A742E";
	this.fleshColor2 = "#93A23F";
	this.attackBoxX = [18, 9]; // lookingLeft (subtracts), looking right (adds)
	this.attackBoxY = 0;
	this.attackBoxSize = [32, 40];
	this.setMaxHealth(50);
	this.setHealth(50);
	this.standingAnimationSet = ANIMATION_SET_REPO.get("ogre_standing");
	this.attackingAnimationSet = ANIMATION_SET_REPO.get("ogre_attacking");
	this.fallingAnimationSet = null;
	this.runningAnimationSet = ANIMATION_SET_REPO.get("ogre_running");
	this.animation = new Animation(0, this.standingAnimationSet);
	this.updateInfo();
	
	this.items = Array();
	this.coins = Array();
}

Ogre.prototype = new CommonEnemy();

function Troll() {
	this.width = 44;
	this.halfWidth = 22;
	this.height = 56;
	this.attack = 60;
	this.defense = 12;
	this.maxVelocityX = 0.12;
	this.attackInterval = 1800;
	this.exp = 150;
	this.name = "TROLL";
	this.bloodColor1 = "#938A56";
	this.bloodColor2 = "#7D7549";
	this.fleshColor1 = "#938A56";
	this.fleshColor2 = "#7D7549";
	this.attackBoxX = [14, 24]; // lookingLeft (subtracts), looking right (adds)
	this.attackBoxY = 6;
	this.attackBoxSize = [34, 50];
	this.setMaxHealth(100);
	this.setHealth(100);
	this.standingAnimationSet = ANIMATION_SET_REPO.get("troll_standing");
	this.attackingAnimationSet = ANIMATION_SET_REPO.get("troll_attacking");
	this.fallingAnimationSet = null;
	this.runningAnimationSet = ANIMATION_SET_REPO.get("troll_running");
	this.animation = new Animation(0, this.standingAnimationSet);
	this.updateInfo();
	
	this.items = Array();
	this.coins = Array();
}

Troll.prototype = new CommonEnemy();

function Rat() {
	this.width = 30;
	this.halfWidth = 15;
	this.height = 20;
	this.attack = 10;
	this.defense = 4;
	this.maxVelocityX = 0.3;
	this.exp = 10;
	this.attackDistance = 15;
	this.name = "RAT";
	this.fleshColor1 = "#505050";
	this.fleshColor2 = "#A01010";
	this.attackBoxX = [11, 26]; // lookingLeft (subtracts), looking right (adds)
	this.attackBoxY = 0;
	this.attackBoxSize = [16, 18];
	this.setMaxHealth(30);
	this.setHealth(30);
	this.standingAnimationSet = ANIMATION_SET_REPO.get("rat_standing");
	this.attackingAnimationSet = ANIMATION_SET_REPO.get("rat_attacking");
	this.fallingAnimationSet = null;
	this.runningAnimationSet = ANIMATION_SET_REPO.get("rat_running");
	this.animation = new Animation(0, this.standingAnimationSet);
	this.updateInfo();
	
	this.items = Array();
	this.coins = Array();
}

Rat.prototype = new CommonEnemy();