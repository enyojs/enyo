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
	_enyo.Anchor_ implements an HTML anchor (&lt;a&gt;) tag. Published properties
	allow you to bind the anchor's _href_ and _title_ attributes to appropriate
	fields on data objects.
*/
enyo.kind({
	name: "enyo.Anchor",
	kind: "enyo.Control",
	tag: "a",
	//* @public
	published: {
		//* Maps to the _href_ attribute of the &lt;a&gt; tag
		href: "",
		//* Maps to the _title_ attribute of the &lt;a&gt; tag
		title: ""
	},
	//* @protected
	create: enyo.inherit(function (sup) {
		return function() {
			sup.apply(this, arguments);
			this.hrefChanged();
			this.titleChanged();
		};
	}),
	//* @protected
	hrefChanged: function() {
		this.setAttribute("href", this.href);
	},
	//* @protected
	titleChanged: function() {
		this.setAttribute("title", this.title);
	}
});
