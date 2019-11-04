// GameMap

function GameMap(game) {
	this.tileSet = null;
	this.tiles = null;
	this.collision = null;
	this.objects = Array();
	this.objectsToRemove = Array();
	this.distanceToUpdate = 600;
	this.width = 30;
	this.height = 120;
	this.waterLevel = this.height;
	this.msToRaiseWaterLevel = 1000;
	this.nextWaterRaise = 1000;
	this.chestChance = 5;
	this.sellerChance = 5;
	this.widthInPixels = 0;
	this.heightInPixels = 0;
	this.tileWidth = 20;
	this.tileHeight = 20;
	this.bottom = -this.height;
	this.bottomInPixels = this.bottom * this.tileHeight;
	this.lastUpdate = 0;
	this.gravityPerMs = 0.0003;
	this.maxGravity = 0.24
	this.lastPillarGeneratedX = 0;
	this.player = null;
	this.game = game;
	this.camera = null;
	this.background = ASSET_MANAGER.getAsset("background");
	this.floorInPixels = 4 * this.tileHeight;
	
	var tilesImage = ASSET_MANAGER.getAsset("tiles");
	
	var tilesCount = Math.ceil((tilesImage.width / this.tileWidth) * (tilesImage.height / this.tileHeight));
	
	// create the Tile Set
	// this is really a mess but I'm running out of time
	this.tileSet = Array(6);
	// create an image for each tile
	this.tileSet[0] = null; // transparent one
	var i = 1;
	var last = 4 * this.tileWidth;
	var tempAnim;
	for(var x = 0; x < last; x += this.tileWidth) {
		tempAnim = new AnimationSet(this.tileWidth, this.tileHeight);
		tempAnim.setFrameTime(0);
		tempAnim.addFrames(tilesImage, x, 0, 1);
		this.tileSet[i] = new Animation(0, tempAnim);
		//this.tileSet[i] = cropImage(tilesImage, x, y, this.tileWidth, this.tileHeight, this.tileWidth, this.tileHeight);
		i++;
	}
	// water
	tempAnim = new AnimationSet(this.tileWidth, this.tileHeight);
	tempAnim.setFrameTime(500);
	tempAnim.addFrames(tilesImage, last, 0, 2);
	this.tileSet[i] = new Animation(0, tempAnim);
	
	// create the collision matrix
	this.collision = Array(this.width);
	for(var x = 0; x < this.width; x++) {
		this.collision[x] = Array(this.height);
	}

	// player position
	var player = new Player();
	player.x = 25;
	player.y = -130; // it will be added 400 in the first level generation
	this.addObject(player);
	this.player = player;

	// create the tile matrix (width, height)
	this.tiles = Array();
	// allocate space for tile matrix
	this.tiles = Array(this.width);
	for(var x = 0; x < this.width; x++) {
		this.tiles[x] = Array(this.height);
	}
	
	this.widthInPixels = this.tileWidth * this.width;
	this.heightInPixels = this.tileHeight * this.height;
	
	// create the end of level walls and fill the rest with zeroes
	var w = this.width - 1;
	for(var y = 0; y < this.height; y++) {
		this.tiles[0][y] = this.collision[0][y] = 1;
		this.tiles[w][y] = this.collision[w][y] = 1;
		for(var x = 1; x < w; x++)
			this.tiles[x][y] = this.collision[x][y] = 0;
	}
	
	this.generate(parseInt(this.height / 4));

	for(var x = 1; x < w; x++) {
		this.tiles[x][115] = 4;
		this.collision[x][115] = 1;
	}
}

GameMap.prototype.addObject = function(obj) {
	obj.map = this;
	var left = clamp(parseInt(obj.x / this.tileWidth), 0, this.width);
	var top = clamp(parseInt(obj.y / this.tileHeight), 0, this.height);
	var right = clamp(parseInt((obj.x + obj.width) / this.tileWidth), 0, this.width);
	var bottom = clamp(parseInt((obj.y + obj.height) / this.tileHeight), 0, this.height);
	for(var y = top; y <= bottom; y++)
		for(var x = left; x <= right; x++)
			if(this.collision[x][y] == 1) {
				obj.tileCollide(0, obj.lastUpdate);
				break;
			}
	this.objects.push(obj);
	obj.maxVelocityY = this.maxGravity;
}

