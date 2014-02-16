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
	_enyo.FloatingLayer_ is a control that provides a layer for controls that
	should be displayed above an application.
	The FloatingLayer singleton can be set as a control's parent to have the
	control float above an application, e.g.:

		create: enyo.inherit(function (sup) {
			return function() {
				sup.apply(this, arguments);
				this.setParent(enyo.floatingLayer);
			}
		})

	Note: It's not intended that users create instances of _enyo.FloatingLayer_.
*/
//* @protected
enyo.kind({
	name: "enyo.FloatingLayer",
	//* @protected
	create: enyo.inherit(function (sup) {
		return function() {
			sup.apply(this, arguments);
			this.setParent(null);
		};
	}),
	// detect when node is detatched due to document.body being stomped
	hasNode: enyo.inherit(function (sup) {
		return function() {
			sup.apply(this, arguments);
			if (this.node && !this.node.parentNode) {
				this.teardownRender();
			}
			return this.node;
		};
	}),
	render: enyo.inherit(function (sup) {
		return function() {
			this.parentNode = document.body;
			return sup.apply(this, arguments);
		};
	}),
	generateInnerHtml: function() {
		return "";
	},
	beforeChildRender: function() {
		if (!this.hasNode()) {
			this.render();
		}
	},
	teardownChildren: function() {
	}
});

enyo.floatingLayer = new enyo.FloatingLayer();