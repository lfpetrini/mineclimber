// CreditsState

function CreditsState() {
	this.background = ASSET_MANAGER.getAsset("background");
	this.text = "EVERYTHING DONE BY LUCAS FELIPPE PETRINI";
}

CreditsState.prototype = new GameState();

CreditsState.prototype.onStart = function() {
}

CreditsState.prototype.update = function(gameTime) {
	if((currentKeys[99] && !lastKeys[99]) || (currentKeys[67] && !lastKeys[67])) {
		var state = new MenuState();
		game.stateManager.changeState(state, gameTime);
	}
}

CreditsState.prototype.draw = function(context, gameTime) {
	context.clearRect(0, 0, this.game.CANVAS_WIDTH, this.game.CANVAS_HEIGHT);
	context.drawImage(this.background, 0, 0);
	context.font = "20px SilkScreenRegular";
	context.textBaseline = "middle";
	context.textAlign = "center";
	context.fillStyle = "white";
	context.fillText(this.text, 300, 280);
	context.fillText("PRESS 'C' TO GO BACK TO MENU", 300, 330);
}