GameMap.prototype.start = function(gameTime) {
	this.lastUpdate = gameTime;
}


/*

FLOOR TYPES:
1 1 0 0 1 1 1 1 0 0 1 1 Can be generated after pillar
1 1 2 2 1 1 1 1 2 2 1 1 Can be generated after pillar
2 2 2 2 2 2 2 2 2 2 2 2 Can be generated after pillar
1 1 1 1 1 0 0 1 1 1 1 1 Can't be generated after pillar
1 1 1 1 1 2 2 1 1 1 1 1 Can't be generated after pillar

*/

GameMap.prototype.generate = function(floors) {
	var heightInTiles = floors * 4;
	var heightInPixels = heightInTiles * this.tileHeight;
	// update object position (move them down)
	for(var i = 0; i < this.objects.length; i++) {
		this.objects[i].y += heightInPixels;
	}

	this.bottom += heightInTiles;
	this.waterLevel -= heightInTiles;
	this.bottomInPixels = this.bottom * this.tileHeight;

	// move all the tiles down so we can generate new floors
	var lastTileX = this.width - 1;
	for(var y = this.height - 1; y >= heightInTiles; y--)
		for(var x = 1; x < lastTileX; x++) {
			this.tiles[x][y] = this.tiles[x][y - heightInTiles];
			this.collision[x][y] = this.collision[x][y - heightInTiles];
		}

	// generate floor
	var halfMapWidth = this.width / 2;
	var type, holes, holeStart, holeEnd, holeCollision, holeTile, holeSize, temp1, temp2, groundStart;
	for(var y = heightInTiles - 1; y > 0; y-=4) {
		if(this.lastPillarGeneratedX != 0) {
			type = parseInt(Math.random() * 3);
			holeSeparatorX = this.lastPillarGeneratedX;
		}
		else {
			type = parseInt(Math.random() * 5);
			holeSeparatorX = halfMapWidth;
		}
		if(type == 2) {
			for(var x = 1; x < lastTileX; x++) {
				this.tiles[x][y] = 4;
				this.collision[x][y] = 2;
			}
		}
		else {
			switch(type) {
				case 0: holes = 2;
						holeTile = 0;
						holeCollision = 0;
						break;
				case 1: holes = 2;
						holeTile = 4;
						holeCollision = 2;
						break;
				case 3: holes = 1;
						holeTile = 0;
						holeCollision = 0;
						break;
				case 4: holes = 1;
						holeTile = 4;
						holeCollision = 2;
						break;
			}
			groundStart = 1;
			for(var h = 0; h < holes; h++) {
				temp1 = groundStart + parseInt(Math.random() * (holeSeparatorX - groundStart));
				do {
					temp2 = groundStart + parseInt(Math.random() * (holeSeparatorX - groundStart));
					if(temp1 < temp2) {
						holeStart = temp1;
						holeEnd = temp2;
					}
					else {
						holeStart = temp2;
						holeEnd = temp1;
					}
					holeSize = holeEnd - holeStart;
				} while(holeSize < 2 || holeSize > 4);
				
				for(var x = groundStart; x < holeStart; x++) {
					this.tiles[x][y] = 1 + parseInt(Math.random() * 3);
					this.collision[x][y] = 1;
				}
				for(var x = holeStart; x <= holeEnd; x++) {
					this.tiles[x][y] = holeTile;
					this.collision[x][y] = holeCollision;
				}
				for(var x = holeEnd + 1; x < holeSeparatorX; x++) {
					this.tiles[x][y] = 1 + parseInt(Math.random() * 3);
					this.collision[x][y] = 1;
				}
				
				groundStart = holeSeparatorX;
				holeSeparatorX = lastTileX;
			}
			for(var x = groundStart; x < lastTileX; x++) {
				this.tiles[x][y] = 1 + parseInt(Math.random() * 3);
				this.collision[x][y] = 1;
			}
		}

		// create pillar, or not, and clear the space in between the floors
		if((Math.random() * 100) < 35) {
			do {
				this.lastPillarGeneratedX = 5 + parseInt(Math.random() * 20);
			} while(type != 2 && (this.collision[this.lastPillarGeneratedX - 1][y] != 1 || this.collision[this.lastPillarGeneratedX + 1][y] != 1));
			for(var i = 1; i < 4; i++) {
				for(var x = 1; x < this.lastPillarGeneratedX; x++) {
					this.collision[x][y - i] = 0;
					this.tiles[x][y - i] = 0;
				}
				this.collision[this.lastPillarGeneratedX][y - i] = 1;
				this.tiles[this.lastPillarGeneratedX][y - i] = 1 + parseInt(Math.random() * 3);
				for(var x = this.lastPillarGeneratedX + 1; x < lastTileX; x++) {
					this.collision[x][y - i] = 0;
					this.tiles[x][y - i] = 0;
				}
			}
		}
		else {
			for(var i = 1; i < 4; i++) {
				for(var x = 1; x < lastTileX; x++) {
					this.collision[x][y - i] = 0;
					this.tiles[x][y - i] = 0;
				}
			}
			this.lastPillarGeneratedX = 0;
		}

		var currentTile = this.bottom + this.height - y;
		var level = parseInt(currentTile / 30);
		if(currentTile > 6)
			this.addMob(level, y - 1);

		if((Math.random() * 100) < this.chestChance && currentTile > 6) {
			this.chestChance = 5;
			var chest = createChest(level);
			chest.x = 30 + Math.random() * 530;
			chest.y = (y - 1) * this.tileHeight - chest.height;
			this.addObject(chest);
		}
		else
			this.chestChance += 0.5;

		if((Math.random() * 100) < this.sellerChance && currentTile > 6) {
			this.sellerChance = 5;
			var seller = createSeller(level);
			seller.x = 30 + Math.random() * 500;
			seller.y = (y - 1) * this.tileHeight - seller.height;
			this.addObject(seller);
		}
		else
			this.sellerChance += 0.5;
	}
}

