function Game() {
	this.CANVAS_WIDTH = 600;
	this.CANVAS_HEIGHT = 600;
	this.TARGET_FPS = 60;
	this.FRAME_TIME = 1000 / this.TARGET_FPS;
	this.lastSystemTime = 0;
	this.gameTime = 0;
	this.isPaused = false;
	this.stateManager = new GameStateManager(this);
	this.bestScore = 0;
}

Game.prototype.init = function (context) {
	// Load assets and then start canvas
	ASSET_MANAGER.queueDownloadableImage("res/images/titlescreen.png", "titlescreen");
	ASSET_MANAGER.queueDownloadableImage("res/images/background.png", "background");
	ASSET_MANAGER.queueDownloadableImage("res/images/tiles.png", "tiles");
	ASSET_MANAGER.queueDownloadableImage("res/images/player.png", "player");
	ASSET_MANAGER.queueDownloadableImage("res/images/rat.png", "rat");
	ASSET_MANAGER.queueDownloadableImage("res/images/goblin.png", "goblin");
	ASSET_MANAGER.queueDownloadableImage("res/images/ogre.png", "ogre");
	ASSET_MANAGER.queueDownloadableImage("res/images/troll.png", "troll");
	ASSET_MANAGER.queueDownloadableImage("res/images/chest.png", "chest");
	ASSET_MANAGER.queueDownloadableImage("res/images/money.png", "money");
	ASSET_MANAGER.queueDownloadableImage("res/images/collectables.png", "collectables");
	ASSET_MANAGER.queueDownloadableImage("res/images/moneybag.png", "moneybag");
	ASSET_MANAGER.queueDownloadableImage("res/images/inventory.png", "inventory");
	ASSET_MANAGER.queueDownloadableImage("res/images/player_inventory.png", "player_inventory");
	ASSET_MANAGER.queueDownloadableImage("res/images/seller.png", "seller");
	ASSET_MANAGER.queueDownloadableImage("res/images/equips.png", "equips");
	
	ASSET_MANAGER.queueDownloadableAudio("res/audio/money.wav", "money_sound");
	ASSET_MANAGER.queueDownloadableAudio("res/audio/potion.wav", "potion_sound");
	ASSET_MANAGER.queueDownloadableAudio("res/audio/jump.wav", "jump_sound");
	ASSET_MANAGER.queueDownloadableAudio("res/audio/hit.wav", "hit_sound");
	ASSET_MANAGER.queueDownloadableAudio("res/audio/chest.wav", "chest_sound");
	ASSET_MANAGER.queueDownloadableAudio("res/audio/levelup.wav", "levelup_sound");
	ASSET_MANAGER.queueDownloadableAudio("res/audio/music1.ogg", "music1");
	
	// Reference to use in the anonymous functions
	var game = this;

	// Draw the loading screen
	var loading = setInterval(function() {
		if(ASSET_MANAGER.loadedResources >= ASSET_MANAGER.getTotal()) {
			clearInterval(loading);
			return;
		}
		context.clearRect(0, 0, game.CANVAS_WIDTH, game.CANVAS_HEIGHT);
		context.fillStyle = "#FFFFFF";
		context.font = "bold 32px sans-serif";
		context.textAlign = "center";
		if(ASSET_MANAGER.errorResources == 0) {
			context.fillText("LOADING ASSETS: " + ASSET_MANAGER.loadedResources + " of " + ASSET_MANAGER.getTotal(), 300, 200);
			var percentLoaded = ASSET_MANAGER.loadedResources / ASSET_MANAGER.getTotal();
			var percentLoadedBar = percentLoaded * 200;
			context.fillRect(200, 300, percentLoadedBar, 30);
			context.fillStyle = "#FF0000";
			context.fillRect(200 + percentLoadedBar, 300, 200 - percentLoadedBar, 30);
		}
		else
			context.fillText("LOADING ERROR.", 250, 200);
	}, 200);

	// EVERYTHING IS LOADED :D
	ASSET_MANAGER.downloadAssets(function() {
		if(ASSET_MANAGER.errorResources > 0) {
			alert("Loading ERROR");
			return;
		}
		
		createAnimations();
		createItems();
		
		
		var state = new MenuState();
		game.stateManager.changeState(state, 0);
		
		// MAIN LOOP
		game.startGameTime();
		setInterval(function() {
			game.mainLoop(context);
		}, game.FRAME_TIME);
	});
}
		
