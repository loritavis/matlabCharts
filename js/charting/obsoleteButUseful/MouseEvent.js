"use strict";

function Interaction(canvas) {
	// This class is intended to abstract away as much as possible from 
	// event handling while also providing some useful services.
	
	
	// Create an Interaction and then put your handlers in some of these fields.
	// they will be called when the event occurs.
	this.mouseMotionHandler = null;
	this.mouseShiftMotionHandler = null;
	this.mouseDragHandler = null;
	this.mouseShiftDragHandler = null;
	this.mouseDownHandler = null;
	this.mouseUpHandler = null;
	this.doubleClickHandler = null;
	this.zoomHandler = null;
	this.zoomStartHandler = null;

	// These fields will be set before your function is called.
	// read them as you need, don't write them.
	this.mouseIsDown = false;
	// where the mouse last went down
	this.mouseDownX = 0;
	this.mouseDownY = 0;
	// where the mouse is now
	this.mouseMotionX = 0;
	this.mouseMotionY = 0;

	// Private stuff
	var thisInteraction = this;

	//TODO: MouseEvent should use function.call to provide the right "this" for event handlers.
	
	// event handling methods
	canvas.onmouseup = function(eventIn) {
		var event = new MouseEvent(eventIn);
		thisInteraction.mouseIsDown = false;
		if (thisInteraction.mouseUpHandler) {
			thisInteraction.mouseUpHandler(event);
		}
	};

	canvas.onmousedown = function(eventIn) {
		var event = new MouseEvent(eventIn);
		thisInteraction.mouseDownX = event.x;
		thisInteraction.mouseDownY = event.y;
		thisInteraction.mouseMotionX = event.x;
		thisInteraction.mouseMotionY = event.y;
		thisInteraction.mouseIsDown = true;
		if (thisInteraction.mouseDownHandler) {
			thisInteraction.mouseDownHandler(event);
		}
	};

	canvas.ondblclick = function(eventIn) {
		var event = new MouseEvent(eventIn);
		if (thisInteraction.doubleClickHandler) {
			thisInteraction.doubleClickHandler(event);
		}
	};

	canvas.onmousemove = function(eventIn) {
		var event = new MouseEvent(eventIn);
		var x = event.x;
		var y = event.y;

		if (thisInteraction.mouseIsDown) {
			var dx = x - thisInteraction.mouseMotionX;
			var dy = y - thisInteraction.mouseMotionY;
			if (event.shiftKey) {
				if (thisInteraction.mouseShiftDragHandler) {
					thisInteraction.mouseShiftDragHandler(event, dx, dy);
				}
			} else {
				if (thisInteraction.mouseDragHandler) {
					thisInteraction.mouseDragHandler(event, dx, dy);
				}
			}
			thisInteraction.mouseMotionX = x;
			thisInteraction.mouseMotionY = y;
		} else {
			if (event.shiftKey) {
				if (thisInteraction.mouseShiftMotionHandler) {
					thisInteraction.mouseShiftMotionHandler(event);
				}
			} else {
				if (thisInteraction.mouseMotionHandler) {
					thisInteraction.mouseMotionHandler(event);
				}
			}
		}
	};

	// Here is a block of code for handling the multi-touch
	// events we get from Safari on the IWhatever

	canvas.ontouchstart = function(event) {
		if (event.touches.length === 1) {
			event.preventDefault();
			var myEvent = new MouseEvent(event.touches[0]);

			thisInteraction.mouseDownX = myEvent.x;
			thisInteraction.mouseDownY = myEvent.y;
			thisInteraction.mouseMotionX = myEvent.x;
			thisInteraction.mouseMotionY = myEvent.y;
			thisInteraction.mouseIsDown = true;
			if (thisInteraction.mouseDownHandler) {
				thisInteraction.mouseDownHandler(myEvent);
			}

		} else if (event.touches.length === 2) {
			var myEvent1 = new MouseEvent(event.touches[0]);
			var myEvent2 = new MouseEvent(event.touches[1]);
			thisInteraction.xCenter = (myEvent1.x + myEvent2.x) / 2;
			thisInteraction.yCenter = (myEvent1.y + myEvent2.y) / 2;
			thisInteraction.mouseIsDown = true;
			if (thisInteraction.zoomStartHandler) {
				thisInteraction.zoomStartHandler();
			}
		}
	};

	canvas.ontouchend = function(event) {
		if (event.touches.length === 0) {
			event.preventDefault();
			thisInteraction.mouseIsDown = false;
			if (thisInteraction.mouseUpHandler) {
				thisInteraction.mouseUpHandler();
			}
		}
	};

	canvas.ontouchmove = function(event) {
		if (event.touches.length === 1) {
			event.preventDefault();
			var myEvent = new MouseEvent(event.touches[0]);

			if (thisInteraction.mouseIsDown) {
				var dx = myEvent.x - thisInteraction.mouseMotionX;
				var dy = myEvent.y - thisInteraction.mouseMotionY;
				if (event.shiftKey) {
					if (thisInteraction.mouseShiftDragHandler) {
						thisInteraction.mouseShiftDragHandler(myEvent, dx, dy);
					}
				} else {
					if (thisInteraction.mouseDragHandler) {
						thisInteraction.mouseDragHandler(myEvent, dx, dy);
					}
				}
				thisInteraction.mouseMotionX = myEvent.x;
				thisInteraction.mouseMotionY = myEvent.y;
			} else {
				if (myEvent.shiftKey) {
					if (thisInteraction.mouseShiftMotionHandler) {
						thisInteraction.mouseShiftMotionHandler(myEvent);
					}
				} else {
					if (thisInteraction.mouseMotionHandler) {
						thisInteraction.mouseMotionHandler(myEvent);
					}
				}
			}
		}
	};

	canvas.ongesturechange = function(event) {
		event.preventDefault();
		if (thisInteraction.zoomHandler) {
			thisInteraction.zoomHandler(event.scale);
		}
	};
	
	// You've probably noticed that the events that come from the canvas are always converted into one of these.
	// This object exists to provide mouse events that are stable across browsers.
	function MouseEvent(event) {
		var pos = targetCoordinates(event);
		this.x = pos[0];
		this.y = pos[1];
		this.shiftKey = event.shiftKey;
		this.button = event.button;
	}

	function targetCoordinates(eventIn) {
		// Some tragic cross browser tomfoolery to figure out where the mouse
		// event occurred relative to the target of the event.

		// find the document position of the event
		var docX = 0;
		var docY = 0;
		var event;

		if (!eventIn) {
			event = window.event;
		} else {
			event = eventIn;
		}

		if (event.pageX || event.pageY) {
			docX = event.pageX;
			docY = event.pageY;
		} else if (event.clientX || event.clientY) {
			docX = event.clientX + document.body.scrollLeft
					+ document.documentElement.scrollLeft;
			docY = event.clientY + document.body.scrollTop
					+ document.documentElement.scrollTop;
		}

		// find the document position of the target
		var target = event.target;
		var offsetX = target.offsetLeft;
		var offsetY = target.offsetTop;

		while (target.offsetParent) {
			target = target.offsetParent;
			offsetX += target.offsetLeft;
			offsetY += target.offsetTop;
		}

		return [ docX - offsetX, docY - offsetY ];
	}

	Object.seal(this);
}