function createChest(level) {
	var chest = new Chest();
	chest.coins[0] = Math.min(10, 1 + parseInt(Math.random() * level + 0.5));
	chest.coins[1] = Math.min(10, parseInt(Math.random() * level / 3 + 0.5));
	chest.coins[2] = Math.min(10, parseInt(Math.random() * level / 5 + 0.5));
	chest.coins[3] = Math.min(10, parseInt(Math.random() * level / 7 + 0.5));
	
	if(level > 12) {
		if(Math.random() < 0.4)
			chest.items.push(ITEMS_REPO.get("health_potion"));
		if(Math.random() < 0.35)
			chest.items.push(ITEMS_REPO.get("beer"));
			
		if(Math.random() < 0.1)
			chest.items.push(ITEMS_REPO.get("fire_pick"));
		else if(Math.random() < 0.3)
			chest.items.push(ITEMS_REPO.get("gilded_pick"));
		
		if(Math.random() < 0.1)
			chest.items.push(ITEMS_REPO.get("golden_shield"));
		else if(Math.random() < 0.25)
			chest.items.push(ITEMS_REPO.get("oaken_shield"));
	}
	else if(level > 9) {
		if(Math.random() < 0.35)
			chest.items.push(ITEMS_REPO.get("health_potion"));
		if(Math.random() < 0.3)
			chest.items.push(ITEMS_REPO.get("beer"));
			
		if(Math.random() < 0.1)
			chest.items.push(ITEMS_REPO.get("golden_pick"));
		else if(Math.random() < 0.3)
			chest.items.push(ITEMS_REPO.get("gilded_pick"));
		
		if(Math.random() < 0.3)
			chest.items.push(ITEMS_REPO.get("steel_shield"));
	}
	else if(level > 6) {
		if(Math.random() < 0.3)
			chest.items.push(ITEMS_REPO.get("health_potion"));
		if(Math.random() < 0.25)
			chest.items.push(ITEMS_REPO.get("beer"));
			
		if(Math.random() < 0.1)
			chest.items.push(ITEMS_REPO.get("gilded_pick"));
		else if(Math.random() < 0.3)
			chest.items.push(ITEMS_REPO.get("steel_pick"));
			
		if(Math.random() < 0.2)
			chest.items.push(ITEMS_REPO.get("steel_shield"));
	}
	else if(level > 2) {
		if(Math.random() < 0.25)
			chest.items.push(ITEMS_REPO.get("health_potion"));
		if(Math.random() < 0.2)
			chest.items.push(ITEMS_REPO.get("beer"));
		if(Math.random() < 0.2)
			chest.items.push(ITEMS_REPO.get("steel_pick"));
	}
	else {
		if(Math.random() < 0.2)
			chest.items.push(ITEMS_REPO.get("health_potion"));
		if(Math.random() < 0.1)
			chest.items.push(ITEMS_REPO.get("beer"));
	}
	return chest;
}