Game.prototype.getGameTime = function() {
	var currentSystemTime = Date.now();
	if(!this.isPaused)
		this.gameTime += (currentSystemTime - this.lastSystemTime);
	this.lastSystemTime = currentSystemTime;
	return this.gameTime;
}
		
Game.prototype.startGameTime = function() {
	this.gameTime = 0;
	this.lastSystemTime = Date.now();
}

function copyPressedKeys(obj1, obj2) {
	obj1[KEY_LEFT] = obj2[KEY_LEFT];
	obj1[KEY_DOWN] = obj2[KEY_DOWN];
	obj1[KEY_RIGHT] = obj2[KEY_RIGHT];
	obj1[KEY_UP] = obj2[KEY_UP];
	obj1[KEY_X] = obj2[KEY_X];
	obj1[KEY_C] = obj2[KEY_C];
	obj1[KEY_S] = obj2[KEY_S];
}

var currentKeys = {};
var lastKeys = {};
Game.prototype.mainLoop = function(context) {
	var gameTime = this.stateManager.state.lastUpdate;
	var timeToUpdate = this.getGameTime() - gameTime;
	//console.log(timeToUpdate);
	while(timeToUpdate >= this.FRAME_TIME) {
		gameTime += this.FRAME_TIME;
		timeToUpdate -= this.FRAME_TIME;
		
		//currentKeys = keyPressed.slice();
		copyPressedKeys(currentKeys, keyPressed);
		
		this.stateManager.updateAndDraw(context, parseInt(gameTime));
		
		//lastKeys = currentKeys.slice();
		copyPressedKeys(lastKeys, currentKeys);
	}
}

