// PlayingState

function PlayingState() {
	this.map = null;
	
	this.inventory = false;
	this.moneyBag = ASSET_MANAGER.getAsset("moneybag");
	this.playerInventory = ASSET_MANAGER.getAsset("player_inventory");
	this.inventorySlot = new Animation(0, ANIMATION_SET_REPO.get("inventory_slot"));
	this.inventoryEquipped = new Animation(0, ANIMATION_SET_REPO.get("inventory_equipped"));
	this.selectedItem = 0;
	this.selectedInventory = 0;
	this.seller = null;
	
	this.totalPausedTime = 0;
	this.lastPause = 0;
	
	// Variables used to draw
	this.cam = null;
}

PlayingState.prototype = new GameState();

PlayingState.prototype.onStart = function() {
	this.map = new GameMap(this.game);
	this.player = this.map.player;
	this.cam = new MapCamera(this.map);
	this.cam.x = 0;
	this.cam.y = 0;
	this.cam.width = 600;
	this.cam.height = 600;
	ASSET_MANAGER.getAsset("music1").playLoop();
}

PlayingState.prototype.update = function(gameTime) {
	if(this.inventory) {
		if(currentKeys[KEY_LEFT] && !lastKeys[KEY_LEFT]) {
			if(this.selectedItem % 5 == 0) {
				this.selectedItem += 5;
				if(this.seller != null) {
					if(this.selectedInventory == 0)
						this.selectedInventory = 1;
					else
						this.selectedInventory = 0;
				}
			}
			this.selectedItem--;
		}
		else if(currentKeys[KEY_RIGHT] && !lastKeys[KEY_RIGHT]) {
			if(this.selectedItem % 5 == 4) {
				this.selectedItem -= 5;
				if(this.seller != null) {
					if(this.selectedInventory == 0)
						this.selectedInventory = 1;
					else
						this.selectedInventory = 0;
				}
			}
			this.selectedItem++;
		}
		else if(currentKeys[KEY_UP] && !lastKeys[KEY_UP]) {
			this.selectedItem -= 5;
		}
		else if(currentKeys[KEY_DOWN] && !lastKeys[KEY_DOWN]) {
			this.selectedItem += 5;
		}
		// Use or Equip Item, or Buy
		else if(currentKeys[KEY_C] && !lastKeys[KEY_C]) {
			if(this.selectedInventory == 0) {
				var items = this.map.player.items;
				if(items[this.selectedItem].template.action != null)
					items[this.selectedItem].template.action(items[this.selectedItem]);
				else if(items[this.selectedItem].template instanceof Shield)
					this.map.player.shield = items[this.selectedItem];
				else if(items[this.selectedItem].template instanceof Weapon)
					this.map.player.weapon = items[this.selectedItem];
				
				if(items[this.selectedItem].template.isConsumable)
					items.splice(this.selectedItem, 1);
			}
			else {
				var items = this.seller.items;
				if(this.map.player.money >= items[this.selectedItem].template.buyingPrice && this.map.player.items.length < this.map.player.inventorySize) {
					ASSET_MANAGER.getAsset("potion_sound").play();
					this.map.player.money -= items[this.selectedItem].template.buyingPrice;
					items[this.selectedItem].owner = this.map.player;
					var item = items.splice(this.selectedItem, 1);
					this.map.player.items.push(item[0]);
				}
			}
		}
		// Throw item away or sell it
		else if(currentKeys[KEY_X] && !lastKeys[KEY_X] && this.selectedItem < this.map.player.items.length) {
			if(this.seller == null) {
				var items = this.map.player.items;
				if(items[this.selectedItem] != this.map.player.shield && items[this.selectedItem] != this.map.player.weapon) {
					ASSET_MANAGER.getAsset("chest_sound").play();
					var available = this.map.lastUpdate + 1000;
					var item = items[this.selectedItem].template.createCollectable(available);
					item.velocityX = Math.random() * 0.24 - 0.12;
					item.velocityY = Math.random() * -0.1 - 0.05;
					item.x = this.map.player.x + this.map.player.width / 2; item.y = this.map.player.y;
					this.map.addObject(item);
					items.splice(this.selectedItem, 1);
				}
			}
			else if(this.selectedInventory == 0) {
				var items = this.map.player.items;
				if(items[this.selectedItem] != this.map.player.weapon && items[this.selectedItem] != this.map.player.shield && this.seller.items.length < this.seller.inventorySize) {
					ASSET_MANAGER.getAsset("chest_sound").play();
					this.map.player.money += items[this.selectedItem].template.sellingPrice;
					items[this.selectedItem].owner = this.seller;
					var item = items.splice(this.selectedItem, 1);
					this.seller.items.push(item[0]);
				}
			}
		}

		if(this.selectedItem < 0)
			this.selectedItem += 25;
		else if(this.selectedItem > 24)
			this.selectedItem -= 25;
	}
	else {
		this.map.update(this.stateTime - this.totalPausedTime);
		this.cam.update();
	}
	if(currentKeys[KEY_S] && !lastKeys[KEY_S] && !this.map.player.dead) {
		if(this.inventory) {
			this.inventory = false;
			this.totalPausedTime += gameTime - this.lastPause;
		}
		else {
			this.inventory = true;
			this.selectedInventory = 0;
			this.selectedItem = 0;
			this.lastPause = gameTime;
			if(this.map.player.seller != null && checkRectIntersection(this.map.player.x, this.map.player.y, this.map.player.width, this.map.player.height, this.map.player.seller.x, this.map.player.seller.y, this.map.player.seller.width, this.map.player.seller.height))
				this.seller = this.map.player.seller;
			else
				this.seller = null;
		}
	}
}

