// GameText

function GameText(gameTime, text, color, timeLimit) {
	this.timeLimit = timeLimit;
	this.text = text;
	this.font = "16px SilkScreenRegular";
	this.textAlign = "center";
	this.affectedByGravity = false;
	this.lastUpdate = gameTime;
	this.color = color;
}

GameText.prototype = new GameObject();

GameText.prototype.draw = function(context, x, y) {
	context.font = this.font;
	context.textBaseline = "top";
	context.textAlign = this.textAlign;
	context.fillStyle = this.color;
	context.fillText(this.text, x, y);
}

GameText.prototype.update = function(gameTime) {
	if(gameTime > this.timeLimit)
		this.state = -1;
}