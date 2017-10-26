// InstructionsState

function InstructionsState() {
	this.background = ASSET_MANAGER.getAsset("background");
	this.text = ["WHAT DO WE HAVE HERE?", 
		"LOOKS LIKE A REALLY NEAT EMERALD!",
		"OH SH*T! I THINK I MIGHT HAVE JUST",
		"REACHED THE OCEAN!",
		"THE MINE IS GONNA FLOOD IN NO TIME!",
		"WHAT?",
		"GOBLINS ARE BREAKING INTO THE MINE?",
		"WONDERFUL! COULDN'T GET ANY BETTER!", "", "", "",
		"HURRY, LITTLE BUDDY, HURRY!",
		"GET TO THE SURFACE ASAP!",
		"DON'T TOUCH THE WATER!",
		"YOU ARE DEFINITELY NOT A GOOD SWIMMER.",
		"PRESS THE ARROW KEYS TO MOVE AND JUMP.",
		"PRESS 'X' TO UNLEASH A POWERFUL PICK ATTACK!",
		"SURROUNDED BY DISGUSTING LITTLE GREEN FOES?",
		"WORRY YOU NOT!",
		"PRESS 'C' TO PULL OUT YOUR SHIELD!",
		"PRESS 'S' TO OPEN YOUR INVENTORY.", "PRESS 'S' CLOSE TO A SELLER TO TRADE ITEMS.", "",
		"NOW PRESS 'C' TO GO BACK TO MENU"];
	this.currentLine = 0;
}

InstructionsState.prototype = new GameState();

InstructionsState.prototype.onStart = function() {
}

InstructionsState.prototype.update = function(gameTime) {
	var stateTime = gameTime - this.startTime;
	this.currentLine = this.currentLine < this.text.length - 1 ? parseInt(this.stateTime / 1000) : this.text.length - 1;
	
	if((currentKeys[99] && !lastKeys[99]) || (currentKeys[67] && !lastKeys[67])) {
		if(this.currentLine < this.text.length - 1) {
			this.currentLine = this.text.length - 1;
		}
		else {
			var state = new MenuState();
			game.stateManager.changeState(state, gameTime);
		}
	}
}

InstructionsState.prototype.draw = function(context, gameTime) {
	context.clearRect(0, 0, this.game.CANVAS_WIDTH, this.game.CANVAS_HEIGHT);
	context.drawImage(this.background, 0, 0);
	context.font = "20px SilkScreenRegular";
	context.textBaseline = "top";
	context.textAlign = "center";
	context.fillStyle = "white";
	for(var i = 0; i <= this.currentLine; i++)
		context.fillText(this.text[i], 300, 50 + i * 20);
}