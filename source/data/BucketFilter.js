(function (enyo) {
	
	var kind = enyo.kind
		, inherit = enyo.inherit;
	
	var Filter = enyo.Filter;
	
	/**
		@public
		@class enyo.BucketFilter
	*/
	var BucketFilter = kind(
		/** @lends enyo.BucketFilter.prototype */ {
		name: "enyo.BucketFilter",
		kind: Filter,
		noDefer: true,
		
		/**
			@public
		*/
		filterName: "",
		
		/**
			@public
		*/
		defaultFilterName: null,
		
		/**
			@public
		*/
		reset: function (opts) {
			// @TODO: What should this actually do?
			return this.set("filterName", this.defaultFilterName, opts);
		},
		
		/**
			@private
		*/
		defaultProps: {
			kind: "enyo.BucketFilter"
		},
		
		/**
			@private
		*/
		observers: [
			{path: "filterName", method: "onFilterNameChange"},
			{path: "filterCollection", method: "onFilterCollectionChange"}
		],
		
		/**
			@private
		*/
		adjustComponentProps: inherit(function (sup) {
			return function (props) {
				sup.apply(this, arguments);
				
				if (props.default) this.defaultFilterName = props.name;
			};
		}),
		
		/**
			@private
		*/
		constructed: inherit(function (sup) {
			return function () {
				sup.apply(this, arguments);
				
				if (this.defaultFilterName) this.set("filterName", this.defaultFilterName);
			};
		}),
		
		/**
			@private
		*/
		onOwnerEvent: function (sender, e, props) {
			var models = props.models
				, filtered = models.filter(this.method, sender);
			this.models.set("models", filtered);
			this.emit("reset", {/* for partial backward compatibility */records: filtered, /* prefered */models: filtered});
		},
		
		/**
			@private
		*/
		onFilterNameChange: function () {
			var filter = this[this.filterName];
			// even if there isn't a filter we want to do this so the owner will revert
			// to using its default model-set because there isn't an active filter
			this.set("filterCollection", filter);
		},
		
		/**
			@private
		*/
		onFilterCollectionChange: function (was, is) {
			if (was) was.off("*", this.onFilterCollectionEvent, this);
			// if the current filter has been updated it will have caused a set on this property
			// with the correct filtered collection
			if (is) {
				is.on("*", this.onFilterCollectionEvent, this);
				this.set("models", is.models);
			}
			
			// otherwise we need to reset to our root set whatever that might be
			else this.set("models", (this.collection || this._collection).models);
		},
		
		/**
			@private
		*/
		onFilterCollectionEvent: function (sender, e, props) {
			if (!this.isSilenced()) this.emit(e, props);
		}
	});
	
})(enyo);