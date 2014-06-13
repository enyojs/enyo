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
			
			// if called with no parameters we actually just breakdown the source and remove
			// it as being available
			if (!arguments.length) {
				enyo.sources[this.name] = null;
				this.name = null;
			}
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
		var source = opts.source || model.source,
		
			// we need to be able to bind the success and error callbacks for each of the
			// sources we'll be using
			options = enyo.clone(opts, true),
			nom = source,
			msg;
		
		if (source) {
			
			// if explicitly set to true then we need to use all available sources in the
			// application
			if (source === true) {
				
				for (nom in enyo.sources) {
					source = enyo.sources[nom];
					if (source[action]) {
						
						// bind the source name to the success and error callbacks
						options.success = opts.success.bind(null, nom);
						options.error = opts.error.bind(null, nom);
						
						source[action](model, options);
					}
				}
			}
			
			// if it is an array of specific sources to use we, well, will only use those!
			else if (source instanceof Array) {
				source.forEach(function (nom) {
					var src = typeof nom == 'string' ? enyo.sources[nom] : nom;
					
					if (src && src[action]) {
						// bind the source name to the success and error callbacks
						options.success = opts.success.bind(null, src.name);
						options.error = opts.error.bind(null, src.name);
						
						src[action](model, options);
					}
				});
			}
			
			// if it is an instance of a source
			else if (source instanceof Source && source[action]) {
				
				// bind the source name to the success and error callbacks
				options.success = opts.success.bind(null, source.name);
				options.error = opts.error.bind(null, source.name);
				
				source[action](model, options);
			}
			
			// otherwise only one was specified and we attempt to use that
			else if ((source = enyo.sources[nom]) && source[action]) {
				
				// bind the source name to the success and error callbacks
				options.success = opts.success.bind(null, nom);
				options.error = opts.error.bind(null, nom);
				
				source[action](model, options);
			}
			
			// we could not resolve the requested source
			else {
				msg = 'enyo.Source.execute(): requested source(s) could not be found for ' +
					model.kindName + '.' + action + '()';
				
				enyo.warn(msg);
				
				// we need to fail the attempt and let it be handled
				opts.error(nom, msg);
			}
		} else {
			msg = 'enyo.Source.execute(): no source(s) provided for ' + model.kindName + '.' +
				action + '()';
				
			enyo.warn(msg);
			
			// we need to fail the attempt and let it be handled
			opts.error(nom, msg);
		}
	};
	
})(enyo);