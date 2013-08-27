//*@public
/**
*/
enyo.kind({
	name: "enyo.Collection",
	kind: enyo.MultipleDispatchComponent,
	/**
		This represents the _kind_ of records the _collection_ will house. By
		default it is simply _enyo.Model_ but can be set to any _kind_ of model.
	*/
	model: enyo.Model
});