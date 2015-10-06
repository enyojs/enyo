var kind = require('enyo/kind');
var Control = require('enyo/Control');
var dom = require('enyo/dom');

describe('Meauring Viewport Positioning', function () {

	describe('usage', function () {
		var div, k, p, fromBottom, fromRight;

		before(function () {
			var K = kind({
				kind: Control,
				style: "position: absolute; top: 10px; left: 10px; width: 10px; height: 10px;"
			});

			// Similar to ControlTest, create a testing div to test DOM information with (delete at end)
			div = document.createElement("div");
			document.body.appendChild(div);
			// Apply fixed positioning so that we know where things should be relative to the viewport
			div.style.position = 'fixed';
			div.style.top = '0px';
			div.style.left = '0px';
			div.style.width = '100%';
			div.style.height = '100%';
			div.style.boxSizing = 'border-box';

			k = new K();
			k.renderInto(div);

			p = dom.calcNodePosition(k.hasNode());
			// Bottom and right require calculating viewport size
			fromBottom = (document.body.parentNode.offsetHeight > dom.getWindowHeight() ? dom.getWindowHeight() - document.body.parentNode.scrollTop : document.body.parentNode.offsetHeight) - 20;
			fromRight = (document.body.parentNode.offsetWidth > dom.getWindowWidth() ? dom.getWindowWidth() - document.body.parentNode.scrollLeft : document.body.parentNode.offsetWidth) - 20;
		});

		after(function () {
			// Clean up
			k.destroy();
			document.body.removeChild(div);
		});

		describe('Relative to viewport without border', function () {
			it('should have top set to 10', function () {
				expect(p.top).to.equal(10);
			});

			it('should have left set to 10', function () {
				expect(p.left).to.equal(10);
			});

			it('should have bottom set to ' + fromBottom, function () {
				expect(p.bottom).to.equal(fromBottom);
			});

			it('should have right set to ' + fromRight, function () {
				expect(p.right).to.equal(fromRight);
			});

			it('should have width set to 10', function () {
				expect(p.width).to.equal(10);
			});

			it('should have height set to 10', function () {
				expect(p.height).to.equal(10);
			});
		});

		describe('Relative to viewport with border', function () {
			before(function () {
				// Now test measuring the element when a parent has a border
				div.style.border = "1px solid transparent";
				k.hasNode().style.border = "1px solid transparent";
				p = dom.calcNodePosition(k.hasNode());
				// We don't count the right border on the element itself because that is taken into account automatically by the element's width measurement
				fromBottom -= 3;
				fromRight -= 3;
			});

			it('should have top set to 11', function () {
				expect(p.top).to.equal(11);
			});

			it('should have left set to 11', function () {
				expect(p.left).to.equal(11);
			});

			it('should have bottom taking border into account', function () {
				expect(p.bottom).to.equal(fromBottom);
			});

			it('should have right taking border into account', function () {
				expect(p.right).to.equal(fromRight);
			});

			it('should have width set to 12', function () {
				expect(p.width).to.equal(12);
			});

			it('should have height set to 12', function () {
				expect(p.height).to.equal(12);
			});
		});

		describe('Relative to another node with border', function () {
			before(function () {
				// And finally, test positioning relative to another node
				p = dom.calcNodePosition(k.hasNode(), div);
				// Reset to div size - node height
				fromBottom = div.offsetHeight - 22;
				fromRight = div.offsetWidth - 22;
			});

			it('should have top relative to div', function () {
				expect(p.top).to.equal(10);
			});

			it('should have left relative to div', function () {
				expect(p.left).to.equal(10);
			});

			it('should have bottom relative to div', function () {
				expect(p.bottom).to.equal(fromBottom);
			});

			it('should have right relative to div', function () {
				expect(p.right).to.equal(fromRight);
			});

			it('should have width relative to div', function () {
				expect(p.width).to.equal(12);
			});

			it('should have height relative to div', function () {
				expect(p.width).to.equal(12);
			});
		});
	});
});