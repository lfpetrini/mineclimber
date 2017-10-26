// Util

function checkRectIntersection(x1, y1, width1, height1, x2, y2, width2, height2) {
	if(x1 > x2 + width2)
		return false;
	if(y1 > y2 + height2)
		return false;
	if(x2 > x1 + width1)
		return false;
	if(y2 > y1 + height1)
		return false;

	return true;
}

function clamp(src, min, max) {
	return Math.min(Math.max(src, min), max);
}

tempCanvas = document.createElement("canvas");
function getTempCanvas(width, height) {
	tempCanvas.width = width;
	tempCanvas.height = height;
	return tempCanvas;
}
		
function createCanvas(width, height) {
	var tempCanvas = document.createElement("canvas");
	tempCanvas.width = width;
	tempCanvas.height = height;
	return tempCanvas;
}
		
function cropImage(imgSource, sourceX, sourceY, sourceWidth, sourceHeight, destWidth, destHeight) {
	// Create a canvas to place the cropped image
	var tempCanvas = createCanvas(destWidth, destHeight);
	tempCanvas.getContext("2d").drawImage(imgSource, sourceX, sourceY, sourceWidth, sourceHeight, 0, 0, destWidth, destHeight);
	return tempCanvas;
}
		
function cropFlippedImage(imgSource, sourceX, sourceY, sourceWidth, sourceHeight, destWidth, destHeight) {
	// Create a canvas to place the cropped image
	var tempCanvas = createCanvas(destWidth, destHeight);
	tempCanvas.getContext("2d").translate(tempCanvas.width, 0);
	tempCanvas.getContext("2d").scale(-1, 1);
	tempCanvas.getContext("2d").drawImage(imgSource, sourceX, sourceY, sourceWidth, sourceHeight, 0, 0, destWidth, destHeight);
	return tempCanvas;
}
		
		
function degreesToRadians(d) {
	// Converts degrees to radians
	return d * 0.0174532925199432957;
}


function getDistance(x1, y1, x2, y2) {
	var b = Math.abs(x1 - x2);
	var c = Math.abs(y1 - y2);
	return Math.sqrt(b * b + c * c);
}


function circleMidpoint(xc, yc, r, context) {
	var   x= 0, y= r;
	var   d= 1-r;
	var   dE= 3;
	var   dSE= 5 - 2*r;

	if (!r) return;
	context.fillRect(xc-r, yc, 1, 1);
	context.fillRect(xc+r, yc, 1, 1);
	context.fillRect(xc, yc-r, 1, 1);
	context.fillRect(xc, yc+r, 1, 1);
	  
	while (y > x)    //only formulate 1/8 of circle
	{
		//alert("d: " + d + " dE: " + dE + " dSE: " + dSE);
		if (d < 0) 
		{
			d+= dE;
			dE+=2, dSE+=2;
		} else {
			d+=dSE;
			dE+=2, dSE+=4;
			y--;
		}
		x++;
		//alert("d: " + d + " dE: " + dE + " dSE: " + dSE);
 
		context.fillRect(xc+y, yc+x, 1, 1);
		context.fillRect(xc+x, yc+y, 1, 1);
		context.fillRect(xc+y, yc-x, 1, 1);
		context.fillRect(xc+x, yc-y, 1, 1);
		context.fillRect(xc-y, yc+x, 1, 1);
		context.fillRect(xc-x, yc+y, 1, 1);
		context.fillRect(xc-y, yc-x, 1, 1);
		context.fillRect(xc-x, yc-y, 1, 1);
		//alert("X: " + x + " Y: " + y);
	 }
}

function fillCircle(context, centerX, centerY, radius, color) {
	context.beginPath();
	context.arc(centerX, centerY, radius, 0, 2 * Math.PI, false);
	context.fillStyle = color;
	context.fill();
}

function drawMultilineText(context, text, fontHeight, x, y, width, height, alignment) {
	context.textAlign = "left";
	if(alignment == 0) { // LEFT
		var currentY = 0;
		var currentX = 0;
		var currentWord = 0;
		var words = text.trim().replace(/ +/g, String.fromCharCode(3) + " " + String.fromCharCode(3)).split(String.fromCharCode(3));
		while(currentWord < words.length) {
			var textWidth = context.measureText(words[currentWord]).width;
			if(currentX + textWidth > width) {
				currentY += fontHeight;
				if(currentY + fontHeight > height)
					return;
				currentX = 0;
				if(words[currentWord] == " ") {
					currentWord++;
					continue;
				}
			}
			context.fillText(words[currentWord], x + currentX, y + currentY);
			currentX += textWidth;
			currentWord++;
		}
	}
}

function getCookie(cookieName) {
    var name = cookieName + "=";
    var nameLength = name.length;
    var stringLength = document.cookie.length;
    var i = 0;
    while (i < stringLength) {
        var end = i + nameLength;
        if (document.cookie.substring(i, end) == name) {
            var valStart = end;
			end = document.cookie.indexOf(";", i);
			if(end < 0)
				end = stringLength;
			return document.cookie.substring(valStart, end);
        }
        i = document.cookie.indexOf(" ", i) + 1;
        if (i == 0) break; 
    }
    return null;
}

function setCookie(cookieName, cookieVal, expirationDate, path) {
	if(path == null)
		path = "/";
    document.cookie = cookieName + "=" + cookieVal + "; expires=" + expirationDate + "; path=" + path;
}