function createSeller(level) {
	var seller = new Seller();
	
	if(level > 12) {
		for(var i = 0; i < 1 + Math.round(Math.random() * 3); i++)
			seller.items.push(new Item(ITEMS_REPO.get("health_potion"), seller));
		for(var i = 0; i < 1 + Math.round(Math.random()); i++)
			seller.items.push(new Item(ITEMS_REPO.get("beer"), seller));
		seller.items.push(new Item(ITEMS_REPO.get("dodgy_pick"), seller));
		seller.items.push(new Item(ITEMS_REPO.get("steel_pick"), seller));
		seller.items.push(new Item(ITEMS_REPO.get("gilded_pick"), seller));
		seller.items.push(new Item(ITEMS_REPO.get("golden_pick"), seller));
		seller.items.push(new Item(ITEMS_REPO.get("fire_pick"), seller));
		seller.items.push(new Item(ITEMS_REPO.get("emerald_pick"), seller));
		seller.items.push(new Item(ITEMS_REPO.get("ruby_pick"), seller));
		seller.items.push(new Item(ITEMS_REPO.get("wooden_shield"), seller));
		seller.items.push(new Item(ITEMS_REPO.get("steel_shield"), seller));
		seller.items.push(new Item(ITEMS_REPO.get("oaken_shield"), seller));
		seller.items.push(new Item(ITEMS_REPO.get("golden_shield"), seller));
		seller.items.push(new Item(ITEMS_REPO.get("diamond_shield"), seller));
	}
	else if(level > 9) {
		seller.items.push(new Item(ITEMS_REPO.get("health_potion"), seller));
		seller.items.push(new Item(ITEMS_REPO.get("beer"), seller));
		seller.items.push(new Item(ITEMS_REPO.get("dodgy_pick"), seller));
		seller.items.push(new Item(ITEMS_REPO.get("steel_pick"), seller));
		seller.items.push(new Item(ITEMS_REPO.get("gilded_pick"), seller));
		seller.items.push(new Item(ITEMS_REPO.get("golden_pick"), seller));
		seller.items.push(new Item(ITEMS_REPO.get("fire_pick"), seller));
		seller.items.push(new Item(ITEMS_REPO.get("wooden_shield"), seller));
		seller.items.push(new Item(ITEMS_REPO.get("steel_shield"), seller));
		seller.items.push(new Item(ITEMS_REPO.get("oaken_shield"), seller));
		seller.items.push(new Item(ITEMS_REPO.get("golden_shield"), seller));
	}
	else if(level > 6) {
		seller.items.push(new Item(ITEMS_REPO.get("health_potion"), seller));
		seller.items.push(new Item(ITEMS_REPO.get("beer"), seller));
		seller.items.push(new Item(ITEMS_REPO.get("dodgy_pick"), seller));
		seller.items.push(new Item(ITEMS_REPO.get("steel_pick"), seller));
		seller.items.push(new Item(ITEMS_REPO.get("gilded_pick"), seller));
		seller.items.push(new Item(ITEMS_REPO.get("golden_pick"), seller));
		seller.items.push(new Item(ITEMS_REPO.get("wooden_shield"), seller));
		seller.items.push(new Item(ITEMS_REPO.get("steel_shield"), seller));
		seller.items.push(new Item(ITEMS_REPO.get("oaken_shield"), seller));
	}
	else if(level > 2) {
		seller.items.push(new Item(ITEMS_REPO.get("health_potion"), seller));
		seller.items.push(new Item(ITEMS_REPO.get("dodgy_pick"), seller));
		seller.items.push(new Item(ITEMS_REPO.get("steel_pick"), seller));
		seller.items.push(new Item(ITEMS_REPO.get("gilded_pick"), seller));
		seller.items.push(new Item(ITEMS_REPO.get("wooden_shield"), seller));
		seller.items.push(new Item(ITEMS_REPO.get("steel_shield"), seller));
	}
	else {
		seller.items.push(new Item(ITEMS_REPO.get("health_potion"), seller));
		seller.items.push(new Item(ITEMS_REPO.get("dodgy_pick"), seller));
		seller.items.push(new Item(ITEMS_REPO.get("steel_pick"), seller));
		seller.items.push(new Item(ITEMS_REPO.get("wooden_shield"), seller));
		seller.items.push(new Item(ITEMS_REPO.get("steel_shield"), seller));
	}
	return seller;
}

