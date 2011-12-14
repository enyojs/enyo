//* @public

/**
	Events that have no explicit target flow to instances of this component.

	Create an WindowEvents wherever you want to handle these global events.
	Note that a global event will flow to all instances of WindowEvents, so
	application code will need to handle conflicts.

	Example: 

		...
		components: [
			{kind: "WindowEvents", onWindowRotated: "windowRotated"}
		...
		],
		...
		windowRotated: function(inSender) {
			// do work when orientation changes
		}
*/
enyo.kind({
	name: "enyo.WindowEvents",
	kind: enyo.Component,
	events: {
		//* sent after window has completed loading
		onLoad: '',
		//* sent when window is closed
		onUnload: '',
		//* sent when the window cannot be loaded properly
		onError: '',
		//* sent when user brings window to the front
		onWindowActivated: '',
		//* sent when user leaves the window
		onWindowDeactivated: '',
		/** sent when window parameters are changed via <a href="#enyo.windows">enyo.windows</a> methods 
		    _activate_ or _setWindowParams_ */
		onWindowParamsChange: '',
		//* sent when the application has been relaunched by the system manager
		onApplicationRelaunch: '',
		//* sent when user rotates device
		onWindowRotated: '',
		//* sent when user taps on app menu area or hits the app menu key (ctrl+tilde) on desktop
		onOpenAppMenu: '',
		//* sent when the app menu is dismissed
		onCloseAppMenu: '',
		//* @protected
		//* sent when a "keepAlive" app window is hidden
		onWindowHidden: '',
		//* sent when a "keepAlive" app window is shown
		onWindowShown: '',
		//* @public
		//* sent for DOM keyup event
		onKeyup: '',
		//* sent for DOM keydown event
		onKeydown: '',
		//* sent for DOM keypress event
		onKeypress: '',
		//* send when user makes a back gesture or hits ESC key
		onBack: '',
		/** send when keyboard state has changed:
		
			- `true` when keyboard is *going to be* shown (before resize)
			- `false` when keyboard *has been* hidden (after resize)
		*/
		onKeyboardShown: ''
	},
	//* @protected
	create: function() {
		this.inherited(arguments);
		enyo.dispatcher.rootHandler.addListener(this);
	},
	destroy: function() {
		enyo.dispatcher.rootHandler.removeListener(this);
		this.inherited(arguments);
	},
	dispatchDomEvent: function(e) {
		//this.log('on' + enyo.cap(e.type));
		return this.dispatchIndirectly('on' + enyo.cap(e.type), arguments);
	}
});
