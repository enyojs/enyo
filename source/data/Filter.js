(function (enyo) {
	
	var kind = enyo.kind
		, inherit = enyo.inherit
		, nop = enyo.nop
		, remove = enyo.remove
		, only = enyo.only
		, clone = enyo.clone
		, mixin = enyo.mixin
		, constructorForKind = enyo.constructorForKind;
	
	var Collection = enyo.Collection;
	
	/**
		@NOTE: add, remove, fetch, sort, commit...all ALWAYS act on the full collection.
	
		@public
		@class enyo.Filter
	*/
	var Filter = kind(
		/** @lends enyo.Filter.prototype */ {
		name: "enyo.Filter",
		kind: Collection,
		noDefer: true,
		
		/**
			@public
		*/
		collection: null,
		
		/**
			@private
		*/
		defaultProps: {
			kind: "enyo.Filter"
		},
		
		/**
			@private
		*/
		adjustComponentProps: inherit(function (sup) {
			return function (props) {
				// all filters are public...always...except when they aren't...
				props.publish !== false && (props.publish = true);
				sup.apply(this, arguments);
				if (typeof props.kind == "string") props.kind = constructorForKind(props.kind);
				if (props.kind.prototype instanceof Filter) {
					if (!props.name) throw "enyo.Filter.adjustComponentProps: All child filters must have a name";
					if (!props.method) props.method = props.name;
					if (typeof props.method == "string") props.method = this[props.method];
					if (typeof props.method != "function") props.method = function () { return true; };
				}
			};
		}),
		
		/**
			@private
		*/
		observers: [
			{path: "collection", method: "onCollectionChange"}
		],
		
		
		/**
			@private
		*/
		commit: inherit(function (sup) {
			return function (opts) {
				var is = this.models
					, dit = this
					, shouldBe = this.collection.models
					, options = opts? clone(opts): {};
				
				options.success = function () {
					// we need to ensure we put it back to the current filtered set if necessary...
					if (is !== shouldBe) dit.set("models", is);
					if (opts && opts.success) opts.success.apply(null, arguments);
				};
				
				options.error = function () {
					if (is !== shouldBe) dit.set("models", is);
					if (opts && opts.error) opts.error.apply(null, arguments);
				};
				
				// facade the correct, complete models so that it will always be complete
				// @NOTE: If ever I get my wish and have time to move us to asynchronous events (et al)
				// this type of operation will no longer work as-is (like so many others)
				if (is !== shouldBe) this.set("models", shouldBe, {silent: true});
				// sup.apply(this, arguments);
				sup.call(this, options);
				return this;
			};
		}),
		
		fetch: inherit(function (sup) {
			return function (opts) {
				var is = this.models
					, dit = this
					, shouldBe = this.collection.models
					, options = opts? clone(opts): {};
					
				options.success = function () {
					// we need to ensure we put it back to the current filtered set if necessary...
					if (is !== shouldBe) dit.set("models", is);
					if (opts && opts.success) opts.success.apply(null, arguments);
				};
				
				options.error = function () {
					if (is !== shouldBe) dit.set("models", is);
					if (opts && opts.error) opts.error.apply(null, arguments);
				};
				
				if (is !== shouldBe) this.set("models", shouldBe, {silent: true});
				// sup.apply(this, arguments);
				sup.call(this, options);
				return this;
			};
		}),
		
		sort: inherit (function (sup) {
			return function () {
				var is = this.models
					, shouldBe = this.collection.models;
				
				if (is !== shouldBe) this.set("models", shouldBe, {silent: true});
				sup.apply(this, arguments);
				return is !== shouldBe? this.set("models", is): this;
			};
		}),
		
		/**
			@public
		*/
		reset: nop,
		
		/**
			@private
		*/
		constructed: inherit(function (sup) {
			return function () {
				var fetch = this.options.fetch
					, owner;
					
				// we need to ensure that the collection doesn't try to fetch before we create our
				// default collection and finish initializing
				this.options.fetch = false;
				
				sup.apply(this, arguments);
				
				// we allow filters to be nested...so it gets confusing
				if ((owner = this.owner) && owner instanceof Filter) owner.on("sync", this.onOwnerEvent, this);
				
				// will be public for internal reference but is not a public property by declaration
				// and thus still reserved for internal purposes
				this.createChrome([/*mixin({}, [only(this._collectionKeys, this), */{name: "_collection", kind: Collection}/*])*/]);
				this.set("collection", this.collection || this._collection);
				
				// if we were supposed to automatically fetch we reassign the correct value and
				// do as we're told
				fetch && (this.options.fetch = fetch) && this.fetch();
			};
		}),
		
		/**
			@private
		*/
		onCollectionChange: function (was, is) {
			if (was) was.off("*", this.onCollectionEvent, this);
			if (is) {
				is.on("*", this.onCollectionEvent, this);
				
				// this is tricky at first - if as a filter we have no child filters then
				// we want to share state with our subfilter, otherwise, we don't and will
				// let the subkind manage the state of our models separately
				/*if (!this.listeners("sync").length) */this.set("models", is.models);
				
				// children filters can't listen for the reset event because their content would
				// incorrectly update according to filter-changes but here we need them to sync
				// to new data so we emit a special event call sync
				this.emit("sync", {models: this.models});
			}
			if (!is) this.set("collection", this._collection);
		},
		
		/**
			@private
		*/
		onCollectionEvent: function (sender, e, props) {
			// the child filters need to sync but to maintain ordered sets they
			// must re-scan the entirety of the base
			this.emit("sync", {models: sender.models});
			
			// we always re-emit the event as our own to ensure that anyone interested
			// is updated accordingly
			this.emit(e, props);
			
			if (this.options.commit) this.commit();
		},
		
		/**
			Subkinds need to implement this method according to their needs.
		
			@private
			@method
		*/
		onOwnerEvent: nop,
		
		/**
			@private
		*/
		add: inherit(function (sup) {
			return function (models, opts) {
				var is = this.models
					, dit = this
					, collection = this.collection
					, shouldBe = collection.models
					, options = opts? clone(opts): {};
					
				options.silent = true;
				options.success = function (added) {
					// we do this because they were added to the underlying models container but not prepped
					// by the collection as it would normally have been able to
					added && added.forEach(function (model) {collection.prepareModel(model); });
					added && dit.emit("sync", {models: shouldBe.slice()});
					if (is !== shouldBe) dit.unsilence().set("models", is);
					else dit.emit("add", {models: added});
				};
				if (is !== shouldBe) this.silence().set("models", shouldBe, {silent: true});
				sup.call(this, models, options);
				return this;
				
				
				// added = sup.call(this, models, opts);
				// added && added.forEach(function (model) { collection.prepareModel(model); });
				// added && this.emit("sync", {models: shouldBe.slice()});
				// if (is !== shouldBe) this.unsilence().set("models", is);
				// else this.emit("add", {models: added});
				// return added;
			};
		}),
		
		/**
			@private
		*/
		remove: inherit(function (sup) {
			return function (models, opts) {
				
				var is = this.models
					, collection = this.collection
					, shouldBe = collection.models
					, removed;
				
				opts || (opts = {});
				opts.silent = true;
				
				if (is !== shouldBe) this.silence().set("models", shouldBe, {silent: true});
				removed = sup.call(this, models, opts);
				removed && removed.forEach(function (model) { model.off("*", collection.onModelEvent, collection); });
				removed && this.emit("sync", {models: shouldBe.slice()});
				if (is !== shouldBe) this.unsilence().set("models", is);
				else this.emit("remove", {models: removed});
				return removed;
			};
		})
	});
	
})(enyo);