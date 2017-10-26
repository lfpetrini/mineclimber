// AnimationSet

function AnimationSet(width, height) {
	this.width = width;
	this.height = height;
	this.frames = Array();
	this.flippedFrames = Array();
	this.totalTime = 0;
	this.frameTime = 0;
	this.offsetX = 0;
	this.flippedOffsetX = 0;
	this.offsetY = 0;
}

AnimationSet.prototype.addFrames = function(image, x, y, count) {
	var a = x;
	for(var i = 0; i < count; i++) {
		this.frames.push(cropImage(image, a, y, this.width, this.height, this.width, this.height));
		this.flippedFrames.push(cropFlippedImage(image, a, y, this.width, this.height, this.width, this.height));
		a += this.width;
	}
	this.totalTime = this.frames.length * this.frameTime - 1;
}

AnimationSet.prototype.setOffset = function(x, y, width) {
	this.offsetX = x;
	this.flippedOffsetX = this.width - x - width - 1;
	this.offsetY = y;
}

AnimationSet.prototype.setFrameTime = function(time) {
	this.frameTime = time;
	this.totalTime = this.frames.length * this.frameTime - 1;
}

// Animation

function Animation(gameTime, animSet) {
	this.startTime = gameTime;
	this.animationSet = animSet;
}

Animation.prototype.draw = function(context, x, y, flipped, gameTime) {
	var currentFrame = (this.animationSet.frames.length) > 1 ? parseInt((gameTime - this.startTime) % this.animationSet.totalTime / this.animationSet.frameTime) : 0;
	if(flipped)
		context.drawImage(this.animationSet.flippedFrames[currentFrame], x - this.animationSet.flippedOffsetX, y - this.animationSet.offsetY);
	else
		context.drawImage(this.animationSet.frames[currentFrame], x - this.animationSet.offsetX, y - this.animationSet.offsetY);
}

// AnimationSetRepository

function AnimationSetRepository() {
	this.animationSet = {};
}

AnimationSetRepository.prototype.add = function(id, animSet) {
	this.animationSet[id] = animSet;
}

AnimationSetRepository.prototype.get = function(id) {
	return this.animationSet[id];
}