// So, each level means 30 tiles, so, about 8 floors.
// rats respawn from lv0, goblins from lv3, ogres from lv6, and trolls from lv10
GameMap.prototype.addMob = function(level, y) {
	
	if(Math.random() < 0.7) {
		var enemy = new Rat();
		enemy.level += level;
		enemy.attack += parseInt(level * 1.2);
		enemy.defense += parseInt(level * 1.2);
		enemy.exp += parseInt(level * 1.5);
		enemy.setMaxHealth(enemy.health + parseInt(level * 3));
		enemy.setHealth(enemy.maxHealth);
		enemy.x = 30 + Math.random() * 540;
		enemy.y = y * this.tileHeight - enemy.height;
		this.addObject(enemy);
	}
	
	if(level < 3)
		return;

	var mobLevel = level - 3;
	var quantity = 1 + Math.random() * mobLevel / 8;
	for(var i = 0; i < quantity; i++)
		if(Math.random() < 0.3) {
			var enemy = new Goblin();
			enemy.level += mobLevel;
			enemy.attack += parseInt(mobLevel * 1.2);
			enemy.defense += parseInt(mobLevel * 1.2);
			enemy.exp += parseInt(mobLevel * 1.5);
			enemy.setMaxHealth(enemy.health + parseInt(mobLevel * 3));
			enemy.setHealth(enemy.maxHealth);
			enemy.x = 30 + Math.random() * 530;
			enemy.y = y * this.tileHeight - enemy.height;
			enemy.coins[0] = Math.min(8, parseInt(Math.random() * mobLevel + 0.5));
			enemy.coins[1] = Math.min(3, parseInt(Math.random() * mobLevel / 3 + 0.5));
			if(Math.random() < 0.3)
				enemy.items.push(ITEMS_REPO.get("health_potion"));
			this.addObject(enemy);
		}
	
	if(level < 6)
		return;
	
	mobLevel = level - 6;
	quantity = 1 + Math.random() * mobLevel / 8;
	for(var i = 0; i < quantity; i++)
		if(Math.random() < 0.15) {
			var enemy = new Ogre();
			enemy.level += mobLevel;
			enemy.attack += parseInt(mobLevel * 1.2);
			enemy.defense += parseInt(mobLevel * 1.2);
			enemy.exp += parseInt(mobLevel * 1.5);
			enemy.setMaxHealth(enemy.health + parseInt(mobLevel * 3));
			enemy.setHealth(enemy.maxHealth);
			enemy.x = 30 + Math.random() * 530;
			enemy.y = y * this.tileHeight - enemy.height;
			enemy.coins[1] = Math.min(4, parseInt(Math.random() * mobLevel + 0.5));
			enemy.coins[2] = Math.min(2, parseInt(Math.random() * mobLevel / 3 + 0.5));
			if(Math.random() < 0.15)
				enemy.items.push(ITEMS_REPO.get("health_potion"));
			if(Math.random() < 0.25)
				enemy.items.push(ITEMS_REPO.get("steel_pick"));
			this.addObject(enemy);
		}
	
	if(level < 10)
		return;

	mobLevel = level - 10;
	quantity = 1 + Math.random() * mobLevel / 8;
	for(var i = 0; i < quantity; i++)
		if(Math.random() < 0.1) {
			var enemy = new Troll();
			enemy.level += mobLevel;
			enemy.attack += parseInt(mobLevel * 1.2);
			enemy.defense += parseInt(mobLevel * 1.2);
			enemy.exp += parseInt(mobLevel * 1.5);
			enemy.setMaxHealth(enemy.health + parseInt(mobLevel * 3));
			enemy.setHealth(enemy.maxHealth);
			enemy.x = 30 + Math.random() * 510;
			enemy.y = y * this.tileHeight - enemy.height;
			enemy.coins[1] = Math.min(10, parseInt(Math.random() * mobLevel + 0.5));
			enemy.coins[2] = Math.min(5, parseInt(Math.random() * mobLevel / 2 + 0.5));
			enemy.coins[3] = Math.min(4, parseInt(Math.random() * mobLevel / 3 + 0.5));
			if(Math.random() < 0.1)
				enemy.items.push(ITEMS_REPO.get("golden_pick"));
			else if(Math.random() < 0.3)
				enemy.items.push(ITEMS_REPO.get("steel_pick"));
			if(Math.random() < 0.15)
				enemy.items.push(ITEMS_REPO.get("bone_shield"));
			if(Math.random() < 0.4)
				enemy.items.push(ITEMS_REPO.get("beer"));
			this.addObject(enemy);
		}
}

