(function (oScope, enyo) {

	var aQueue          = [],
		bFlushScheduled = false;
	
	var fFlush = function () {
			while (aQueue.length) {
				fRun.apply(oScope, aQueue.shift());
			}
			bFlushScheduled = false;
		},
		fRun = function (f, oContext) {
			f.call(oContext || enyo.global);
		};
	
	/*********** ENYO PUBLIC **********/

	enyo.rendered = function (f, oContext) {
		aQueue.push([f, oContext]);
		if (!bFlushScheduled) {
			enyo.asyncMethod(oScope, fFlush);
			bFlushScheduled = true;
		}
	};
	
	//* Adds control to enyo.roots; called from write(), renderInto(), ViewController.renderInto()
	enyo.addToRoots = function(oRoot) {
		if (!enyo.exists(enyo.roots)) {
			enyo.roots = [ oRoot ];
		} else {
			enyo.roots.push(oRoot);
		}
		
		var fRendered = oRoot.rendered;
		oRoot.rendered = function() {
			fRendered.apply(oRoot, []);
			fFlush();
		};
		oRoot._isRoot = true;
	};
	
})(window, enyo);
