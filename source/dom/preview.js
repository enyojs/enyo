/**
	Dispatcher preview feature: allow control ancestors of the event
	target a chance (eldest first) to react via implementing "previewDomEvent."
*/
//* @protected
(function() {
	var fn = "previewDomEvent";
	//
	var preview = {
		feature: function(e) {
			preview.dispatch(e, e.dispatchTarget);
		},
		dispatch: function(e, c) {
			var l$ = this.buildLineage(c);
			// handlers return true to abort preview and prevent default event processing.
			for (var i=0, l; (l=l$[i]); i++) {
				if (l[fn] && l[fn](e) === true) {
					e.preventDispatch = true;
					return;
				}
			}
		},
		// we ascend making a list of enyo controls
		// NOTE: the control is considered its own ancestor
		buildLineage: function(inControl) {
			var l = [], c = inControl;
			while (c) {
				l.unshift(c);
				c = c.parent;
			}
			return l;
		}
	};
	//
	enyo.dispatcher.features.push(preview.feature);
})();