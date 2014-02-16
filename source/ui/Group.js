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
	_enyo.Group_ provides a wrapper around multiple elements.  It enables the
	creation of radio groups from arbitrary components supporting the
	[GroupItem](#enyo.GroupItem) API.
*/
enyo.kind({
	name: "enyo.Group",
	published: {
		/**
			If true, only one GroupItem in the component list may be active at
			a given time.
		*/
		highlander: true,
		//* If true, an active highlander item may be deactivated
		allowHighlanderDeactivate: false,
		//* The control that was last selected
		active: null,
		/**
			The `groupName` property is used to scope this group to a certain
			set of controls.  When used, the group only controls activation of controls who
			have the same `groupName` property set on them.
		*/
		groupName: null
	},
	//* @protected
	handlers: {
		onActivate: "activate"
	},
	activate: function(inSender, inEvent) {
		if ((this.groupName || inEvent.originator.groupName) && (inEvent.originator.groupName != this.groupName)) {
			return;
		}
		if (this.highlander) {
			// we can optionally accept an `allowHighlanderDeactivate` property in inEvent without directly
			// specifying it when instatiating the group - used mainly for custom kinds requiring deactivation
			if (inEvent.allowHighlanderDeactivate !== undefined && inEvent.allowHighlanderDeactivate !== this.allowHighlanderDeactivate) {
				this.setAllowHighlanderDeactivate(inEvent.allowHighlanderDeactivate);
			}
			// deactivation messages are ignored unless it's an attempt
			// to deactivate the highlander
			if (!inEvent.originator.active) {
				// this clause prevents deactivating a grouped item once it's been active,
				// as long as `allowHighlanderDeactivate` is false. Otherwise, the only
				// proper way to deactivate a grouped item is to choose a new highlander.
				if (inEvent.originator == this.active) {
					if (!this.allowHighlanderDeactivate) {
						this.active.setActive(true);
					} else {
						this.setActive(null);
					}
				}
			} else {
				this.setActive(inEvent.originator);
			}
		}
	},
	activeChanged: function(inOld) {
		if (inOld) {
			inOld.setActive(false);
			inOld.removeClass("active");
		}
		if (this.active) {
			this.active.addClass("active");
		}
	}
});
