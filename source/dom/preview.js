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