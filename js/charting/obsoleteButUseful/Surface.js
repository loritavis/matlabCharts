"use strict";

function Surface(m) {

	this.makeColorMap = function(){
		// read and convert a color map
		var data = getDataset("dataset8.json");
		var c = data.c;
		var N = 100;	
		this.colormap = new Array(N);
		for(var i=0;i<N;i++){
			this.colormap[i] = 'rgb(' + c.data[i] + ',' + c.data[i+N] + ',' + c.data[i+N+N] + ')';
		}
	};

	this.setData = function (surfaceMatrix) {
		this.m = surfaceMatrix;
		this.xMin = 0;
		this.xMax = surfaceMatrix.dims[0];

		this.yMin = 0;
		this.yMax = surfaceMatrix.dims[1];

		this.zMin = Math.min.apply(Math,surfaceMatrix.data);
		this.zMax = Math.max.apply(Math,surfaceMatrix.data);
	};

	this.draw = function (ctx, offsetX, offsetY, scaleX, scaleY) {

		var cScale = 0.99999 * this.colormap.length/(this.zMax - this.zMin);
		var cOffset = -cScale * this.zMin;

		ctx.lineWidth = 0.3;

		ctx.strokeStyle = "black";

		var M = this.calculateTransform();
		var xRow = M[0];
		var yRow = M[1];
		var cols = this.m.dims[1];

		for(var i = 0;i<(this.m.dims[0] - 1);i++){
			for(var j=0;j<( cols - 1);j++){
				var index = i * cols + j;

				var x1 = i     * xRow[0] + j     * xRow[1] + m.data[index]              * xRow[2] + xRow[3]; 
				var y1 = i     * yRow[0] + j     * yRow[1] + m.data[index]              * yRow[2] + yRow[3];

				var x2 = (i+1) * xRow[0] + j     * xRow[1] + m.data[index + cols]          * xRow[2] + xRow[3]; 
				var y2 = (i+1) * yRow[0] + j     * yRow[1] + m.data[index + cols]          * yRow[2] + yRow[3];

				var x3 = (i+1) * xRow[0] + (j+1) * xRow[1] + m.data[index + 1 + cols] * xRow[2] + xRow[3]; 
				var y3 = (i+1) * yRow[0] + (j+1) * yRow[1] + m.data[index + 1 + cols] * yRow[2] + yRow[3];

				var x4 = i     * xRow[0] + (j+1) * xRow[1] + m.data[index + 1]     * xRow[2] + xRow[3]; 
				var y4 = i     * yRow[0] + (j+1) * yRow[1] + m.data[index + 1]     * yRow[2] + yRow[3];

				ctx.beginPath();

				ctx.moveTo(x1, y1);				
				ctx.lineTo(x2, y2);				
				ctx.lineTo(x3, y3);				
				ctx.lineTo(x4, y4);			
				ctx.lineTo(x1, y1);

				if(this.fill){
					var colorIndex = Math.floor(cOffset + cScale * m.data[index]);
					ctx.fillStyle = this.colormap[colorIndex];
					ctx.fill();
				}
				ctx.stroke();
			}
		}
	};

	this.calculateTransform = function(){ 
		var axis  = this.parent;

		// Center of the data
		var dcX = (this.xMin + this.xMax)/2;
		var dcY = (this.yMin + this.yMax)/2;
		var dcZ = (this.zMin + this.zMax)/2;

		// azimuth rotation
		var saz = Math.sin(axis.azimuth);
		var caz = Math.cos(axis.azimuth);

		// elevation rotation
		var sel = Math.sin(axis.elevation);
		var cel = Math.cos(axis.elevation);

		// scaling
		var dx = this.xMax - this.xMin;
		var dy = this.yMax - this.yMin;
		var dz = this.zMax - this.zMin;
		var dataRange = Math.sqrt(dx * dx + dy * dy + dz * dz);

		var height = axis.bottom - axis.top;
		var width  = axis.right - axis.left;
		var portSize = Math.min(height,width);

		var S = portSize/dataRange;

		// axis center
		var scX = (axis.left + axis.right)/2;
		var scY = (axis.top + axis.bottom)/2;

		// So, this is the result of multiplying the five graphical transform matrices together.
		var xRow = [     S*caz,    -S*saz,      0,                     scX - S*caz*dcX + S*dcY*saz];
		var yRow = [ S*cel*saz, S*caz*cel, -S*sel, scY + S*dcZ*sel - S*caz*cel*dcY - S*cel*dcX*saz];

		return[xRow,yRow];
	};

	this.fill = true;
	this.parent = null;
	this.makeColorMap();
	this.setData(m);
}