GameMap.prototype.draw = function(context, tileX, tileY, width, height) {
	var lastX = Math.min(tileX + width, this.width);
	var lastY = Math.min(tileY + height, this.height);
	
	var widthInPixels = (lastX - tileX) * this.tileWidth;
	var heightInPixels = (lastY - tileY) * this.tileHeight;
	
	var mapStartX = this.tileWidth * tileX;
	var mapStartY = this.tileHeight * tileY;
	
	// this block exists so we can start drawing from outside the map (negative values)
	// and it will be drawn in the right position (negative tiles will not be drawn, just like if they were transparent)
	var startPositionX = (tileX < 0) ? this.tileWidth * Math.abs(tileX) : 0;
	var startPositionY = (tileY < 0) ? this.tileHeight * Math.abs(tileY) : 0;
	var tileX = Math.max(tileX, 0);
	var tileY = Math.max(tileY, 0);
	// end of block
	
	var positionY = startPositionY;var positionY = startPositionY;
	for(var y = tileY; y < lastY; y++) {
		var positionX = startPositionX;
		for(var x = tileX; x < lastX; x++) {
			if(this.tiles[x][y] != 0) {
				this.tileSet[this.tiles[x][y]].draw(context, positionX, positionY, false, this.lastUpdate);
			}
			positionX += this.tileWidth;
		}
		positionY += this.tileHeight;
	}
	
	// get a list of objects which appear in the camera frame
	var objectsToDraw = Array();
	for(var i = 0; i < this.objects.length; i++)
		if(checkRectIntersection(this.objects[i].x, this.objects[i].y, this.objects[i].width, this.objects[i].height, mapStartX, mapStartY, widthInPixels, heightInPixels))
			this.objects[i].draw(context, this.objects[i].x - mapStartX, this.objects[i].y - mapStartY);
}

