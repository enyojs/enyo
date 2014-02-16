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
	_enyo.BaseLayout_ provides a basic layout strategy, positioning contained
	components with the _enyo-positioned_ layoutClass. In addition, it adjusts
	the layout when _reflow_ is called, removing or adding the _enyo-fit_ class
	for components that have set the _fit_ property.
*/
enyo.kind({
	name: "enyo.BaseLayout",
	kind: "enyo.Layout",
	layoutClass: "enyo-positioned",
	//* Adds or removes the _enyo-fit_ class for components whose _fit_ property
	//* has been set.
	reflow: function() {
		enyo.forEach(this.container.children, function(c) {
			if (c.fit !== null) {
				c.addRemoveClass("enyo-fit", c.fit);
			}
		}, this);
	}
});

//enyo.Control.prototype.layoutKind = "enyo.BaseLayout";