// GameOverState

function GameOverState(floors) {
	this.background = ASSET_MANAGER.getAsset("background");
	this.text = "YOU MANAGED TO GO UP THROUGH " + floors + (floors == 1 ? " FLOOR" : " FLOORS");
	this.best = getCookie("highestscore");
	if(this.best == null || parseInt(this.best) < floors) {
		var date = new Date();
		date.setDate(date.getDate() + 36400); // set cookie to expire in 100 years
		setCookie("highestscore", floors, date.toGMTString());
		this.best = "NEW BEST!";
	}
	else
		this.best = "YOUR BEST: " + this.best;
}

GameOverState.prototype = new GameState();

GameOverState.prototype.onStart = function() {
}

GameOverState.prototype.onFinish = function(gameTime) {
	ASSET_MANAGER.getAsset("music1").stopLoop();
}

GameOverState.prototype.update = function(gameTime) {
	if((currentKeys[99] && !lastKeys[99]) || (currentKeys[67] && !lastKeys[67])) {
		var state = new MenuState();
		game.stateManager.changeState(state, gameTime);
	}
}

GameOverState.prototype.draw = function(context, gameTime) {
	context.clearRect(0, 0, this.game.CANVAS_WIDTH, this.game.CANVAS_HEIGHT);
	context.drawImage(this.background, 0, 0);
	context.font = "20px SilkScreenRegular";
	context.textBaseline = "middle";
	context.textAlign = "center";
	context.fillStyle = "white";
	context.fillText(this.text, 300, 280);
	context.fillText(this.best, 300, 300);
	context.fillText("PRESS 'C' TO GO BACK TO MENU AND TRY AGAIN", 300, 360);
}