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
		div.style.boxSizing = 'border-box';

		var k = new K();
		k.renderInto(div);

		var p = enyo.dom.calcNodePosition(k.hasNode()),
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
			this.log('bottom failed with value: ' + p.bottom + ' (should be ' + fromBottom + ')');
		}
		if (p.right !== fromRight) {
			this.log('right failed with value: ' + p.right + ' (should be ' + fromRight + ')');
		}
		if (p.width !== 10) {
			this.log('width failed with value: ' + p.width + ' (should be 10)');
		}
		if (p.height !== 10) {
			this.log('height failed with value: ' + p.height + ' (should be 10)');
		}

		// Now test measuring the element when a parent has a border
		div.style.border = "1px solid transparent";
		k.hasNode().style.border = "1px solid transparent";
		p = enyo.dom.calcNodePosition(k.hasNode()),
			// We don't count the right border on the element itself because that is taken into account automatically by the element's width measurement
			fromBottom -= 3,
			fromRight -= 3;
		if (p.top !== 11) {
			this.log('top with border failed with value: ' + p.top + ' (should be 11)');
		}
		if (p.left !== 11) {
			this.log('left with border failed with value: ' + p.left + ' (should be 11)');
		}
		if (p.bottom !== fromBottom) {
			this.log('bottom with border failed with value: ' + p.bottom + ' (should be ' + fromBottom + ')');
		}
		if (p.right !== fromRight) {
			this.log('right with border failed with value: ' + p.right + ' (should be ' + fromRight + ')');
		}
		if (p.width !== 12) {
			this.log('width with border failed with value: ' + p.width + ' (should be 12)');
		}
		if (p.height !== 12) {
			this.log('height with border failed with value: ' + p.height + ' (should be 12)');
		}

		// And finally, test positioning relative to another node
		p = enyo.dom.calcNodePosition(k.hasNode(), div),
			// Reset to div size - node height
			fromBottom = div.offsetHeight - 22,
			fromRight = div.offsetWidth - 22;
		if (p.top !== 10) {
			this.log('top relative to div failed with value: ' + p.top + ' (should be 10)');
		}
		if (p.left !== 10) {
			this.log('left relative to div failed with value: ' + p.left + ' (should be 10)');
		}
		if (p.bottom !== fromBottom) {
			this.log('bottom relative to div failed with value: ' + p.bottom + ' (should be ' + fromBottom + ')');
		}
		if (p.right !== fromRight) {
			this.log('right relative to div failed with value: ' + p.right + ' (should be ' + fromRight + ')');
		}
		if (p.width !== 12) {
			this.log('width relative to div failed with value: ' + p.width + ' (should be 12)');
		}
		if (p.height !== 12) {
			this.log('height relative to div failed with value: ' + p.height + ' (should be 12)');
		}

		// Clean up
		k.destroy();
		document.body.removeChild(div);

		this.finish(this.logMessages && this.logMessages.length ? 'Following measurements failed:' : '');
	}
});