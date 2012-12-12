enyo.kind({
	name: "ViewportPositioningTest",
	kind: enyo.TestSuite,
	
	testMeasuringViewportCoordinates: function() {
		var K = enyo.kind({
			kind: enyo.Control,
			style: "position: absolute; top: 10px; left: 10px; width: 10px; height: 10px;"
		});

		// Similar to ControlTest, create a testing div to test DOM information with (delete at end)
		var div = document.createElement("div");
		document.body.appendChild(div);
		// Apply fixed positioning so that we know where things should be relative to the viewport
		div.style.position = 'fixed';
		div.style.top = '0px';
		div.style.left = '0px';
		div.style.width = '100%';
		div.style.height = '100%';

		var k = new K();
		k.renderInto(div);
		
		var p = enyo.dom.calcViewportPositionForNode(k.hasNode()),
			// Bottom and right require calculating viewport size
			fromBottom = (document.body.parentNode.offsetHeight > enyo.dom.getWindowHeight() ? enyo.dom.getWindowHeight() - document.body.parentNode.scrollTop : document.body.parentNode.offsetHeight) - 20,
			fromRight = (document.body.parentNode.offsetWidth > enyo.dom.getWindowWidth() ? enyo.dom.getWindowWidth() - document.body.parentNode.scrollLeft : document.body.parentNode.offsetWidth) - 20;
		if (p.top !== 10) {
			this.log('top failed with value: ' + p.top + ' (should be 10)');
		}
		if (p.left !== 10) {
			this.log('left failed with value: ' + p.left + ' (should be 10)');
		}
		if (p.bottom !== fromBottom) {
			this.log('bottom measurement failed with value: ' + p.bottom + ' (should be ' + fromBottom + ')');
		}
		if (p.right !== fromRight) {
			this.log('right measurement failed with value: ' + p.right + ' (should be ' + fromRight + ')');
		}
		if (p.width !== 10) {
			this.log('width failed with value: ' + p.width + ' (should be 10)');
		}
		if (p.height !== 10) {
			this.log('height failed with value: ' + p.height + ' (should be 10)');
		}
			
		// Clean up
		k.destroy();
		document.body.removeChild(div);
		
		this.finish(this.logMessages && this.logMessages.length ? 'Following measurements failed:' : '');
	}
});