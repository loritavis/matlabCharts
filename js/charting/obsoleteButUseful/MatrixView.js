function MatrixView(data) {
    "use strict";
	// This class draws a matrix, with row and column headers in a scrolling rectangle.
	// If you need to visualize a matrix (two dimensional) in a constrained space, this is your tool.

	// data is a matrix. it has fields "data', a one d array, and dims, an array of length 2,
	// providing the number of rows and columns in the matrix. This matches MATLABs array size info.

	//TODO ;
	// Cell sizes are fixed. They should scale with font and data precision.
	// colors are fixed. They should be setable.
	// It is possible to scroll past the right and bottom edge of the data. this behaves badly.

	// PUBLIC FIELDS
	// the canvas background will be filled with this color
	this.backgroundColor = 'white';

	// data values are drawn with this font
	this.font = '14px serif';

	// all text and separator lines in this color
	this.textColor = '#000';

	// PRIVATE FIELDS
	var matrix = data;
	var parent = null;

	// the number of pixels the matrix is scrolled away from  the upper left of the matrix being in the upper left of the canvas.
	// don't be making these negative.
	var xOffset = 0;
	var yOffset = 0;

	// Here, we are attaching an Interaction to this canvas.
	// this is what makes the matrix pan on mouse drag.
	//var thisView = this;
	//var interactor = new Interaction(canvas);
	//interactor.mouseDragHandler = function pan(event, dx, dy) {	
	//	thisView.pan(dx,dy);
	//};

	var x = 50;
	var y = 50;
	var width = 400;
	var height = 300;
	
	// PUBLIC METHODS 
	this.setLocation = function(xIn,yIn){
		x = xIn;
		y = yIn;
	};
	
	this.setSize = function(w,h){
		width = w;
		height = h;
	};
	
	this.pan = function(dx,dy){
		xOffset = Math.max(xOffset - dx, 0);
		yOffset = Math.max(yOffset - dy, 0);
	};

	this.setParent = function(p){
		parent = p;
	};
	
	this.redraw = function(){
		if (parent){
			parent.redraw();
		}
	};

	this.draw = function (context) {

		// erase background
		context.fillStyle = this.backgroundColor;
		context.fillRect(x,y, width, height);

		// calculate some locations
		var rowHeight = 20;
		var columnWidth = 50;

		// Which rows are in view?
		var firstRow = Math.floor( yOffset / rowHeight);
		var lastRow = firstRow + Math.ceil(height / rowHeight);
		var ySlip = yOffset - firstRow * rowHeight;

		// which columns are in view?
		var firstColumn = Math.floor(xOffset / columnWidth);
		var lastColumn  = firstColumn + Math.ceil(width / columnWidth);
		var xSlip = xOffset - firstColumn * columnWidth;

		context.fillStyle = this.textColor;
		context.font = this.font;
		context.strokeStyle = '#cbb';
		context.lineWidth = 1;

		// clip data values to a smaller rectangle
		context.save();
		context.beginPath();
		context.rect(x + 15, y + 15, width-15, height-15);
		context.clip();
				
		// draw the data values
		for(var row = firstRow; row<lastRow; row++){
			for(var column = firstColumn; column<lastColumn; column++){
				var xx = x + (column - firstColumn + 1) * columnWidth - xSlip;
				var yy = y + (row    - firstRow    + 2) * rowHeight   - ySlip;
				var index = column * matrix.dims[1] + row;
				var value = matrix.data[index];
				label = value.toFixed(2); 
				context.fillText(label,xx, yy);
			}
		}

		context.restore();
		
		var colored = rgbaToString([223,203,203],1);
		var faded = rgbaToString([223,203,203],0);
		
		// right fadeout
		var gradient = context.createLinearGradient(x + width-15, 0,x +  width, 0);
		gradient.addColorStop(0, faded);
		gradient.addColorStop(0.8, colored);
		context.fillStyle = gradient;		
		context.fillRect(x + width-15, y + 15, 15, height - 15);
		
		// bottom fadeout
		gradient = context.createLinearGradient(0, y + height-15, 0, y + height);
		gradient.addColorStop(0, faded);
		gradient.addColorStop(0.8, colored);
		context.fillStyle = gradient;		
		context.fillRect(x + 15, y + height-15, width - 15, 15);
		
		// the color of this header is arbitrary. It should be a function of the background color.
		var headerBackground = [220,205,205];
		fadeBarV(context,x    ,y + 4, 35,   height-4, headerBackground);
		fadeBarH(context,x + 4,y,     width-4, 28,   headerBackground);
				
		// header text
		context.fillStyle = this.textColor;
		context.textAlign = "center";
		context.textBaseline = "bottom";
		// rows
		for(row = firstRow; row <lastRow; row++){
			yy = y + (row-firstRow + 2) * rowHeight - ySlip;
			label = (row+1).toFixed(0); // I+1 because matrices start at 1, not 0.
			context.fillText(label, y + 15, yy);
		}
		// columns
		for(column = firstColumn; column <lastColumn; column++){
			xx = x + (column-firstColumn + 1) * columnWidth - xSlip;
			label = (column+1).toFixed(0); 
			context.fillText(label,xx, y + rowHeight);
		}
	};

	function fadeBarH(context,x,y,w,h,rgb){
		var radius = h/2;
		var colored = rgbaToString(rgb,1);
		var faded = rgbaToString(rgb,0);

		// the bar
		var gradient = context.createLinearGradient(x, y, x, y + h);
		gradient.addColorStop(0, faded);
		gradient.addColorStop(0.3, colored);
		gradient.addColorStop(0.7, colored);
		gradient.addColorStop(1, faded);
		context.fillStyle = gradient;		
		context.fillRect(x + radius,y,w - h,h);

		// the ends
		gradient = context.createRadialGradient(x + radius,y + radius, 0, x + radius,y + radius, radius);
		gradient.addColorStop(0.4, colored);
		gradient.addColorStop(1, faded);
		context.fillStyle = gradient;

		context.beginPath();
		context.moveTo(x + radius,y);
		context.arc(x + radius,y + radius, radius, -3.1416/2, 3.1416/2, 1);				
		context.fill();

		gradient = context.createRadialGradient(x + w - radius,y + radius, 0, x + w - radius,y + radius, radius);
		gradient.addColorStop(0.4, colored);
		gradient.addColorStop(1, faded);
		context.fillStyle = gradient;

		context.beginPath();
		context.moveTo(x + w - radius,y);
		context.arc(x + w - radius,y + radius, radius, -3.1416/2, 3.1416/2, 0);				
		context.fill();
	}

	function fadeBarV(context,x,y,w,h,rgb){
		var radius = w/2;
		var colored = rgbaToString(rgb,1);
		var faded = rgbaToString(rgb,0);

		// the bar
		var gradient = context.createLinearGradient(x, y, x + w, y);
		gradient.addColorStop(0, faded);
		gradient.addColorStop(0.3, colored);
		gradient.addColorStop(0.7, colored);
		gradient.addColorStop(1, faded);
		context.fillStyle = gradient;		
		context.fillRect(x,y + radius,w,h - w);

		// the ends
		gradient = context.createRadialGradient(x + radius,y + radius, 0, x + radius,y + radius, radius);
		gradient.addColorStop(0.4, colored);
		gradient.addColorStop(1, faded);
		context.fillStyle = gradient;

		context.beginPath();
		context.moveTo(x,y + radius);
		context.arc(x + radius,y + radius, radius, 3.1416, 0, 0);				
		context.fill();

		gradient = context.createRadialGradient(x + radius,y + h- radius, 0, x + radius,y + h-radius, radius);
		gradient.addColorStop(0.4, colored);
		gradient.addColorStop(1, faded);
		context.fillStyle = gradient;

		context.beginPath();
		context.moveTo(x ,y + h - radius);
		context.arc(x + radius,y + h - radius, radius, 3.1416, 0, 1);				
		context.fill();
	}
	
	function rgbaToString(rgb,a){
		return 'rgba(' + rgb[0] + ',' + rgb[1] + ',' + rgb[2] + ',' + a + ')';
	}

	this.mouseDragHandler = function(event,dx,dy){
		xOffset = Math.max(0,xOffset-dx);
		yOffset = Math.max(0,yOffset-dy);
		this.redraw();
	};
	
	this.eventHandler = this;

}
