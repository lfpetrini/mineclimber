// Camera

function UIObject() {
	this.x = 0;
	this.y = 0;
	this.velocityX = 0;
	this.velocityY = 0;
	this.animation = null;
	this.camera = null;
}

UIObject.prototype.deleteCondition = function() {
	return true;
}

UIObject.prototype.draw = function(context, gameTime) {
	this.animation.draw(context, this.x, this.y, false, gameTime);
}

function MapCamera(map, gameTime) {
	this.map = map;
	this.map.camera = this;
	this.width = 0;
	this.height = 0;
	this.x = 0;
	this.y = 0;
	this.objects = Array();
	this.objectsToRemove = Array();
	this.lastUpdate = 0;
	this.moneyBag = ASSET_MANAGER.getAsset("moneybag");
	this.clockwise = true;
	this.rotation = 0;
	this.maxRotation = 0;
	this.rotationPerFrame = 0.2;
}

MapCamera.prototype.addObject = function(object) {
	this.objects.push(object);
	object.camera = this;
}

MapCamera.prototype.setSize = function(width, height) {
	this.width = width;
	this.height = height;
}

MapCamera.prototype.centerAt = function(x, y) {
	if(y == null) {
		// center at object X
	}
	else {
		//center at position X, Y
		this.x = x - this.width / 2;
		this.y = y - this.height / 2;
	}
}

MapCamera.prototype.update = function() {
	//var objectsToDestroy = Array();
	var mapLastUpdate = this.map.lastUpdate;
	var elapsedTime = mapLastUpdate - this.lastUpdate;
	for(var i = 0; i < this.objects.length; i++) {
		this.objects[i].x += elapsedTime * this.objects[i].velocityX;
		this.objects[i].y += elapsedTime * this.objects[i].velocityY;
		if(this.objects[i].deleteCondition())
			this.objectsToRemove.push(i);
	}
	
	// Delete unnecessary objects
	for(var i = this.objectsToRemove.length - 1; i >= 0; i--) {
		this.objects.splice(this.objectsToRemove[i], 1);
	}
	
	this.objectsToRemove = Array();
	this.lastUpdate = mapLastUpdate;
}

MapCamera.prototype.draw = function(context, x, y, width, height) {
	// since we'll draw the map starting from a multiple of the tile sizes
	// and then position the result as we want, we'll add some extra space
	// at the end to guarantee everything will be shown
	var tempCanvas = getTempCanvas(this.width + this.map.tileWidth, this.height + this.map.tileHeight);
	var tileX = Math.floor(this.x / this.map.tileWidth);
	var tileY = Math.floor(this.y / this.map.tileHeight);
	var tilesWidth = Math.ceil(this.width / this.map.tileWidth) + 1;
	var tilesHeight = Math.ceil(this.height / this.map.tileHeight) + 1;
	this.map.draw(tempCanvas.getContext("2d"), tileX, tileY, tilesWidth, tilesHeight);
	var posX = this.x % this.map.tileWidth;
	var posY = this.y % this.map.tileHeight;
	if(posX < 0) 
		posX += this.map.tileWidth;
	if(posY < 0) 
		posY += this.map.tileHeight;
	
	if(this.map.player.drunkTime > this.map.player.lastUpdate) {
		var timeRemaining = this.map.player.drunkTime - this.map.player.lastUpdate;

		this.maxRotation = Math.min(10, timeRemaining / 1500);
		this.rotationPerFrame = Math.min(0.8, timeRemaining / 30000);
		
		if(this.clockwise) {
			if(this.rotation < this.maxRotation)
				this.rotation += this.rotationPerFrame;
			else
				this.clockwise = false;
		}
		else {
			if(this.rotation > -this.maxRotation)
				this.rotation -= this.rotationPerFrame;
			else
				this.clockwise = true;
		}
		context.save();
		context.translate(300, 300);
		context.rotate(degreesToRadians(this.rotation));
		context.translate(-300, -300);
	}
	else
		this.maxRotation = 0;
	
	if(posY < 0)
		posY = 0;
	
	context.drawImage(this.map.background, 0, 0);
	context.drawImage(tempCanvas, posX, posY, this.width, this.height, x, y, width, height);

	context.globalAlpha = 0.3;
	for(var i = 0; i < this.maxRotation; i++)
		context.drawImage(tempCanvas, posX + Math.random() * 10, posY + Math.random() * 10, this.width, this.height, x, y, width, height);	
	context.globalAlpha = 1;

	for(var i = 0; i < this.objects.length; i++) {
		this.objects[i].draw(context, this.map.lastUpdate);
	}
	context.font = "16px SilkScreenRegular";
	context.textBaseline = "top";
	context.textAlign = "left";
	context.fillStyle = "white";
	context.fillText("HEALTH", 10, 10);
	context.fillText("EXP", 10, 26);
	context.fillText("LEVEL " + this.map.player.level + " - FLOORS CLIMBED: " + parseInt((this.map.bottomInPixels + this.map.heightInPixels - this.map.player.y) / this.map.floorInPixels), 10, 42);
	context.drawImage(this.moneyBag, 310, 10);
	context.fillStyle = "#808080";
	context.fillRect(100, 14, 202, 10);
	context.fillRect(100, 30, 202, 10);
	context.fillStyle = "red";
	context.fillRect(101, 15, this.map.player.uiCurrentHealthBarWidth, 8);
	context.fillStyle = "yellow";
	context.fillRect(101, 31, this.map.player.uiCurrentExpBarWidth, 8);
	context.textAlign = "center";
	context.fillText(this.map.player.money, 386, 20);

	if(this.map.player.drunkTime > this.map.player.lastUpdate)
		context.restore();
	
	//delete tempCanvas;
}