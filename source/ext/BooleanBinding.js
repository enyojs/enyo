(function (enyo, scope) {
	
	/**
	* A {@link enyo.Binding} that coerces any value passing through it to be a {@glossary Boolean}
	* value. Use this by setting the `kind` property of your [binding]{@link enyo.Binding}
	* declarations.
	*
	* @class enyo.BooleanBinding
	* @extends enyo.Binding
	* @public
	*/
	enyo.kind({
		name: 'enyo.BooleanBinding',
		kind: enyo.Binding,
		//*@protected
		transform: function (value) {
			return !! value;
		}
	});

	/**
	* A {@link enyo.Binding} that checks for empty values. It will be `true` if there is some
	* value but `false` if it is an empty {@glossary String}, `null` or `undefined`.
	*
	* @class enyo.EmptyBinding
	* @extends enyo.Binding
	* @public
	*/
	enyo.kind({
		name: 'enyo.EmptyBinding',
		kind: enyo.Binding,
		//*@protected
		transform: function (value) {
			return (value !== '' && value != null);
		}
	});

})(enyo, this);