GameMap.prototype.update = function(gameTime) {

	var elapsedTime = gameTime - this.lastUpdate;
	
	if(gameTime > this.nextWaterRaise) {
		this.nextWaterRaise += this.msToRaiseWaterLevel;
		this.waterLevel++;
		var waterTileY = this.height - 1 - this.waterLevel;
		if(waterTileY >= 0 && waterTileY < this.height)
			for(var x = 1; x < this.width - 1; x++) {
				this.tiles[x][waterTileY] = 5;
				this.collision[x][waterTileY] = 3;
			}
	}
	
	if(this.player.y < 800)
		this.generate(12);
	
	// Handle movement
	for(var i = 0; i < this.objects.length; i++) {
		var obj = this.objects[i];
		if(obj.y > this.heightInPixels) {
			obj.state = -1;
			continue;
		}
		if(Math.abs(this.player.y - obj.y) < this.distanceToUpdate) {
			obj.lastX = obj.x;
			obj.lastY = obj.y;
			if(obj.affectedByGravity)
				obj.velocityY += this.gravityPerMs * elapsedTime;
			if(obj.velocityY > obj.maxVelocityY)
				obj.velocityY = obj.maxVelocityY;
			if(obj.velocityX > obj.maxVelocityX)
				obj.velocityX = obj.maxVelocityX;
			else if(obj.velocityX < -obj.maxVelocityX)
				obj.velocityX = -obj.maxVelocityX;
			var xToMove = obj.velocityX * elapsedTime;
			var yToMove = obj.velocityY * elapsedTime;

			// MOVE X
			if(xToMove != 0) {
				var newX = obj.x + xToMove;
				var newY = obj.y;
				var tileY1 = parseInt(newY / this.tileHeight);
				var tileY2 = parseInt((newY + obj.height) / this.tileHeight);
				if(tileY1 < 0 || tileY2 >= this.height)
					continue;
				var tileX = 0;
				if (xToMove > 0) {
					tileX = parseInt((newX + obj.width) / this.tileWidth);
				}
				else { // == 0 was already checked up there
					tileX = parseInt(newX / this.tileWidth);
				}
				if (tileX < 0 || tileX >= this.width)
					continue;
				var newX = xToMove;
				
				for (var y = tileY1; y <= tileY2; y++) {
					if (this.collision[tileX][y] == 1) {
						if (xToMove > 0) {
							newX = (tileX * this.tileWidth) - parseInt(obj.x + obj.width) - 1;
							obj.tileCollide(1, 1, gameTime);
						}
						else {
							newX = ((tileX + 1) * this.tileWidth) - parseInt(obj.x);
							// don't have to add or subtract 1 because object will already be placed on the position of the tile at right
							// thus there is no way for it to collide
							obj.tileCollide(3, 1, gameTime);
						}
						obj.velocityX = 0;
						continue;
					}
					if (this.collision[tileX][y] == 3) {
						if (xToMove > 0) {
							obj.tileCollide(1, 3, gameTime);
						}
						else {
							obj.tileCollide(3, 3, gameTime);
						}
						continue;
					}
				}
				xToMove = newX;
			}
			
			// MOVE Y
			if(yToMove != 0) {
				var newX = obj.x + xToMove;
				var newY = obj.y + yToMove;
				var tileX1 = parseInt(newX / this.tileWidth);
				var tileX2 = parseInt((newX + obj.width) / this.tileWidth);
				if(tileX1 < 0 || tileX2 >= this.width)
					continue;
				var tileY = 0;
				if (yToMove > 0) {
					tileY = parseInt((newY + obj.height) / this.tileHeight);
				}
				else { // == 0 was already checked up there
					tileY = parseInt(newY / this.tileHeight);
				}
				if (tileY < 0 || tileY >= this.height)
					continue;
				var newY = yToMove;
				
				for (var x = tileX1; x <= tileX2; x++) {
					if (this.collision[x][tileY] == 1) {
						if (yToMove > 0) {
							newY = (tileY * this.tileHeight) - parseInt(obj.y + obj.height) - 1;
							obj.tileCollide(2, 1, gameTime);
							obj.velocityY = -obj.bounceFactor * obj.velocityY;
						}
						else {
							newY = ((tileY + 1) * this.tileHeight) - obj.y;
							// don't have to add or subtract 1 because object will already be placed on the position of the tile at right
							// thus there is no way for it to collide
							obj.tileCollide(0, 1, gameTime);
							obj.velocityY = 0;
						}
						continue;
					}
					else if (this.collision[x][tileY] == 2)
					{
						if (!obj.canFallThrough && yToMove > 0 && (obj.y + obj.height) <= tileY * this.tileHeight)
						{
							newY = (tileY * this.tileHeight) - parseInt(obj.y + obj.height) - 1;
							obj.tileCollide(2, 2, gameTime);
							obj.velocityY = 0;
						}
						continue;
					}
					else if (this.collision[x][tileY] == 3)
					{
						if (yToMove > 0 && (obj.y + obj.height) <= tileY * this.tileHeight)
						{
							newY = (tileY * this.tileHeight) - parseInt(obj.y + obj.height) - 1;
							obj.tileCollide(2, 3, gameTime);
							obj.velocityY = 0;
						}
						continue;
					}
				}
				yToMove = newY;
			}
			
			obj.x += xToMove;
			obj.y += yToMove;
		}
	}
	
	// Handle objects
	for(var i = 0; i < this.objects.length; i++) {
		var obj = this.objects[i];
		
		if(Math.abs(this.player.y - obj.y) < this.distanceToUpdate) {
			// Check collision with other objects
			for(var j = i + 1; j < this.objects.length; j++) {
				var obj2 = this.objects[j];
				if(obj.state == -1)
					break;
				if(obj2.state == -1)
					continue;
				if(checkRectIntersection(obj.x, obj.y, obj.width, obj.height, obj2.x, obj2.y, obj2.width, obj2.height)) {
					obj.collide(obj2, gameTime);
					obj2.collide(obj, gameTime);
				}
			}
			
			obj.update(gameTime);
		}
		
		if(obj.state == -1) {
			this.objectsToRemove.push(i);
		}
	}
	
	// Delete unnecessary objects
	for(var i = this.objectsToRemove.length - 1; i >= 0; i--) {
		this.objects.splice(this.objectsToRemove[i], 1);
	}
	
	this.objectsToRemove = Array();
	
	this.lastUpdate = gameTime;
}