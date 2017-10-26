// AssetManager
// Got some help and ideas here: http://www.html5rocks.com/en/tutorials/games/assetmanager/

function AssetManager() {
	this.imageQueue = Array();
	this.textQueue = Array();
	this.audioQueue = Array();
	// {} = key value pairs
	this.cache = {};
	this.loadedResources = 0;
	this.errorResources = 0;
	this.audioBuffer = 10;
}

AssetManager.prototype.queueDownloadableImage = function(path, id) {
	this.imageQueue.push(Array(path, id));
}

AssetManager.prototype.queueDownloadableText = function(path, id) {
	this.textQueue.push(Array(path, id));
}

AssetManager.prototype.queueDownloadableAudio = function(path, id) {
	this.audioQueue.push(Array(path, id));
}

AssetManager.prototype.downloadAssets = function(downloadCallback) {
	if(this.getTotal() == 0) {
		downloadCallback();
		return;
	}
	
	var ASSET_MANAGER = this;
	
	// Images
	for(var i = 0; i < this.imageQueue.length; i++) {
		var path = this.imageQueue[i][0];
		var id = this.imageQueue[i][1];
		var img = new Image();
		img.src = path;
		this.cache[id] = img;
		img.addEventListener("load", function () {
			ASSET_MANAGER.incrementDownloadableResources(true, downloadCallback);
		}, false);
		img.addEventListener("error", function () {
			ASSET_MANAGER.incrementDownloadableResources(false, downloadCallback);
		}, false);
	}

	// Texts
	for(var i = 0; i < this.textQueue.length; i++) {
		var path = this.textQueue[i][0];
		var id = this.textQueue[i][1];
		var request = new XMLHttpRequest();
		request.open("GET", path, true);
		request.send();
		//request.responseType = "text";
		// onload function scope must be enclosed
		(function(id, request) {
			request.onload = function() {
				if(request.status == 200) {
					ASSET_MANAGER.cache[id] = request.responseText;
					ASSET_MANAGER.incrementDownloadableResources(true, downloadCallback);
				}
				else {
					ASSET_MANAGER.cache[id] = "";
					ASSET_MANAGER.incrementDownloadableResources(false, downloadCallback);
				}
			};
		})(id, request);
	}
	
	// Audio
	for(var i = 0; i < this.audioQueue.length; i++) {
		var path = this.audioQueue[i][0];
		var id = this.audioQueue[i][1];
		var audio = new Audio(path);
		(function(id, audio) {
			audio.addEventListener("canplaythrough", function () {
				ASSET_MANAGER.cache[id] = new AudioCollection(audio, ASSET_MANAGER.audioBuffer);
				ASSET_MANAGER.incrementDownloadableResources(true, downloadCallback);
			}, false);
			audio.addEventListener("error", function () {
				ASSET_MANAGER.incrementDownloadableResources(false, downloadCallback);
			}, false);
		})(id, audio);
	}
}

AssetManager.prototype.incrementDownloadableResources = function(loaded, downloadCallback) {
	
	if(loaded == true)
		this.loadedResources++;
	else
		this.errorResources++;

	
	if(this.isDone()) {
		downloadCallback();
	}
}

AssetManager.prototype.getTotal = function() {
	return this.imageQueue.length + this.textQueue.length + this.audioQueue.length;
}

function AudioCollection(audio, total) {
	// 0 is reserved for loop
	audio.loop = true;
	this.current = 1;
	this.total = Math.max(1, total);
	this.audioObjects = Array();
	this.audioObjects.push(audio);
	for(var i = 0; i < this.total; i++) {
		this.audioObjects.push(new Audio(audio.src));
	}
}

AudioCollection.prototype.play = function() {
	this.audioObjects[this.current].currentTime = 0;
	//this.audioObjects[this.current].loop = false;
	this.audioObjects[this.current].play();
	this.current++;
	if(this.current >= this.total)
		this.current = 1;
}

AudioCollection.prototype.playLoop = function() {
	this.audioObjects[0].currentTime = 0;
	this.audioObjects[0].play();
}

AudioCollection.prototype.stop = function() {
	this.audioObjects[this.current].pause();
}

AudioCollection.prototype.stopLoop = function() {
	this.audioObjects[0].pause();
}

AssetManager.prototype.isDone = function() {
	var totalDownloaded = this.loadedResources + this.errorResources;
	return this.getTotal() == totalDownloaded;
}

AssetManager.prototype.getAsset = function(id) {
	return this.cache[id];
}

AssetManager.prototype.addAsset = function(id, resource) {
	this.cache[id] = resource;
}

AssetManager.prototype.clearAsset = function(id) {
	delete this.cache[id];
}