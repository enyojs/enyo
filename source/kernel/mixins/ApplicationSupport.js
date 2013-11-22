//*@public
/**
	These properties are applied to all _enyo.Components_ and
	ensures that, when created in the scope of an _enyo.Application_,
	they will have a reference to their _owner-application_ via the
	`app` property.
*/
enyo.ApplicationSupport = {
	name: "ApplicationSupport",
	/**
		This will be the reference to the _owner-application_ if the
		_enyo.Component_ was created in the scope of an _enyo.Application_:
		`app`
	*/
	adjustComponentProps: enyo.inherit(function (sup) {
		return function (props) {
			props.app = props.app || this.app || (this instanceof enyo.Application && this);
			sup.apply(this, arguments);
		};
	}),
	destroy: enyo.inherit(function (sup) {
		return function () {
			// release the reference to the application
			this.app = null;
			sup.apply(this, arguments);
		};
	})
};
