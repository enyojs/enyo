//* @protected
enyo.kind({
	name: "enyo._DragAvatar",
	style: "position: absolute; z-index: 10; pointer-events: none; cursor: move;",
	showing: false,
	showingChanged: function() {
		this.inherited(arguments);
		document.body.style.cursor = this.showing ? "move" : null;
	}
});

//* @public
/**
	_enyo.DragAvatar_ creates a control to follow the pointer when dragging. It
	automatically displays the avatar control when the user drags, and updates
	its position relative to the current pointer location.

		enyo.kind({
			name: "App",
			handlers: {
				ondrag: "drag",
				ondragfinish: "dragFinish",
			},
			components: [
				{name:"dragAvatar", kind:"DragAvatar",
					components: [{tag: "img", src: "images/icon.png"}]
				}
			],
			drag: function(inSender, inEvent) {
				this.$.dragAvatar.drag(inEvent);
			},
			dragFinish: function(inSender, inEvent) {
				this.$.dragAvatar.hide();
			}			
		});
*/
enyo.kind({
	name: "enyo.DragAvatar",
	kind: enyo.Component,
	published: {
		showing: false,
		offsetX: 20,
		offsetY: 30
	},
	//* @protected
	initComponents: function() {
		this.avatarComponents = this.components;
		this.components = null;
		this.inherited(arguments);
	},
	requireAvatar: function() {
		// FIXME: there is nobody to call teardownRender on this.avatar
		// if document.body.innerHTML has been written over, his node is invalid
		// we should have a trap for this condition here
		if (!this.avatar) {
			this.avatar = this.createComponent({kind: enyo._DragAvatar, parentNode: document.body, showing: false, components: this.avatarComponents}).render();
		}
	},
	showingChanged: function() {
		this.avatar.setShowing(this.showing);
		document.body.style.cursor = this.showing ? "move" : null;
	},
	//* @public
	drag: function(inEvent) {
		this.requireAvatar();
		this.avatar.setBounds({top: inEvent.pageY - this.offsetY, left: inEvent.pageX + this.offsetX});
		this.show();
	},
	show: function() {
		this.setShowing(true);
	},
	hide: function() {
		this.setShowing(false);
	}
});

