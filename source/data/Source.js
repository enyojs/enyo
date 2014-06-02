(function (enyo) {
	
	var kind = enyo.kind
		, constructorForKind = enyo.constructorForKind
		, getPath = enyo.getPath
		, setPath = enyo.setPath
		, mixin = enyo.mixin;
		
	var sources = enyo.sources = {};
	
	/**
		@public
		@class enyo.Source
	*/
	var Source = kind(
		/** @lends enyo.Source.prototype */ {
		name: "enyo.Source",
		kind: null,
		noDefer: true,
		
		/**
			@private
			@method
		*/
		constructor: function (props) {
			if (props) this.importProps(props);
			// automatic coersion of name removing prefix
			this.name || (this.name = this.kindName.replace(/^(.*)\./, ""));
			// now add to the global registry of sources
			sources[this.name] = this;
		},
		
		/**
			@public
			@method
		*/
		fetch: function (model, opts) {
			//
		},
		
		/**
			@public
			@method
		*/
		commit: function (model, opts) {
			//
		},
		
		/**
			@public
			@method
		*/
		destroy: function (model, opts) {
			//
		},
		
		/**
			@public
			@method
		*/
		find: function (ctor, opts) {
			//
		},
		
		/**
			@public
		*/
		importProps: function (props) {
			props && mixin(this, props);
		},
		
		/**
			@public
			@method
		*/
		get: getPath,
		
		/**
			@public
			@method
		*/
		set: setPath
	});
	
	/**
		@public
		@static
	*/
	Source.create = function (props) {
		var Ctor = (props && props.kind) || this;
		
		if (typeof Ctor == 'string') Ctor = constructorForKind(Ctor);
		
		return new Ctor(props);
	};
	
	/**
		@private
		@static
	*/
	Source.concat = function (ctor, props) {
		ctor.create = Source.create;
	};
	
	Source.execute = function (action, model, opts) {
		var source = opts.source || model.source
			, name;
		
		if (source) {
			// if it is a boolean true then it means use all available sources
			if (source === true) {
				for (name in enyo.sources) {
					source = enyo.sources[name];
					source[action] && source[action](model, opts);
				}
			}
			
			// if it is an array of specific sources to use
			else if (source instanceof Array) {
				source.forEach(function (name) {
					if (enyo.sources[name] && enyo.sources[name][action]) enyo.sources[name][action](model, opts);
				});
			}
			
			// else the singular case
			else if ((source = enyo.sources[source]) && source[action]) source[action](model, opts);
		}
		
		else enyo.warn('enyo.Source.execute(): invalid source(s) requested by ' + model.kindName + '.' + action + '()');
	};
	
})(enyo);