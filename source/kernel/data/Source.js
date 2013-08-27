(function (enyo) {
	//*@protected
	var normalize = function (url) {
		return url.replace(/([^:]\/)(\/+)/g, "$1");
	};
	var http = /^http/;
	//*@public
	/**
		The _enyo.Source_ kind is used to create _drivers_ for _enyo.Stores_. They
		are an abstract kind that provides an interface to overload for a particular
		_drivers_ implementation needs. By default, _enyo.store_ will have the _localStorage_
		_source_ already, see that for an example of how to create a driver.
	*/
	enyo.kind({
		name: "enyo.Source",
		kind: null,
		/**
		*/
		find: function () {
			
		}
	});
})(enyo);