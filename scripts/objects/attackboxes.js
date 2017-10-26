// PlayerAttackBox

function PlayerAttackBox(gameTime, character, timeLimit) {
	this.width = 16;
	this.height = 10;
	this.timeLimit = timeLimit;
	this.character = character;
	this.affectedByGravity = false;
	this.lastUpdate = gameTime;
}

PlayerAttackBox.prototype = new GameObject();

PlayerAttackBox.prototype.draw = function(context, x, y) {
	//context.fillStyle = "yellow";
	//context.fillRect(x, y, this.width, this.height);
}

PlayerAttackBox.prototype.update = function(gameTime) {
	if(gameTime > this.timeLimit)
		this.state = -1;
}

PlayerAttackBox.prototype.collide = function(object, gameTime) {
	if(object instanceof CommonEnemy) {
		var damage = Math.max(0, parseInt((this.character.attack + this.character.weapon.template.attack + Math.random() * this.character.attack * 0.2) - object.defense));
		if(damage > 0) {
			for(var i = 0; i < 12; i++) {
				var p = new Particle(gameTime, object.bloodColor1);
				p.x = object.x + Math.random() * object.width;
				p.y = object.y + Math.random() * object.height;
				this.map.addObject(p);
			}
			for(var i = 0; i < 12; i++) {
				var p = new Particle(gameTime, object.bloodColor2);
				p.x = object.x + Math.random() * object.width;
				p.y = object.y + Math.random() * object.height;
				this.map.addObject(p);
			}
			var temp = new GameText(gameTime, damage, "#FF0000", gameTime + 1500);
			temp.x = object.x + object.width / 2;
			temp.y = object.y - 20;
			temp.velocityY = -0.015;
			this.map.addObject(temp);
			object.setHealth(object.health - damage);
		}
		
		if(object.dead) {
			var temp = new GameText(gameTime, object.exp + " EXP", "#EEEEEE", gameTime + 1500);
			temp.x = this.character.x + this.character.width / 2;
			temp.y = this.character.y - 20;
			temp.velocityY = -0.015;
			this.map.addObject(temp);
			this.character.setExp(this.character.exp + object.exp);
		}
		
		this.state = -1;
	}
}



// EnemyAttackBox

function EnemyAttackBox(gameTime, character, timeLimit) {
	this.width = 32;
	this.height = 10;
	this.timeLimit = timeLimit;
	this.character = character;
	this.affectedByGravity = false;
	this.lastUpdate = gameTime;
}

EnemyAttackBox.prototype = new GameObject();

EnemyAttackBox.prototype.draw = function(context, x, y) {
	//context.fillStyle = "red";
	//context.fillRect(x, y, this.width, this.height);
}

EnemyAttackBox.prototype.update = function(gameTime) {
	if(gameTime > this.timeLimit)
		this.state = -1;
}

EnemyAttackBox.prototype.collide = function(object, gameTime) {
	if(object instanceof Player && !object.dead) {
		var defense;
		if(object.state == "blocking") {
			for(var i = 0; i < 10; i++) {
				var p = new Particle(gameTime, "#FFFF00");
				p.x = object.x + Math.random() * object.width;
				p.y = object.y + Math.random() * object.height;
				this.map.addObject(p);
			}
			for(var i = 0; i < 5; i++) {
				var p = new Particle(gameTime, "#806020");
				p.x = object.x + Math.random() * object.width;
				p.y = object.y + Math.random() * object.height;
				this.map.addObject(p);
			}
			defense = object.defense + Math.random() * object.defense * 0.2 + object.shield.template.defense;
		}
		else
			defense = object.defense + Math.random() * object.defense * 0.2;

		var damage = Math.max(0, parseInt(this.character.attack + this.character.attack * Math.random() * 0.2 - defense));
		if(damage > 0) {
			for(var i = 0; i < 12; i++) {
				var p = new Particle(gameTime, "#FF0000");
				p.x = object.x + Math.random() * object.width;
				p.y = object.y + Math.random() * object.height;
				this.map.addObject(p);
			}
			for(var i = 0; i < 12; i++) {
				var p = new Particle(gameTime, "#CC0000");
				p.x = object.x + Math.random() * object.width;
				p.y = object.y + Math.random() * object.height;
				this.map.addObject(p);
			}
			var temp = new GameText(gameTime, damage, "#FF0000", gameTime + 1500);
			temp.x = object.x + object.width / 2;
			temp.y = object.y - 20;
			temp.velocityY = -0.015;
			this.map.addObject(temp);
			object.setHealth(object.health - damage);
		}
		
		this.state = -1;
	}
}