function createAnimations() {
	// Create Animation Sets
		
	// PLAYER
	var tempAnim = new AnimationSet(48, 48);
	tempAnim.setFrameTime(0);
	tempAnim.setOffset(15, 15, 15);
	tempAnim.addFrames(ASSET_MANAGER.getAsset("player"), 0, 0, 1);
	ANIMATION_SET_REPO.add("player_standing", tempAnim);
	
	tempAnim = new AnimationSet(48, 48);
	tempAnim.setFrameTime(100);
	tempAnim.setOffset(15, 15, 15);
	tempAnim.addFrames(ASSET_MANAGER.getAsset("player"), 0, 48, 3);
	tempAnim.addFrames(ASSET_MANAGER.getAsset("player"), 48, 48, 1);
	ANIMATION_SET_REPO.add("player_running", tempAnim);
	
	tempAnim = new AnimationSet(48, 48);
	tempAnim.setFrameTime(0);
	tempAnim.setOffset(15, 15, 15);
	tempAnim.addFrames(ASSET_MANAGER.getAsset("player"), 0, 96, 1);
	ANIMATION_SET_REPO.add("player_blocking", tempAnim);
	
	tempAnim = new AnimationSet(48, 48);
	tempAnim.setFrameTime(100);
	tempAnim.setOffset(15, 15, 15);
	tempAnim.addFrames(ASSET_MANAGER.getAsset("player"), 0, 144, 3);
	ANIMATION_SET_REPO.add("player_attacking", tempAnim);
	
	tempAnim = new AnimationSet(48, 48);
	tempAnim.setFrameTime(100);
	tempAnim.setOffset(15, 15, 15);
	tempAnim.addFrames(ASSET_MANAGER.getAsset("player"), 0, 192, 1);
	ANIMATION_SET_REPO.add("player_jumping", tempAnim);
	
	tempAnim = new AnimationSet(48, 48);
	tempAnim.setFrameTime(100);
	tempAnim.setOffset(15, 15, 15);
	tempAnim.addFrames(ASSET_MANAGER.getAsset("player"), 0, 240, 3);
	tempAnim.addFrames(ASSET_MANAGER.getAsset("player"), 48, 240, 1);
	ANIMATION_SET_REPO.add("player_falling", tempAnim);
	
	// SELLER
	tempAnim = new AnimationSet(46, 34);
	tempAnim.setFrameTime(3000);
	tempAnim.addFrames(ASSET_MANAGER.getAsset("seller"), 0, 0, 2);
	ANIMATION_SET_REPO.add("seller", tempAnim);
	
	// RAT
	tempAnim = new AnimationSet(46, 24);
	tempAnim.setFrameTime(100);
	tempAnim.setOffset(12, 4, 30);
	tempAnim.addFrames(ASSET_MANAGER.getAsset("rat"), 0, 0, 2);
	ANIMATION_SET_REPO.add("rat_standing", tempAnim);
	
	tempAnim = new AnimationSet(46, 24);
	tempAnim.setFrameTime(100);
	tempAnim.setOffset(12, 4, 30);
	tempAnim.addFrames(ASSET_MANAGER.getAsset("rat"), 0, 24, 3);
	tempAnim.addFrames(ASSET_MANAGER.getAsset("rat"), 46, 24, 1);
	ANIMATION_SET_REPO.add("rat_running", tempAnim);
	
	tempAnim = new AnimationSet(46, 24);
	tempAnim.setFrameTime(100);
	tempAnim.setOffset(12, 4, 30);
	tempAnim.addFrames(ASSET_MANAGER.getAsset("rat"), 0, 48, 3);
	tempAnim.addFrames(ASSET_MANAGER.getAsset("rat"), 46, 48, 1);
	ANIMATION_SET_REPO.add("rat_attacking", tempAnim);
	
	// GOBLIN
	tempAnim = new AnimationSet(60, 40);
	tempAnim.setFrameTime(200);
	tempAnim.setOffset(12, 10, 15);
	tempAnim.addFrames(ASSET_MANAGER.getAsset("goblin"), 0, 0, 2);
	ANIMATION_SET_REPO.add("goblin_standing", tempAnim);
	
	tempAnim = new AnimationSet(60, 40);
	tempAnim.setFrameTime(100);
	tempAnim.setOffset(13, 10, 15);
	tempAnim.addFrames(ASSET_MANAGER.getAsset("goblin"), 0, 40, 3);
	tempAnim.addFrames(ASSET_MANAGER.getAsset("goblin"), 60, 40, 1);
	ANIMATION_SET_REPO.add("goblin_running", tempAnim);
	
	tempAnim = new AnimationSet(60, 40);
	tempAnim.setFrameTime(100);
	tempAnim.setOffset(12, 10, 15);
	tempAnim.addFrames(ASSET_MANAGER.getAsset("goblin"), 0, 80, 3);
	ANIMATION_SET_REPO.add("goblin_attacking", tempAnim);
	
	// OGRE
	tempAnim = new AnimationSet(48, 48);
	tempAnim.setFrameTime(200);
	tempAnim.setOffset(13, 5, 22);
	tempAnim.addFrames(ASSET_MANAGER.getAsset("ogre"), 0, 0, 2);
	ANIMATION_SET_REPO.add("ogre_standing", tempAnim);
	
	tempAnim = new AnimationSet(48, 48);
	tempAnim.setFrameTime(100);
	tempAnim.setOffset(13, 5, 22);
	tempAnim.addFrames(ASSET_MANAGER.getAsset("ogre"), 0, 48, 3);
	tempAnim.addFrames(ASSET_MANAGER.getAsset("ogre"), 48, 48, 1);
	ANIMATION_SET_REPO.add("ogre_running", tempAnim);
	
	tempAnim = new AnimationSet(48, 48);
	tempAnim.setFrameTime(100);
	tempAnim.setOffset(5, 5, 22);
	tempAnim.addFrames(ASSET_MANAGER.getAsset("ogre"), 0, 96, 3);
	ANIMATION_SET_REPO.add("ogre_attacking", tempAnim);
	
	// TROLL
	tempAnim = new AnimationSet(64, 64);
	tempAnim.setFrameTime(200);
	tempAnim.setOffset(6, 8, 44);
	tempAnim.addFrames(ASSET_MANAGER.getAsset("troll"), 0, 0, 2);
	ANIMATION_SET_REPO.add("troll_standing", tempAnim);
	
	tempAnim = new AnimationSet(64, 64);
	tempAnim.setFrameTime(200);
	tempAnim.setOffset(6, 8, 44);
	tempAnim.addFrames(ASSET_MANAGER.getAsset("troll"), 0, 64, 4);
	ANIMATION_SET_REPO.add("troll_running", tempAnim);
	
	tempAnim = new AnimationSet(64, 64);
	tempAnim.setFrameTime(50);
	tempAnim.setOffset(4, 8, 44);
	tempAnim.addFrames(ASSET_MANAGER.getAsset("troll"), 0, 128, 4);
	tempAnim.addFrames(ASSET_MANAGER.getAsset("troll"), 128, 128, 1);
	tempAnim.addFrames(ASSET_MANAGER.getAsset("troll"), 64, 128, 1);
	tempAnim.addFrames(ASSET_MANAGER.getAsset("troll"), 0, 128, 1);
	ANIMATION_SET_REPO.add("troll_attacking", tempAnim);
	
	// CHEST
	tempAnim = new AnimationSet(34, 24);
	tempAnim.setFrameTime(0);
	tempAnim.addFrames(ASSET_MANAGER.getAsset("chest"), 0, 0, 1);
	ANIMATION_SET_REPO.add("chest_closed", tempAnim);

	tempAnim = new AnimationSet(34, 24);
	tempAnim.setFrameTime(0);
	tempAnim.addFrames(ASSET_MANAGER.getAsset("chest"), 34, 0, 1);
	ANIMATION_SET_REPO.add("chest_open", tempAnim);
	
	// COLLECTABLES
	tempAnim = new AnimationSet(14, 18);
	tempAnim.setFrameTime(0);
	tempAnim.addFrames(ASSET_MANAGER.getAsset("collectables"), 0, 0, 1);
	ANIMATION_SET_REPO.add("health_potion", tempAnim);

	tempAnim = new AnimationSet(14, 18);
	tempAnim.setFrameTime(0);
	tempAnim.addFrames(ASSET_MANAGER.getAsset("collectables"), 14, 0, 1);
	ANIMATION_SET_REPO.add("beer", tempAnim);

	tempAnim = new AnimationSet(14, 18);
	tempAnim.setFrameTime(0);
	tempAnim.addFrames(ASSET_MANAGER.getAsset("collectables"), 28, 0, 1);
	ANIMATION_SET_REPO.add("pick", tempAnim);

	tempAnim = new AnimationSet(14, 18);
	tempAnim.setFrameTime(0);
	tempAnim.addFrames(ASSET_MANAGER.getAsset("collectables"), 42, 0, 1);
	ANIMATION_SET_REPO.add("shield", tempAnim);
	
	// MONEY 
	tempAnim = new AnimationSet(12, 12);
	tempAnim.setFrameTime(125);
	tempAnim.addFrames(ASSET_MANAGER.getAsset("money"), 0, 0, 4);
	ANIMATION_SET_REPO.add("silver_coin", tempAnim);
	
	tempAnim = new AnimationSet(12, 12);
	tempAnim.setFrameTime(125);
	tempAnim.addFrames(ASSET_MANAGER.getAsset("money"), 0, 12, 4);
	ANIMATION_SET_REPO.add("gold_coin", tempAnim);
	
	tempAnim = new AnimationSet(12, 12);
	tempAnim.setFrameTime(125);
	tempAnim.addFrames(ASSET_MANAGER.getAsset("money"), 0, 24, 4);
	ANIMATION_SET_REPO.add("ruby", tempAnim);
	
	tempAnim = new AnimationSet(12, 12);
	tempAnim.setFrameTime(125);
	tempAnim.addFrames(ASSET_MANAGER.getAsset("money"), 0, 36, 4);
	ANIMATION_SET_REPO.add("emerald", tempAnim);
	
	// INVENTORY
	tempAnim = new AnimationSet(36, 36);
	tempAnim.setFrameTime(0);
	tempAnim.addFrames(ASSET_MANAGER.getAsset("inventory"), 0, 0, 1);
	ANIMATION_SET_REPO.add("inventory_slot", tempAnim);
	tempAnim = new AnimationSet(36, 36);
	tempAnim.setFrameTime(0);
	tempAnim.addFrames(ASSET_MANAGER.getAsset("inventory"), 36, 0, 1);
	ANIMATION_SET_REPO.add("inventory_equipped", tempAnim);
	
	
	// WEAPONS
	tempAnim = new AnimationSet(32, 32);
	tempAnim.setFrameTime(0);
	tempAnim.addFrames(ASSET_MANAGER.getAsset("equips"), 0, 0, 1);
	ANIMATION_SET_REPO.add("dodgy_pick", tempAnim);
	
	tempAnim = new AnimationSet(32, 32);
	tempAnim.setFrameTime(0);
	tempAnim.addFrames(ASSET_MANAGER.getAsset("equips"), 32, 0, 1);
	ANIMATION_SET_REPO.add("steel_pick", tempAnim);
	
	tempAnim = new AnimationSet(32, 32);
	tempAnim.setFrameTime(0);
	tempAnim.addFrames(ASSET_MANAGER.getAsset("equips"), 64, 0, 1);
	ANIMATION_SET_REPO.add("gilded_pick", tempAnim);
	
	tempAnim = new AnimationSet(32, 32);
	tempAnim.setFrameTime(0);
	tempAnim.addFrames(ASSET_MANAGER.getAsset("equips"), 96, 0, 1);
	ANIMATION_SET_REPO.add("golden_pick", tempAnim);
	
	tempAnim = new AnimationSet(32, 32);
	tempAnim.setFrameTime(100);
	tempAnim.addFrames(ASSET_MANAGER.getAsset("equips"), 128, 0, 2);
	ANIMATION_SET_REPO.add("fire_pick", tempAnim);
	
	tempAnim = new AnimationSet(32, 32);
	tempAnim.setFrameTime(0);
	tempAnim.addFrames(ASSET_MANAGER.getAsset("equips"), 192, 0, 1);
	ANIMATION_SET_REPO.add("emerald_pick", tempAnim);
	
	tempAnim = new AnimationSet(32, 32);
	tempAnim.setFrameTime(0);
	tempAnim.addFrames(ASSET_MANAGER.getAsset("equips"), 224, 0, 1);
	ANIMATION_SET_REPO.add("ruby_pick", tempAnim);
	
	// SHIELDS
	tempAnim = new AnimationSet(32, 32);
	tempAnim.setFrameTime(0);
	tempAnim.addFrames(ASSET_MANAGER.getAsset("equips"), 0, 32, 1);
	ANIMATION_SET_REPO.add("wooden_shield", tempAnim);
	
	tempAnim = new AnimationSet(32, 32);
	tempAnim.setFrameTime(0);
	tempAnim.addFrames(ASSET_MANAGER.getAsset("equips"), 32, 32, 1);
	ANIMATION_SET_REPO.add("steel_shield", tempAnim);
	
	tempAnim = new AnimationSet(32, 32);
	tempAnim.setFrameTime(0);
	tempAnim.addFrames(ASSET_MANAGER.getAsset("equips"), 64, 32, 1);
	ANIMATION_SET_REPO.add("bone_shield", tempAnim);
	
	tempAnim = new AnimationSet(32, 32);
	tempAnim.setFrameTime(0);
	tempAnim.addFrames(ASSET_MANAGER.getAsset("equips"), 96, 32, 1);
	ANIMATION_SET_REPO.add("oaken_shield", tempAnim);
	
	tempAnim = new AnimationSet(32, 32);
	tempAnim.setFrameTime(0);
	tempAnim.addFrames(ASSET_MANAGER.getAsset("equips"), 128, 32, 1);
	ANIMATION_SET_REPO.add("golden_shield", tempAnim);

	tempAnim = new AnimationSet(32, 32);
	tempAnim.setFrameTime(0);
	tempAnim.addFrames(ASSET_MANAGER.getAsset("equips"), 160, 32, 1);
	ANIMATION_SET_REPO.add("diamond_shield", tempAnim);
	
	// OTHER
	tempAnim = new AnimationSet(32, 32);
	tempAnim.setFrameTime(0);
	tempAnim.addFrames(ASSET_MANAGER.getAsset("equips"), 192, 32, 1);
	ANIMATION_SET_REPO.add("health_potion_icon", tempAnim);
	
	tempAnim = new AnimationSet(32, 32);
	tempAnim.setFrameTime(0);
	tempAnim.addFrames(ASSET_MANAGER.getAsset("equips"), 224, 32, 1);
	ANIMATION_SET_REPO.add("beer_icon", tempAnim);
}

