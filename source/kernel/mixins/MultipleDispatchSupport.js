/*
	Copyright 2014 LG Electronics, Inc.

	Licensed under the Apache License, Version 2.0 (the "License");
	you may not use this file except in compliance with the License.
	You may obtain a copy of the License at

	http://www.apache.org/licenses/LICENSE-2.0

	Unless required by applicable law or agreed to in writing, software
	distributed under the License is distributed on an "AS IS" BASIS,
	WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
	See the License for the specific language governing permissions and
	limitations under the License.
*/
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
