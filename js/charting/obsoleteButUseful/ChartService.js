"use strict";

define(["MW/remote/MessageService"], function(MessageService) {
	//	The chart service subscribes to a connector channel and waits for instructions.
	//	instructions can be create, delete, or set properties on a chart.
	//	the client of the ChartService is expected to call start on it.
	//	the single argument to start is a function that will be called each time a chart is created.
	//	this function will be passed the newly created chart. The function can do what it will with the chart,
	//	but it should probably wrap in in an ElementWrapper (canvas) and insert it into the dom somewhere if
	//	you want to actually see the chart.

	var service = new Object();

	service.start = function(EmbeddingFramework) {
		// keep track of the element-id association
		var elements = new Array();
		var charts = new Array();

		// define a function to handle connector messages to this channel.
		function messageHandler(message) {
			var data = message.data;
			// What does this message ask us to do?
			switch (data.action) {
				case 'create':
					// Any chart created this way needs to be in this module.
					// Also, we assume that the module returns a no-argument
					// constructor for this chart.
					var chartType = data.type;
					var chartPackage = "charting/charts/" + chartType;
					require([chartPackage], function(constructor) {
						var chart = new constructor(data.argumentsX); // .arguments is a special javascript thing, we should change our field name
						charts[data.id] = chart;
					});
					break;
				case 'set':
					// find the element we are talking about
					var element = elements[data.id];

					// make the name of the set method: setPname
					var methodName = "set" + data.name;

					// in the special case of the setSize method, we call the element
					// otherwise, the chart. How shall we handle that?
					if (data.name == 'Size') {
						element[methodName](data.value);
					} else {
						var chart = charts[data.id];
						chart[methodName](data.value);
					}
					break;
				case 'delete':
					try {
						// delete the canvas element and the chart goes too.
						var element = elements[data.id];
						document.body.removeChild(element);
					} catch(err) {
						console.log('Error: attempt to delete non-existing id: ' + data.id);
					}
					break;
				case 'show':
					var chart = charts[data.id];
					EmbeddingFramework.showChart(chart);
					break;
				case 'add':
					var parent = charts[data.id];
					var child = charts[data.newChild];
					parent.add(child);
					break;
				case 'print':
					var chart = charts[data.id];
					var eps = chart.print();
					var message = {
						action : 'print',
						eps : eps
					};
					MessageService.publish("/hi/ho", message);

					break;
			}
		}

		// start handling messages
		MessageService.start();
		MessageService.subscribe("/charting/MCOS-JavaScriptBridge", messageHandler);
		Object.seal(this);
	};

	return service;
}); 