"use strict";

function PColor(m) {
	
	this.setData = function (ColorMatrix) {
		this.m = ColorMatrix;
		this.xMin = 0;
		this.xMax = ColorMatrix.dims[0];

		this.yMin = 0;
		this.yMax = ColorMatrix.dims[1];

		this.zMin = Math.min.apply(Math,ColorMatrix.data);
		this.zMax = Math.max.apply(Math,ColorMatrix.data);

	};

	this.makeColormap = function(){
		var N = 100;

		var data = getDataset("dataset7.json");
		var c = data.c;

		this.colormap = new Array(N);
		for(var i=0;i<N;i++){
			this.colormap[i] = 'rgb(' + c.data[i] + ',' + c.data[i+N] + ',' + c.data[i+N+N] + ')';
		}
	};

	this.draw = function (ctx, offsetX, offsetY, scaleX, scaleY) {

		var cScale = 0.99999 * this.colormap.length/(this.zMax - this.zMin);
		var cOffset = -cScale * this.zMin;

		ctx.lineWidth = Math.min(2,scaleX/40);
		ctx.font = '14px serif';
		ctx.textAlign = "center";
		ctx.textBaseline = "middle";

		ctx.strokeStyle = this.edgeColor;
		for(var i = 0;i<this.m.dims[0];i++){
			var iScreen = 0.5 + Math.floor(i * scaleX + offsetX);
			var iScreenp1 = 0.5 + Math.floor((i+1) * scaleX + offsetX);
			var blockWidth = iScreenp1 - iScreen;

			// don't bother drawing columns that will be clipped anyway
			if(iScreenp1 < this.parent.left){
				continue;
			}
			if(iScreen > this.parent.right){
				break;
			}

			for(var j=0;j<this.m.dims[1];j++){
				var jScreen = 0.5 + Math.floor(j * scaleY + offsetY);
				var jScreenp1 =  0.5 + Math.floor((j+1) * scaleY + offsetY);
				var blockHeight = jScreen - jScreenp1;

				if(jScreenp1 > this.parent.bottom){
					continue;
				}
				if(jScreen < this.parent.top){
					break;
				}

				var index = i * m.dims[1] + j;
				var colorIndex = Math.floor(cOffset + cScale * m.data[index]);
				ctx.fillStyle = this.colormap[colorIndex];
				ctx.fillRect  (iScreen, jScreen - blockHeight, blockWidth + 1, blockHeight + 1);
				if(this.edgeColor){
					ctx.strokeRect(iScreen, jScreen - blockHeight, blockWidth, blockHeight);
				}
				// display values when zoomed in
				if (scaleX > 30){
					var alpha = Math.min(1,Math.max(0,(scaleX - 30)/40));
					var color = "rgba(0,0,0," + alpha + ")";
					ctx.fillStyle = color;
					var label = m.data[index].toFixed(2); 
					ctx.fillText(label, (iScreen + iScreenp1)/2,(jScreen + jScreenp1)/2);
				}
			}
		}
	};

	this.parent = null;
	this.colormap = null;
	this.edgeColor = null;
	this.makeColormap();
	this.setData(m);
	
}
