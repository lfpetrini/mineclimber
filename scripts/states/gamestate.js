// GameState

function GameState() {
	this.startTime = 0;
	this.lastUpdate = 0;
	this.stateTime = 0;
}

GameState.prototype.draw = function(context, gameTime) {
}

GameState.prototype.update = function(gameTime) {
}

GameState.prototype.onStart = function(gameTime) {
}

GameState.prototype.onFinish = function(gameTime) {
}

// GameStateManager

function GameStateManager(game) {
	this.state = null;
	this.game = game;
}

GameStateManager.prototype.changeState = function(state, gameTime) {
	if(this.state != null)
		this.state.onFinish(gameTime);
	state.startTime = gameTime;
	state.lastUpdate = gameTime;
	state.game = this.game;
	this.state = state;
	this.state.onStart(gameTime);
}

GameStateManager.prototype.updateAndDraw = function(context, gameTime) {
	this.state.stateTime = gameTime - this.state.startTime;
	this.state.update(gameTime);
	this.state.draw(context, gameTime);
	this.state.lastUpdate = gameTime;
}

GameStateManager.prototype.update = function(context, gameTime) {
	this.state.stateTime = gameTime - this.state.startTime;
	this.state.update(gameTime);
	this.state.lastUpdate = gameTime;
}

GameStateManager.prototype.draw = function(context, gameTime) {
	this.state.draw(context, gameTime);
}