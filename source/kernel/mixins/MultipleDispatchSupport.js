//*@public
/**
	The purpose of these methods is to extend the capability of an
	[enyo.Component](#enyo.Component) to have multiple dispatch targets instead of
	the default of just one. These are synchronously executed event dispatches and
	cannot be interrupted.
*/
enyo.MultipleDispatchSupport = {
	name: "MultipleDispatchSupport",
	/**
		Adds an _enyo.Component_ as a target of events emitted by this object.
	*/
	addDispatchTarget: function (c) {
		var dt = this._dispatchTargets;
		if (c && !~enyo.indexOf(c, dt)) {
			dt.push(c);
		}
	},
	/**
		Removes the _enyo.Component_ as a target if it is registered
		with this object.
	*/
	removeDispatchTarget: function (c) {
		var dt = this._dispatchTargets, i;
		i = enyo.indexOf(c, dt);
		if (i > -1) {
			dt.splice(i, 1);
		}
	},
	//*@protected
	bubbleUp: enyo.inherit(function (sup) {
		return function (name, event, sender) {
			if (this._dispatchDefaultPath) {
				sup.apply(this, arguments);
			}
			var dt = this._dispatchTargets;
			for (var i=0, t; (t=dt[i]); ++i) {
				if (t && !t.destroyed) {
					t.dispatchBubble(name, event, sender);
				}
			}
		};
	}),
	ownerChanged: enyo.inherit(function (sup) {
		return function () {
			sup.apply(this, arguments);
			var o = this.owner;
			this._dispatchDefaultPath = !! o;
		};
	}),
	constructor: enyo.inherit(function (sup) {
		return function () {
			this._dispatchTargets = [];
			return sup.apply(this, arguments);
		};
	}),
	destroy: enyo.inherit(function (sup) {
		return function () {
			this._dispatchTargets = null;
			sup.apply(this, arguments);
		};
	}),
	/**
		Meta-properties used:
		`_dispatchTargets`
	*/
	_dispatchDefaultPath: false
};
