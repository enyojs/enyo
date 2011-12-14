/**
A container for items presented at the bottom of the screen. By default, the
items are instances of <a href="#enyo.ToolButton">ToolButton</a>.

Example toolbar with three buttons equally spaced apart:

	{kind: "Toolbar", components: [
		{content: "foo"},
		{kind: "Spacer"},
		{content: "bar"},
		{kind: "Spacer"},
		{content: "baz"}
	]}

Other controls to put in a Toolbar are <a href="#enyo.RadioToolButtonGroup">RadioToolButtonGroup</a> and <a href="#enyo.ToolButtonGroup">ToolButtonGroup</a>.
*/
enyo.kind({
	name: "enyo.Toolbar",
	kind: enyo.HFlexBox,
	published: {
		//* Fade the toolbar into view when the virtual keyboard is hidden or raised
		fadeOnKeyboard: false
	},
	className: "enyo-toolbar",
	defaultKind: "ToolButton2",
	pack: "center",
	align: "center",
	components: [
		{kind: 'HFlexBox', flex:1, name:'client'},
		{name: "moreButton", showing:false, kind:"ToolButton", content:"more", onclick:"moreClick"}
	],
	create: function(config) {
		this.inherited(arguments);
		this.$.client.pack = this.pack;
		this.$.client.align = this.align;
		this.previouslyHidden = [];
	},
	rendered: function() {
		this.inherited(arguments);
		this.reconfigureControls();
	},
	//* @protected
	resizeHandler: function() {
		this.inherited(arguments);
		if (this.fadeOnKeyboard) {
			this.fadeIn();
		}
		this.reconfigureControls();
	},
	/* Shows/hides client controls and the 'more' button to make sure everything fits. */
	reconfigureControls: function() {
		var controls = this.getClientControls();
		var widths = [];
		var totalWidth = 0;
		var i;
		// Show previously hidden buttons so we can measure them:
		for (i=0; i<this.previouslyHidden.length; i++) {
			this.previouslyHidden[i].setShowing(true);
		}
		this.previouslyHidden.length=0;
		this.moreMenuDirty=true;
		this.$.moreButton.setShowing(false);
		// Calculate widths of our children:
		// Could be made faster by caching widths, if we assume items will not change size.
		var node = controls[0] && controls[0].hasNode();
		var nextNode;
		for (i=0; i<controls.length; i++) {
			nextNode = controls[i+1];
			nextNode = nextNode && nextNode.hasNode();
			if(nextNode) {
				widths[i] = nextNode.offsetLeft - node.offsetLeft; // Compare offsetLefts so margins are not ignored
			} else {
				widths[i] = node.offsetWidth;
			}
			node = nextNode;
			totalWidth += widths[i];
		}
		// Do we need a 'more' button?
		var toolbarWidth = this.$.client.hasNode().offsetWidth;
		var extraWidth = 0;
		if (totalWidth > toolbarWidth) {
			this.$.moreButton.setShowing(true);
			toolbarWidth = this.$.client.hasNode().offsetWidth;
			extraWidth = totalWidth - toolbarWidth;
		} else {
			this.$.moreButton.setShowing(false);
		}
		// hide ToolButtons until everything fits.
		// Do not hide non-toolbutton content since we don't plan to support moving it into the 'more' button.
		var toolbuttonCtor = enyo.constructorForKind(this.defaultKind);
		i = controls.length-1;
		while (i >= 0 && extraWidth > 0) {
			if (widths[i] > 0 && controls[i] instanceof toolbuttonCtor) {
				controls[i].setShowing(false);
				this.previouslyHidden.push(controls[i]);
				extraWidth -= widths[i];
			}
			i--;
		}
		// If we couldn't actually hide anything, don't leave the 'more' button showing!
		if (this.previouslyHidden.length === 0) {
			this.$.moreButton.setShowing(false);
		}
	},
	moreClick: function(inSender, clickEvent) {
		this.prepareMenu();
		this.moreMenu.openAroundControl(this.$.moreButton);
	},
	prepareMenu: function() {
		if (!this.moreMenu) {
			this.moreMenu = this.createComponent({
				kind: "Menu",
				onBeforeClose: "moreMenuClosing", 
				onBeforeOpen: "moreMenuOpening"
			//	defaultKind: this.itemKind
			}, {isChrome: true});
			this.moreMenuDirty=true;
		} else if (this.moreMenuDirty) {
			this.moreMenu.destroyClientControls();
		}
		// Rebuild more menu items if needed.
		if(this.moreMenuDirty) {
			var moreMenu=this.moreMenu;
			this.previouslyHidden.forEach(function(c) {
				// Items are configured to have the same parent & click handler as the original toolbuttons.
				moreMenu.createComponent({content: c.getContent(), icon:c.icon, owner:c.owner, onclick: c.onclick});
			});
			moreMenu.render();
			this.moreMenuDirty = false;
		}
	},
	moreMenuClosing: function(inSender) {
		this.$.moreButton.setDepressed(false);
	},
	moreMenuOpening: function(inSender) {
		this.$.moreButton.setDepressed(true);
	},
	fadeIn: function() {
		this.removeClass("enyo-toolbar-fade-in");
		this.addClass("enyo-toolbar-snap-out");
		enyo.asyncMethod(this, "_fadeIn");
	},
	_fadeIn: function() {
		this.addClass("enyo-toolbar-fade-in");
	}
});