function createItems() {
	var tempItem = new ItemTemplate();
	tempItem.name = "Health Potion";
	tempItem.description = "This is not your regular beer, but feels damn good.";
	tempItem.icon = new Animation(0, ANIMATION_SET_REPO.get("health_potion_icon"));
	tempItem.isConsumable = true;
	tempItem.sellingPrice = 30;
	tempItem.buyingPrice = 100;
	// I know, this could be a non anonymous function to save some memory but wouldn't make much of a difference
	tempItem.action = function(item) { ASSET_MANAGER.getAsset("potion_sound").play(); item.owner.setHealth(item.owner.health + 30); };
	tempItem.createCollectable = function(available) { return new HealthPotion(available); };
	ITEMS_REPO.add("health_potion", tempItem);
	
	var tempItem = new ItemTemplate();
	tempItem.name = "Beer";
	tempItem.description = "Refreshing!";
	tempItem.icon = new Animation(0, ANIMATION_SET_REPO.get("beer_icon"));
	tempItem.isConsumable = true;
	tempItem.sellingPrice = 25;
	tempItem.buyingPrice = 150;
	tempItem.action = function(item) { ASSET_MANAGER.getAsset("potion_sound").play(); item.owner.setHealth(item.owner.health + 50); item.owner.drunkTime = item.owner.drunkTime < item.owner.lastUpdate ? item.owner.lastUpdate + 5000 : item.owner.drunkTime + 5000;};
	tempItem.createCollectable = function(available) { return new Beer(available); };
	ITEMS_REPO.add("beer", tempItem);
	
	tempItem = new Weapon();
	tempItem.name = "Dodgy Pick";
	tempItem.description = "A simple pick, designed to break some rocks. It's kind of worn out.";
	tempItem.icon = new Animation(0, ANIMATION_SET_REPO.get("dodgy_pick"));
	tempItem.attack = 5;
	tempItem.sellingPrice = 1;
	tempItem.buyingPrice = 10;
	tempItem.createCollectable = function(available) { var item = new WeaponCollectable(available); item.item = ITEMS_REPO.get("dodgy_pick"); return item; };
	ITEMS_REPO.add("dodgy_pick", tempItem);
	
	tempItem = new Weapon();
	tempItem.name = "Steel Pick";
	tempItem.description = "Just a common steel pick. Can get the job done.";
	tempItem.icon = new Animation(0, ANIMATION_SET_REPO.get("steel_pick"));
	tempItem.attack = 8;
	tempItem.sellingPrice = 60;
	tempItem.buyingPrice = 200;
	tempItem.createCollectable = function(available) { var item = new WeaponCollectable(available); item.item = ITEMS_REPO.get("steel_pick"); return item; };
	ITEMS_REPO.add("steel_pick", tempItem);
	
	tempItem = new Weapon();
	tempItem.name = "Gilded Pick";
	tempItem.description = "Wow, this one is fancy. But is it any good?";
	tempItem.icon = new Animation(0, ANIMATION_SET_REPO.get("gilded_pick"));
	tempItem.attack = 13;
	tempItem.sellingPrice = 180;
	tempItem.buyingPrice = 500;
	tempItem.createCollectable = function(available) { var item = new WeaponCollectable(available); item.item = ITEMS_REPO.get("gilded_pick"); return item; };
	ITEMS_REPO.add("gilded_pick", tempItem);
	
	tempItem = new Weapon();
	tempItem.name = "Golden Pick";
	tempItem.description = "This Golden Pick may be expensive, but it's worth every piece of coin.";
	tempItem.icon = new Animation(0, ANIMATION_SET_REPO.get("golden_pick"));
	tempItem.attack = 18;
	tempItem.sellingPrice = 350;
	tempItem.buyingPrice = 1000;
	tempItem.createCollectable = function(available) { var item = new WeaponCollectable(available); item.item = ITEMS_REPO.get("golden_pick"); return item; };
	ITEMS_REPO.add("golden_pick", tempItem);
	
	tempItem = new Weapon();
	tempItem.name = "Flaming Pick";
	tempItem.description = "Now what the hell is this? Better keep this thing away from your beard.";
	tempItem.icon = new Animation(0, ANIMATION_SET_REPO.get("fire_pick"));
	tempItem.attack = 23;
	tempItem.sellingPrice = 500;
	tempItem.buyingPrice = 2000;
	tempItem.createCollectable = function(available) { var item = new WeaponCollectable(available); item.item = ITEMS_REPO.get("fire_pick"); return item; };
	ITEMS_REPO.add("fire_pick", tempItem);
	
	tempItem = new Weapon();
	tempItem.name = "Emerald Pick";
	tempItem.description = "Shiny one, I bet it can break almost anything into pieces.";
	tempItem.icon = new Animation(0, ANIMATION_SET_REPO.get("emerald_pick"));
	tempItem.attack = 27;
	tempItem.sellingPrice = 800;
	tempItem.buyingPrice = 2800;
	tempItem.createCollectable = function(available) { var item = new WeaponCollectable(available); item.item = ITEMS_REPO.get("emerald_pick"); return item; };
	ITEMS_REPO.add("emerald_pick", tempItem);
	
	tempItem = new Weapon();
	tempItem.name = "Ruby Pick";
	tempItem.description = "This little baby is the state of the art in the rock breaking business.";
	tempItem.icon = new Animation(0, ANIMATION_SET_REPO.get("ruby_pick"));
	tempItem.attack = 30;
	tempItem.sellingPrice = 1000;
	tempItem.buyingPrice = 3500;
	tempItem.createCollectable = function(available) { var item = new WeaponCollectable(available); item.item = ITEMS_REPO.get("ruby_pick"); return item; };
	ITEMS_REPO.add("ruby_pick", tempItem);
	
	tempItem = new Shield();
	tempItem.name = "Wooden Shield";
	tempItem.icon = new Animation(0, ANIMATION_SET_REPO.get("wooden_shield"));
	tempItem.description = "An old and worn out shield. Still prevents a head from getting hit by fragments though.";
	tempItem.defense = 5;
	tempItem.sellingPrice = 1;
	tempItem.buyingPrice = 10;
	tempItem.createCollectable = function(available) { var item = new ShieldCollectable(available); item.item = ITEMS_REPO.get("wooden_shield"); return item; };
	ITEMS_REPO.add("wooden_shield", tempItem);
	
	tempItem = new Shield();
	tempItem.name = "Steel Shield";
	tempItem.icon = new Animation(0, ANIMATION_SET_REPO.get("steel_shield"));
	tempItem.description = "A steel shield. A little heavy but it seems to be very resistant.";
	tempItem.defense = 10;
	tempItem.sellingPrice = 60;
	tempItem.buyingPrice = 200;
	tempItem.createCollectable = function(available) { var item = new ShieldCollectable(available); item.item = ITEMS_REPO.get("steel_shield"); return item; };
	ITEMS_REPO.add("steel_shield", tempItem);
	
	tempItem = new Shield();
	tempItem.name = "Bone Shield";
	tempItem.icon = new Animation(0, ANIMATION_SET_REPO.get("bone_shield"));
	tempItem.description = "Eek! Smells bad! But these bones are really tough.";
	tempItem.defense = 15;
	tempItem.sellingPrice = 180;
	tempItem.buyingPrice = 500;
	tempItem.createCollectable = function(available) { var item = new ShieldCollectable(available); item.item = ITEMS_REPO.get("bone_shield"); return item; };
	ITEMS_REPO.add("bone_shield", tempItem);
	
	tempItem = new Shield();
	tempItem.name = "Oaken Shield";
	tempItem.icon = new Animation(0, ANIMATION_SET_REPO.get("oaken_shield"));
	tempItem.description = "Crafted with the top oak wood around, right from the Valley of The Unicorns.";
	tempItem.defense = 20;
	tempItem.sellingPrice = 300;
	tempItem.buyingPrice = 1000;
	tempItem.createCollectable = function(available) { var item = new ShieldCollectable(available); item.item = ITEMS_REPO.get("oaken_shield"); return item; };
	ITEMS_REPO.add("oaken_shield", tempItem);
	
	tempItem = new Shield();
	tempItem.name = "Golden Shield";
	tempItem.icon = new Animation(0, ANIMATION_SET_REPO.get("golden_shield"));
	tempItem.description = "A really well made golden shield.";
	tempItem.defense = 25;
	tempItem.sellingPrice = 500;
	tempItem.buyingPrice = 2000;
	tempItem.createCollectable = function(available) { var item = new ShieldCollectable(available); item.item = ITEMS_REPO.get("golden_shield"); return item; };
	ITEMS_REPO.add("golden_shield", tempItem);
	
	tempItem = new Shield();
	tempItem.name = "Diamond Shield";
	tempItem.icon = new Animation(0, ANIMATION_SET_REPO.get("diamond_shield"));
	tempItem.description = "This is the pinnacle of the shield crafting, an intricate but very resistant item.";
	tempItem.defense = 30;
	tempItem.sellingPrice = 800;
	tempItem.buyingPrice = 3000;
	tempItem.createCollectable = function(available) { var item = new ShieldCollectable(available); item.item = ITEMS_REPO.get("diamond_shield"); return item; };
	ITEMS_REPO.add("diamond_shield", tempItem);
}