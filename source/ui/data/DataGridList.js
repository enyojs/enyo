(function (enyo) {


	//*@public
	/**
	*/
	enyo.kind({

		// ...........................
		// PUBLIC PROPERTIES

		//*@public
		name: "enyo.DataGridList",

		//*@public
		kind: "enyo.DataList",

		// ...........................
		// PROTECTED PROPERTIES

		//*@protected
		classes: "enyo-data-grid-list",

		// ...........................
		// COMPUTED PROPERTIES

		// ...........................
		// PUBLIC METHODS

		// ...........................
		// PROTECTED METHODS

		//*@protected
		initComponents: function () {
			this.inherited(arguments);
			var $kind = this._childKind;
			$kind.extend({
				classes: "enyo-data-grid-list-item"
			});
		}

		// ...........................
		// OBSERVERS

	});

})(enyo);