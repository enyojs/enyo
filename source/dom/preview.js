(function(enyo, scope) {
	/**
	* Dispatcher preview feature
	* 
	* Allow {@link enyo.Control} ancestors of the `event target` a chance (eldest first) to react
	* via implementing "`previewDomEvent`" event.
	*
	* @private
	*/
	var fn = 'previewDomEvent';
	var preview = 
		/** @lends enyo.dispatcher.features */ {

		/**
		* @private
		*/
		feature: function(e) {
			preview.dispatch(e, e.dispatchTarget);
		},

		/**
		* @returns {(Boolean|undefined)} Handlers return `true` to abort preview and prevent default
		*	event processing.
		*
		* @private
		*/
		dispatch: function(evt, control) {
			var i, l,
			lineage = this.buildLineage(control);
			for (i=0; (l=lineage[i]); i++) {
				if (l[fn] && l[fn](evt) === true) {
					evt.preventDispatch = true;
					return;
				}
			}
		},

		/**
		* We ascend, making a list of [enyo controls]{@link enyo.Control}.
		*
		* _NOTE: the control is considered its own ancestor._
		*
		* @private
		*/
		buildLineage: function(control) {
			var lineage = [],
				c = control;
			while (c) {
				lineage.unshift(c);
				c = c.parent;
			}
			return lineage;
		}
	};

	enyo.dispatcher.features.push(preview.feature);

})(enyo, this);