// Draw Inventory
PlayingState.prototype.drawItems = function(context, items, x, y, width, height, selected, gameTime) {
	for(var b = 0; b < height; b++) {
		for(var a = 0; a < width; a++) {
			var currentItem = b * width + a;
			this.inventorySlot.draw(context, x + a * 36, y + b * 36, false, gameTime);
			if(currentItem < items.length) {
				items[currentItem].template.icon.draw(context, x + a * 36 + 2, y + b * 36 + 2, false, gameTime);
				if(items[currentItem] == this.map.player.shield || items[currentItem] == this.map.player.weapon)
					this.inventoryEquipped.draw(context, x + a * 36 + 2, y + b * 36 + 2, false, gameTime);
			}				
		}
	}
	if(selected == null)
		return;
	context.fillStyle = "rgba(255, 0, 0, 0.2)";
	context.fillRect(x + (selected % width) * 36, y + parseInt(selected / width) * 36, 36, 36);
}

PlayingState.prototype.draw = function(context, gameTime) {
	context.clearRect(0, 0, this.game.CANVAS_WIDTH, this.game.CANVAS_HEIGHT);

	this.cam.x = 0;
	this.cam.y = this.player.y - 314;
	this.cam.draw(context, 0, 0, this.game.CANVAS_WIDTH, this.game.CANVAS_HEIGHT);
	
	if(this.inventory) {
		context.fillStyle = "rgba(150, 150, 200, 0.8)";
		context.fillRect(10, 10, 580, 580);
		// Draw player and current equipments
		context.drawImage(this.playerInventory, 260, 28);
		//this.inventorySlot.draw(context, 220, 32, false, gameTime);
		this.map.player.weapon.template.icon.draw(context, 226, 34, false, gameTime);
		//this.inventorySlot.draw(context, 338, 32, false, gameTime);
		this.map.player.shield.template.icon.draw(context, 344, 34, false, gameTime);
	
		context.drawImage(this.moneyBag, 430, 30);
		context.fillStyle = "yellow";
		context.textAlign = "center";
		context.fillText(this.map.player.money, 506, 40);
		
		if(this.seller == null) {
			this.map.player.animation.draw(context, /* 210 + 90 */ 300 - this.map.player.width / 2, 176, false, gameTime);
			this.drawItems(context, this.map.player.items, 210, 216, 5, 5, this.selectedItem, gameTime);
		}
		else {
			var playerSelectedItem = null;
			var sellerSelectedItem = null;
			if(this.selectedInventory == 0)
				playerSelectedItem = this.selectedItem;
			else
				sellerSelectedItem = this.selectedItem;
			this.map.player.animation.draw(context, 130 - this.map.player.width / 2, 176, false, gameTime);
			this.drawItems(context, this.map.player.items, 40, 216, 5, 5, playerSelectedItem, gameTime);
			this.seller.draw(context, 470 - this.seller.width / 2, 176, false, gameTime);
			this.drawItems(context, this.seller.items, 380, 216, 5, 5, sellerSelectedItem, gameTime);
		}

		context.fillStyle = "#000";
		context.fillRect(64, 400, 472, 184);
		var item = this.selectedInventory == 0 ? this.map.player.items[this.selectedItem] : this.seller.items[this.selectedItem];
		if(item != null) {
			context.fillStyle = "#FFF";
			context.font = "16px SilkScreenRegular";
			context.textBaseline = "top";
			context.textAlign = "left";
			if(item.template instanceof Weapon) {
				if(item == this.map.player.weapon) {
					context.fillText(item.template.name + " (EQUIPPED)", 74, 410);
					context.fillText("VALUE: " + item.template.sellingPrice + "; ATT: " + item.template.attack, 74, 426);
				}
				else if(this.seller == null) {
					context.fillText(item.template.name + " (C: EQUIP, X: DISCARD)", 74, 410);
					context.fillText("VALUE: " + item.template.sellingPrice + "; ATT: " + item.template.attack, 74, 426);
				}
				else {
					if(this.selectedInventory == 0) {
						context.fillText(item.template.name + " (C: EQUIP, X: SELL)", 74, 410);
						context.fillText("VALUE: " + item.template.sellingPrice + "; ATT: " + item.template.attack, 74, 426);
					}
					else {
						context.fillText(item.template.name + " (C: BUY)", 74, 410);
						context.fillText("PRICE: " + item.template.buyingPrice + "; ATT: " + item.template.attack, 74, 426);
					}
				}
			}
			else if(item.template instanceof Shield) {
				if(item == this.map.player.shield) {
					context.fillText(item.template.name + " (EQUIPPED)", 74, 410);
					context.fillText("VALUE: " + item.template.sellingPrice + "; DEF: " + item.template.defense, 74, 426);
				}
				else if(this.seller == null) {
					context.fillText(item.template.name + " (C: EQUIP, X: DISCARD)", 74, 410);
					context.fillText("VALUE: " + item.template.sellingPrice + "; DEF: " + item.template.defense, 74, 426);
				}
				else {
					if(this.selectedInventory == 0) {
						context.fillText(item.template.name + " (C: EQUIP, X: SELL)", 74, 410);
						context.fillText("VALUE: " + item.template.sellingPrice + "; DEF: " + item.template.defense, 74, 426);
					}
					else {
						context.fillText(item.template.name + " (C: BUY)", 74, 410);
						context.fillText("PRICE: " + item.template.buyingPrice + "; DEF: " + item.template.defense, 74, 426);
					}
				}
			}
			else {
				if(this.seller == null) {
					context.fillText(item.template.name + " (C: USE, X: DISCARD)", 74, 410);
					context.fillText("VALUE: " + item.template.sellingPrice, 74, 426);
				}
				else {
					if(this.selectedInventory == 0) {
						context.fillText(item.template.name + " (C: USE, X: SELL)", 74, 410);
						context.fillText("VALUE: " + item.template.sellingPrice, 74, 426);
					}
					else {
						context.fillText(item.template.name + " (C: BUY)", 74, 410);
						context.fillText("PRICE: " + item.template.buyingPrice, 74, 426);
					}
				}
			}
			drawMultilineText(context, item.template.description, 16, 74, 458, 452, 106, 0);
		}
	}
}