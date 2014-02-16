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
	_enyo.Layout_ is the base kind for layout kinds.  These are used by
	<a href="#enyo.UiComponent">enyo.UiComponent</a>-based controls to allow for
	arranging of the children by setting the _layoutKind_ property.

	Derived kinds will usually provide their own _layoutClass_ property to
	affect the CSS rules used, and may also implement the _flow_ and _reflow_
	methods. _flow_ is called during control rendering, while _reflow_ is called
	when the associated control is resized.
*/
enyo.kind({
	name: "enyo.Layout",
	kind: null,
	//* CSS class that's added to the control using this layout kind
	layoutClass: "",
	//* @protected
	constructor: function(inContainer) {
		this.container = inContainer;
		if (inContainer) {
			inContainer.addClass(this.layoutClass);
		}
	},
	destroy: function() {
		if (this.container) {
			this.container.removeClass(this.layoutClass);
		}
	},
	// static property layout
	flow: function() {
	},
	// dynamic measuring layout
	reflow: function() {
	}
});
