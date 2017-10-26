// MenuState

function MenuState() {
	this.background = ASSET_MANAGER.getAsset("titlescreen");
	this.options = ["PLAY GAME", "INSTRUCTIONS", "CREDITS"];
	this.option = 0;
}

MenuState.prototype = new GameState();

MenuState.prototype.onStart = function() {
}

MenuState.prototype.update = function(gameTime) {
	if(currentKeys[38] && !lastKeys[38]) {
		if(this.option == 0)
			this.option = 2;
		else
			this.option--;
	}
	if(currentKeys[40] && !lastKeys[40]) {
		if(this.option == 2)
			this.option = 0;
		else
			this.option++;
	}
	if((currentKeys[99] && !lastKeys[99]) || (currentKeys[67] && !lastKeys[67])) {
	//if(keyPressed[67]) {
		switch(this.option) {
			case 0 : {
				var state = new PlayingState();
				game.stateManager.changeState(state, gameTime);
			} break;
			case 1 : {
				var state = new InstructionsState();
				game.stateManager.changeState(state, gameTime);
			} break;
			case 2 : {
				var state = new CreditsState();
				game.stateManager.changeState(state, gameTime);
			} break;
		}
	}
}

MenuState.prototype.draw = function(context, gameTime) {
	context.clearRect(0, 0, this.game.CANVAS_WIDTH, this.game.CANVAS_HEIGHT);
	context.drawImage(this.background, 0, 0);
	context.font = "32px SilkScreenRegular";
	context.textBaseline = "top";
	context.textAlign = "left";
	context.fillStyle = "red";
	var metrics = context.measureText(this.options[this.option]);
	context.fillRect(36, 382 + this.option * 32, metrics.width + 8, 30);
	context.fillStyle = "white";
	for(var i = 0; i < this.options.length; i++)
		context.fillText(this.options[i], 40, 380 + i * 32);
}