(function (enyo) {

	var kind = enyo.kind;

	var ObserverSupport = enyo.ObserverSupport,
		ComputedSupport = enyo.ComputedSupport,
		BindingSupport = enyo.BindingSupport,
		EventEmitter = enyo.EventEmitter,
		StateSupport = enyo.StateSupport,
		ModelList = enyo.ModelList,
		Source = enyo.Source;

	var STATES = enyo.States;

	/**
	* This is only necessary because of the order in which mixins are applied.
	*
	* @class
	* @private
	*/
	var BaseModel = kind({
		kind: null,
		mixins: [ObserverSupport, ComputedSupport, BindingSupport, EventEmitter, StateSupport]
	});

	/**
	* The event emitted when [attributes]{@link enyo.Model#attributes} have been modified.
	* The event [object]{@glossary Object} will consist of key/value pairs of attributes
	* that changed and their new values.
	*
	* @event enyo.Model#change
	* @type {Object}
	* @public
	*/

	/**
	* The default configurable [options]{@link enyo.Model#options} used in certain API methods
	* of {@link enyo.Model}.
	*
	* @typedef {Object} enyo.Model~Options
	* @property {Boolean} silent=false - Keep events and notifications from being emitted.
	* @property {Boolean} commit=false - Immediately [commit]{@link enyo.Model#commit} changes
	*	after they have occurred. Also note that, if `true`, when the [model]{@link enyo.Model}
	* is [destroyed]{@link enyo.Model#destroy}, it will also be destroyed via any
	* [sources]{@link enyo.Model#source} it has.
	* @property {Boolean} parse=false - During initialization, [parse]{@link enyo.Model#parse}
	*	any given [attributes]{@link enyo.Model#attributes}; after
	*	[fetching]{@link enyo.Model#fetch}, parse the data before calling
	* [set()]{@link enyo.Model#set}.
	* @property {Boolean} fetch=false - Automatically call [fetch()]{@link enyo.Model#fetch}
	*	during initialization.
	*/

	/**
	* The configurable options for [fetch()]{@link enyo.Model#fetch},
	* [commit()]{@link enyo.Model#commit}, and [destroy()]{@link enyo.Model#destroy}.
	*
	* @typedef {enyo.Model~Options} enyo.Model~ActionOptions
	* @property {enyo.Model~Success} success - The callback executed upon successful
	*	completion.
	* @property {enyo.Model~Error} error - The callback executed upon a failed attempt.
	*/

	/**
	* @callback enyo.Model~Success
	* @param {enyo.Model} model - The [model]{@link enyo.Model} that is returning successfully.
	* @param {enyo.Model~ActionOptions} opts - The original options passed to the action method
	*	that is returning successfully.
	* @param {*} res - The result, if any, returned by the [source]{@link enyo.Source} that
	*	executed it.
	* @param {String} source - The name of the [source]{@link enyo.Model#source} that has
	* returned successfully.
	*/

	/**
	* @callback enyo.Model~Error
	* @param {enyo.Model} model - The model that is returning an error.
	* @param {String} action - The name of the action that failed, one of `'FETCHING'`,
	*	`'COMMITTING'`, or `'DESTROYING'`.
	* @param {enyo.Model~Options} opts - The original options passed to the action method
	*	that is returning an error.
	* @param {*} res - The result, if any, returned by the [source]{@link enyo.Source} that
	*	executed it.
	* @param {String} source - The name of the [source]{@link enyo.Model#source} that has
	*	returned an error.
	*/

	/**
	* An [object]{@glossary Object} used to represent and maintain state. Usually,
	* an {@link enyo.Model} is used to expose data to the view layer. It keeps logic
	* related to the data (retrieving it, updating it, storing it, etc.) out of the
	* view, and the view can automatically update based on changes in the model.
	* Models have the ability to work with other data layer [kinds]{@glossary kind}
	* to provide more sophisticated implementations.
	*
	* Models have [bindable]{@link enyo.BindingSupport}
	* [attributes]{@link enyo.Model#attributes}. Models differs from other
	* bindable kinds in that attribute values are proxied from an internal
	* [hash]{@glossary Object} instead of being set on the target properties
	* directly.
	*
	* @see enyo.Store
	* @see enyo.Collection
	* @see enyo.RelationalModel
	* @see enyo.ModelController
	* @class enyo.Model
	* @mixes enyo.ObserverSupport
	* @mixes enyo.ComputedSupport
	* @mixes enyo.BindingSupport
	* @mixes enyo.EventEmitter
	* @mixes enyo.StateSupport
	* @public
	*/
	var Model = kind(
		/** @lends enyo.Model.prototype */ {

		/**
		* @private
		*/
		name: 'enyo.Model',

		/**
		* @private
		*/
		kind: BaseModel,

		/**
		* @private
		*/
		noDefer: true,

		/**
		* Used by various [sources]{@link enyo.Model#source} as part of the
		* [URI]{@glossary URI} from which they may be [fetched]{@link enyo.Model#fetch},
		* [committed]{@link enyo.Model#commit}, or [destroyed]{@link enyo.Model#destroy}.
		* Some sources may use this property in other ways.
		*
		* @see enyo.Model.getUrl
		* @see enyo.Source
		* @see enyo.AjaxSource
		* @see enyo.JsonpSource
		* @type {String}
		* @default ''
		* @public
		*/
		url: '',

		/**
		* Implement this method to be used by [sources]{@link enyo.Model#source} to
		* dynamically derive the [URI]{@glossary URI} from which they may be
		* [fetched]{@link enyo.Model#fetch}, [committed]{@link enyo.Model#commit},
		* or [destroyed]{@link enyo.Model#destroy}. Some sources may use this
		* property in other ways. Note that, if this method is implemented, the
		* [url]{@link enyo.Model#url} will not be used.
		*
		* @see enyo.Model.url
		* @see enyo.Source
		* @see enyo.AjaxSource
		* @see enyo.JsonpSource
		* @type {Function}
		* @default null
		* @virtual
		* @public
		*/
		getUrl: null,

		/**
		* The [hash]{@glossary Object} of properties proxied by this [model]{@link enyo.Model}.
		* If defined on a [subkind]{@glossary subkind}, it may be assigned default values and
		* all instances will share its default structure. If no attributes are defined, an
		* empty [hash]{@glossary Object} will be assigned during initialization. It is not
		* necessary to pre-define the structure of a model; depending on the model's complexity,
		* pre-defining the structure may possibly hinder performance.
		*
		* It should also be noted that calls to [get()]{@link enyo.Model#get} or
		* [set()]{@link enyo.Model#set} will access and modify this property. This includes
		* the values to which (or from which) [bindings]{@link enyo.BindingSupport} are bound.
		*
		* @type {Object}
		* @default null
		* @public
		*/
		attributes: null,

		/**
		* The [source(s)]{@link enyo.Source} to use when [fetching]{@link enyo.Model#fetch},
		* [committing]{@link enyo.Model#commit}, or [destroying]{@link enyo.Model#destroy}.
		* Any method that uses sources may override this default value in its configuration
		* options. This value may be a [string]{@glossary String}, an
		* [Array]{@glossary Array} of strings, an instance of {@link enyo.Source}, or an
		* array of `enyo.Source` instances.
		*
		* @see enyo.Source
		* @see enyo.Model.fetch
		* @see enyo.Model.commit
		* @see enyo.Model.destroy
		* @type {(String|String[]|enyo.Source|enyo.Source[])}
		* @default null
		* @public
		*/
		source: null,

		/**
		* These [keys]{@glossary Object.keys} will be the only
		* [attributes]{@link enyo.Model#attributes} included if the
		* [model]{@link enyo.Model} is [committed]{@link enyo.Model#commit}. This
		* directly modifies the result of calling [raw()]{@link enyo.Model#raw}. If
		* not defined, all keys from the [attributes]{@link enyo.Model#attributes}
		* [hash]{@glossary Object} will be used.
		*
		* @see enyo.Model.raw
		* @see enyo.Model.toJSON
		* @type {String[]}
		* @default null
		* @public
		*/
		includeKeys: null,

		/**
		* The inheritable default configuration options. These specify the behavior of particular
		* API features of {@link enyo.Model}. Any method that uses these options may override
		* the default values in its own configuration options. Note that setting an
		* [options hash]{@glossary Object} on a [subkind]{@glossary subkind} will result in
		* the new values' being merged with--not replacing--the
		* [superkind's]{@glossary superkind} own `options`.
		*
		* @type {enyo.Model~Options}
		* @public
		*/
		options: {
			silent: false,
			commit: false,
			parse: false,
			fetch: false
		},

		/**
		* The current [state(s)]{@link enyo~States} possessed by the [model]{@link enyo.Model}.
		* There are limitations as to which state(s) the model may possess at any given time.
		* By default, a model is [NEW]{@link enyo~States.NEW} and [CLEAN]{@link enyo~States.CLEAN}.
		* Note that this is **not** a [bindable]{@link enyo.BindingSupport} property.
		*
		* @see enyo~States
		* @see enyo.StateSupport
		* @type {enyo.States}
		* @readonly
		* @public
		*/
		status: STATES.NEW | STATES.CLEAN,

		/**
		* The unique attribute by which the [model]{@link enyo.Model} may be indexed. The
		* attribute's value must be unique across all instances of the specific model
		* [kind]{@glossary kind}
		*
		* @type {String}
		* @default 'id'
		* @public
		*/
		primaryKey: 'id',

		/**
		* Inspects and restructures incoming data prior to [setting]{@link enyo.Model#set} it on
		* the [model]{@link enyo.Model}. While this method may be called directly, it is most
		* often used via the [parse]{@link enyo.Model~Options.parse} option and executed
		* automatically, either during initialization or when [fetched]{@link enyo.Model#fetch}
		* (or, in some cases, both). This is a virtual method and must be provided to suit a
		* given implementation's needs.
		*
		* @see enyo.Model~Options.parse
		* @param {*} data - The incoming data that may need to be restructured or reduced prior to
		*	being [set]{@link enyo.Model#set} on the [model]{@link enyo.Model}.
		* @returns {Object} The [hash]{@glossary Object} to apply to the
		*	model via [set()]{@link enyo.Model#set}.
		* @virtual
		* @public
		*/
		parse: function (data) {
			return data;
		},

		/**
		* Returns an [Object]{@glossary Object} that represents the underlying data structure
		* of the [model]{@link enyo.Model}. This is dependent on the current
		* [attributes]{@link enyo.Model#attributes} as well as the
		* [includeKeys]{@link enyo.Model#includeKeys}.
		* [Computed properties]{@link enyo.ComputedSupport} are **never** included.
		*
		* @see enyo.Model.includeKeys
		* @see enyo.Model.attributes
		* @returns {Object} The formatted [hash]{@glossary Object} representing the underlying
		*	data structure of the [model]{@link enyo.Model}.
		* @public
		*/
		raw: function () {
			var inc = this.includeKeys
				, attrs = this.attributes
				, keys = inc || Object.keys(attrs)
				, cpy = inc? enyo.only(inc, attrs): enyo.clone(attrs);
			keys.forEach(function (key) {
				var ent = this.get(key);
				if (typeof ent == 'function') cpy[key] = ent.call(this);
				else if (ent && ent.raw) cpy[key] = ent.raw();
				else cpy[key] = ent;
			}, this);
			return cpy;
		},

		/**
		* Returns the [JSON]{@glossary JSON} serializable [raw()]{@link enyo.Model#raw} output
		* of the [model]{@link enyo.Model}. Will automatically be executed by
		* [JSON.parse()]{@glossary JSON.parse}.
		*
		* @see enyo.Model.raw
		* @returns {Object} The return value of [raw()]{@link enyo.Model#raw}.
		* @public
		*/
		toJSON: function () {

			// @NOTE: Because this is supposed to return a JSON parse-able object
			return this.raw();
		},

		/**
		* Restores an [attribute]{@link enyo.Model#attributes} to its previous value. If no
		* attribute is specified, all previous values will be restored.
		*
		* @see enyo.Model.set
		* @see enyo.Model.previous
		* @param {String} [prop] - The [attribute]{@link enyo.Model#attributes} to
		*	[restore]{@link enyo.Model#restore}. If not provided, all attributes will be
		* restored to their previous values.
		* @returns {this} The callee for chaining.
		* @public
		*/
		restore: function (prop) {

			// we ensure that the property is forcibly notified (when possible) to ensure that
			// bindings or other observers will know it returned to that value
			if (prop) this.set(prop, this.previous[prop], {force: true});
			else this.set(this.previous);

			return this;
		},

		/**
		* Commits the [model]{@link enyo.Model} to a [source or sources]{@link enyo.Model#source}.
		* A model cannot be [committed]{@link enyo.Model#commit} if it is in an
		* [error]{@link enyo~States.ERROR} ({@link enyo.StateSupport.isError}) or
		* [busy]{@link enyo~States.BUSY} ({@link enyo.StateSupport.isBusy})
		* [state]{@link enyo.Model#status}. While executing, it will add the
		* [COMMITTING]{@link enyo~States.COMMITTING} flag to the model's
		* [status]{@link enyo.Model#status}. Once it has completed execution, it will
		* remove this flag (even if it fails).
		*
		* @see enyo.Model.committed
		* @see enyo.Model.status
		* @param {enyo.Model~ActionOptions} [opts] - Optional configuration options.
		* @returns {this} The callee for chaining.
		* @public
		*/
		commit: function (opts) {
			var options,
				source,
				it = this;

			// if the current status is not one of the error or busy states we can continue
			if (!(this.status & (STATES.ERROR | STATES.BUSY))) {

				// if there were options passed in we copy them quickly so that we can hijack
				// the success and error methods while preserving the originals to use later
				options = opts ? enyo.clone(opts, true) : {};

				// make sure we keep track of how many sources we're requesting
				source = options.source || this.source;
				if (source && ((source instanceof Array) || source === true)) {
					this._waiting = source.length ? source.slice() : Object.keys(enyo.sources);
				}

				options.success = function (source, res) {
					it.committed(opts, res, source);
				};

				options.error = function (source, res) {
					it.errored('COMMITTING', opts, res, source);
				};

				// set the state
				this.status = this.status | STATES.COMMITTING;

				// now pass this on to the source to execute as it sees fit
				Source.execute('commit', this, options);
			} else this.errored(this.status, opts);

			return this;
		},

		/**
		* Fetches the [model]{@link enyo.Model} from a
		* [source or sources]{@link enyo.Model#source}. A model cannot be
		* [fetched]{@link enyo.Model#fetch} if it is in an
		* [error]{@link enyo~States.ERROR} ({@link enyo.StateSupport.isError}) or
		* [busy]{@link enyo~States.BUSY} ({@link enyo.StateSupport.isBusy})
		* [state]{@link enyo.Model#status}. While executing, it will add the
		* [FETCHING]{@link enyo~States.FETCHING} flag to the model's
		* [status]{@link enyo.Model#status}. Once it has completed execution, it will
		* remove this flag (even if it fails).
		*
		* @see enyo.Model.fetched
		* @see enyo.Model.status
		* @param {enyo.Model~ActionOptions} [opts] - Optional configuration options.
		* @returns {this} The callee for chaining.
		* @public
		*/
		fetch: function (opts) {
			var options,
				source,
				it = this;

			// if the current status is not one of the error or busy states we can continue
			if (!(this.status & (STATES.ERROR | STATES.BUSY))) {

				// if there were options passed in we copy them quickly so that we can hijack
				// the success and error methods while preserving the originals to use later
				options = opts ? enyo.clone(opts, true) : {};

				// make sure we keep track of how many sources we're requesting
				source = options.source || this.source;
				if (source && ((source instanceof Array) || source === true)) {
					this._waiting = source.length ? source.slice() : Object.keys(enyo.sources);
				}

				options.success = function (source, res) {
					it.fetched(opts, res, source);
				};

				options.error = function (source, res) {
					it.errored('FETCHING', opts, res, source);
				};

				// set the state
				this.status = this.status | STATES.FETCHING;

				// now pass this on to the source to execute as it sees fit
				Source.execute('fetch', this, options);
			} else this.errored(this.status, opts);

			return this;
		},

		/**
		* Destroys the [model]{@link enyo.Model}. By default, the model will only
		* be [destroyed]{@glossary destroy} in the client. To execute with a
		* [source or sources]{@link enyo.Model#source}, either the
		* [commit default option]{@link enyo.Model#options} must be `true` or a
		* `source` property must be explicitly provided in the `opts` parameter.
		* A model cannot be destroyed (using a source) if it is in an
		* [error]{@link enyo~States.ERROR} ({@link enyo.StateSupport.isError})
		* or [busy]{@link enyo~States.BUSY} ({@link enyo.StateSupport.isBusy})
		* [state]{@link enyo.Model#status}. While executing, it will add the
		* [DESTROYING]{@link enyo~States.DESTROYING} flag to the model's
		* [status]{@link enyo.Model#status}. Once it has completed execution, it
		* will remove this flag (even if it fails).
		*
		* @see enyo.Model.status
		* @param {enyo.Model~ActionOptions} [opts] - Optional configuration options.
		* @returns {this} The callee for chaining.
		* @public
		*/
		destroy: function (opts) {
			var options = opts ? enyo.mixin({}, [this.options, opts]) : this.options,
				it = this,
				idx;

			// this becomes an (potentially) async operation if we are committing this destroy
			// to a source and its kind of tricky to figure out because there are several ways
			// it could be flagged to do this

			if (options.commit || options.source) {

				// if the current status is not one of the error states we can continue
				if (!(this.status & (STATES.ERROR | STATES.BUSY))) {

					// remap to the originals
					options = opts ? enyo.clone(opts, true) : {};

					options.success = function (source, res) {

						if (it._waiting) {
							idx = it._waiting.findIndex(function (ln) {
								return (ln instanceof Source ? ln.name : ln) == source;
							});
							if (idx > -1) it._waiting.splice(idx, 1);
							if (!it._waiting.length) it._waiting = null;
						}

						// continue the operation this time with commit false explicitly
						if (!it._waiting) {
							options.commit = options.source = null;
							it.destroy(options);
						}
						if (opts && opts.success) opts.success(this, opts, res, source);
					};

					options.error = function (source, res) {

						if (it._waiting) {
							idx = it._waiting.findIndex(function (ln) {
								return (ln instanceof Source ? ln.name : ln) == source;
							});
							if (idx > -1) it._waiting.splice(idx, 1);
							if (!it._waiting.length) it._waiting = null;
						}

						// continue the operation this time with commit false explicitly
						if (!it._waiting) {
							options.commit = options.source = null;
							it.destroy(options);
						}

						// we don't bother setting the error state if we aren't waiting because it
						// will be cleared to DESTROYED and it would be pointless
						else this.errored('DESTROYING', opts, res, source);
					};

					this.status = this.status | STATES.DESTROYING;

					Source.execute('destroy', this, options);
				} else if (this.status & STATES.ERROR) this.errored(this.status, opts);

				// we don't allow the destroy to take place and we don't forcibly break-down
				// the collection errantly so there is an opportuniy to resolve the issue
				// before we lose access to the collection's content!
				return this;
			}


			// we flag this early so objects that receive an event and process it
			// can optionally check this to support faster cleanup in some cases
			// e.g. Collection/Store don't need to remove listeners because it will
			// be done in a much quicker way already
			this.destroyed = true;
			this.status = STATES.DESTROYED;
			this.unsilence(true).emit('destroy');
			this.removeAllListeners();
			this.removeAllObservers();

			// if this does not have the the batching flag (that would be set by a collection)
			// then we need to do the default of removing it from the store
			if (!opts || !opts.batching) this.store.remove(this);
		},

		/**
		* Retrieves the value for the given property or path. If the property is a
		* [computed property]{@link enyo.ComputedSupport.computed}, then it will return
		* that value; otherwise, it will attempt to retrieve the value from the
		* [attributes hash]{@link enyo.Model#attributes}.
		*
		* @param {String} path - The property to retrieve.
		* @returns {*} The value for the requested property or path, or `undefined` if
		* it cannot be found or does not exist.
		* @public
		*/
		get: function (path) {
			return this.isComputed(path) ? this._getComputed(path) : this.attributes[path];
		},

		/**
		* Sets the requested `path` or [hash]{@glossary Object} of properties on the
		* [model]{@link enyo.Model}. Properties are applied to the
		* [attributes hash]{@link enyo.Model#attributes} and are retrievable via
		* [get()]{@link enyo.Model#get}. If properties were updated and the `silent`
		* option is not `true`, this method will emit a `change` event, as well as
		* individual [notifications]{@link enyo.ObserverSupport.notify} for the
		* properties that were modified.
		*
		* @fires enyo.Model#change
		* @see enyo.ObserverSupport
		* @see enyo.BindingSupport
		* @param {(String|Object)} path - Either the property name or a [hash]{@glossary Object}
		*	of properties and values to set.
		* @param {(*|enyo.Model~Options)} is If `path` is a [string]{@glossary String},
		* this should be the value to set for the given property; otherwise, it should be
		* an optional hash of available [configuration options]{@link enyo.Model~Options}.
		* @param {enyo.Model~Options} [opts] - If `path` is a string, this should be the
		* optional hash of available configuration options; otherwise, it will not be used.
		* @returns {this} The callee for chaining.
		* @public
		*/
		set: function (path, is, opts) {
			if (!this.destroyed) {

				var attrs = this.attributes,
					options = this.options,
					changed,
					incoming,
					force,
					silent,
					key,
					value,
					commit,
					fetched;

				// the default case for this setter is accepting an object of key->value pairs
				// to apply to the model in which case the second parameter is the optional
				// configuration hash
				if (typeof path == 'object') {
					incoming = path;
					opts = opts || is;
				}

				// otherwise in order to have a single path here we flub it so it will keep on
				// going as expected
				else {
					incoming = {};
					incoming[path] = is;
				}

				// to maintain backward compatibility with the old setters that allowed the third
				// parameter to be a boolean to indicate whether or not to force notification of
				// change even if there was any
				if (opts === true) {
					force = true;
					opts = {};
				}

				opts = opts ? enyo.mixin({}, [options, opts]) : options;
				silent = opts.silent;
				force = force || opts.force;
				commit = opts.commit;
				fetched = opts.fetched;

				for (key in incoming) {
					value = incoming[key];

					if (value !== attrs[key] || force) {
						// to ensure we have an object to work with
						// note that we check inside this loop so we don't have to examine keys
						// later only the local variable changed
						changed = this.changed || (this.changed = {});
						//store the previous attr value
						this.previous[key] = attrs[key];
						//set new value
						changed[key] = attrs[key] = value;
					}
				}

				if (changed) {

					// we add dirty as a value of the status but clear the CLEAN bit if it
					// was set - this would allow it to be in the ERROR state and NEW and DIRTY
					if (!fetched) this.status = (this.status | STATES.DIRTY) & ~STATES.CLEAN;

					if (!silent) this.emit('change', changed, this);

					if (commit && !fetched) this.commit(opts);

					// reset value so subsequent changes won't be added to this change-set
					this.changed = null;
				}
			}

			return this;
		},

		/**
		* A bit of hackery to facade the normal [getter]{@link enyo.ComputedSupport.get}. Note that
		* we pass an arbitrary super-method that automatically returns `undefined`, which is
		* consistent with this use case and its intended purpose.
		*
		* @private
		*/
		_getComputed: ComputedSupport.get.fn(function () { return undefined; }),

		/**
		* Initializes the [model]{@link enyo.Model}. Unlike some methods, the parameters are not
		* interchangeable. If you are not using a particular (optional) parameter, pass in `null`.
		*
		* @param {Object} [attrs] - Optionally initialize the [model]{@link enyo.Model} with some
		*	[attributes]{@link enyo.Model#attributes}.
		* @param {Object} [props] - Properties to apply directly to the [model]{@link enyo.Model} and
		*	not the [attributes hash]{@link enyo.Model#attributes}. If these properties contain an
		*	`options` property (a [hash]{@glossary Object}) it will be merged with existing
		*	[options]{@link enyo.Model#options}.
		* @param {enyo.Model~Options} [opts] - This is a one-time [options hash]{@link enyo.Model~Options} that
		*	is only used during initialization and not applied as defaults.
		* @public
		*/
		constructor: function (attrs, props, opts) {

			// in cases where there is an options hash provided in the _props_ param
			// we need to integrate it manually...
			if (props && props.options) {
				this.options = enyo.mixin({}, [this.options, props.options]);
				delete props.options;
			}

			// the _opts_ parameter is a one-hit options hash it does not leave
			// behind its values as default options...
			opts = opts? enyo.mixin({}, [this.options, opts]): this.options;

			// go ahead and mix all of the properties in
			props && enyo.mixin(this, props);

			var noAdd = opts.noAdd
				, commit = opts.commit
				, parse = opts.parse
				, fetch = this.options.fetch
				, defaults;

			// defaults = this.defaults && (typeof this.defaults == 'function'? this.defaults(attrs, opts): this.defaults);
			defaults = this.defaults && typeof this.defaults == 'function'? this.defaults(attrs, opts): null;

			// ensure we have a unique identifier that could potentially
			// be used in remote systems
			this.euid = this.euid || enyo.uid('m');

			// if necessary we need to parse the incoming attributes
			attrs = attrs? parse? this.parse(attrs): attrs: null;

			// ensure we have the updated attributes
			this.attributes = this.attributes? defaults? enyo.mixin({}, [defaults, this.attributes]): enyo.clone(this.attributes, true): defaults? enyo.clone(defaults, true): {};
			attrs && enyo.mixin(this.attributes, attrs);
			this.previous = enyo.clone(this.attributes);

			// now we need to ensure we have a store and register with it
			this.store = this.store || enyo.store;

			// @TODO: The idea here is that when batch instancing records a collection
			// should be intelligent enough to avoid doing each individually or in some
			// cases it may be useful to have a record that is never added to a store?
			if (!noAdd) this.store.add(this, opts);

			commit && this.commit();
			fetch && this.fetch();
		},

		/**
		* Overloaded. We funnel arbitrary notification updates through here, as this
		* is faster than using the built-in notification updates for batch operations.
		*
		* @private
		*/
		emit: enyo.inherit(function (sup) {
			return function (e, props) {
				if (e == 'change' && props && this.isObserving()) {
					for (var key in props) this.notify(key, this.previous[key], props[key]);
				}
				return sup.apply(this, arguments);
			};
		}),

		/**
		* Overloaded to alias the (also overloaded) [emit()]{@link enyo.Model#emit} method.
		*
		* @private
		*/
		triggerEvent: function () {
			return this.emit.apply(this, arguments);
		},

		/**
		* When a [fetch]{@link enyo.Model#fetch} has completed successfully, it is returned
		* to this method. This method handles special and important behavior; it should not be
		* called directly and, when overloading, care must be taken to ensure that you call
		* the super-method. This correctly sets the [status]{@link enyo.Model#status} and, in
		* cases where multiple [sources]{@link enyo.Model#source} were used, it waits until
		* all have responded before clearing the [FETCHING]{@link enyo~States.FETCHING} flag.
		* If a [success]{@link enyo.Model~Success} callback was provided, it will be called
		* once for each source.
		*
		* @param {enyo.Model~ActionOptions} opts - The original options passed to
		*	[fetch()]{@link enyo.Model#fetch}, merged with the defaults.
		* @param {*} [res] - The result provided from the given [source]{@link enyo.Model#source},
		* if any. This will vary depending on the source.
		* @param {String} source - The name of the source that has completed successfully.
		* @public
		*/
		fetched: function (opts, res, source) {
			var idx,
				options = this.options;

			if (this._waiting) {
				idx = this._waiting.findIndex(function (ln) {
					return (ln instanceof Source ? ln.name : ln) == source;
				});
				if (idx > -1) this._waiting.splice(idx, 1);
				if (!this._waiting.length) this._waiting = null;
			}

			// normalize options so we have values and ensure it knows it was just fetched
			opts = opts ? enyo.mixin({}, [options, opts]) : options;
			opts.fetched = true;

			// for a special case purge to only use the result sub-tree of the fetched data for
			// the model attributes
			if (opts.parse) res = this.parse(res);

			// note this will not add the DIRTY state because it was fetched but also note that it
			// will not clear the DIRTY flag if it was already DIRTY
			if (res) this.set(res, opts);

			// clear the FETCHING and NEW state (if it was NEW) we do not set it as dirty as this
			// action alone doesn't warrant a dirty flag that would need to be set in the set method
			if (!this._waiting) this.status = this.status & ~(STATES.FETCHING | STATES.NEW);

			// now look for an additional success callback
			if (opts.success) opts.success(this, opts, res, source);
		},

		/**
		* When a [commit]{@link enyo.Model#commit} has completed successfully, it is returned
		* to this method. This method handles special and important behavior; it should not be
		* called directly and, when overloading, care must be taken to ensure that you call the
		* super-method. This correctly sets the [status]{@link enyo.Model#status} and, in cases
		* where multiple [sources]{@link enyo.Model#source} were used, it waits until all have
		* responded before clearing the [COMMITTING]{@link enyo~States.COMMITTING} flag. If a
		* [success]{@link enyo.Model~Success} callback was provided, it will be called once for
		* each source.
		*
		* @param {enyo.Model~ActionOptions} opts - The original options passed to
		*	[commit()]{@link enyo.Model#commit}, merged with the defaults.
		* @param {*} [res] - The result provided from the given [source]{@link enyo.Model#source},
		* if any. This will vary depending on the source.
		* @param {String} source - The name of the source that has completed successfully.
		* @public
		*/
		committed: function (opts, res, source) {
			var idx;

			if (this._waiting) {
				idx = this._waiting.findIndex(function (ln) {
					return (ln instanceof Source ? ln.name : ln) == source;
				});
				if (idx > -1) this._waiting.splice(idx, 1);
				if (!this._waiting.length) this._waiting = null;
			}

			if (!this._waiting) {
				// we need to clear the COMMITTING bit and DIRTY bit as well as ensure that the
				// 'previous' hash is whatever the current attributes are
				this.previous = enyo.clone(this.attributes);
				this.status = (this.status | STATES.CLEAN) & ~(STATES.COMMITTING | STATES.DIRTY);
			}

			if (opts && opts.success) opts.success(this, opts, res, source);
		},

		/**
		* When an action ([fetch()]{@link enyo.Model#fetch}, [commit()]{@link enyo.Model#commit},
		* or [destroy()]{@link enyo.Model#destroy}) has failed, it will be passed to this method.
		* This method handles special and important behavior; it should not be called directly
		* and, when overloading, care must be taken to ensure that you call the super-method.
		* This correctly sets the [status]{@link enyo.Model#status} to the known
		* [error state]{@link enyo~States.ERROR}, or to the
		* [unknown error state]{@link enyo~States.ERROR_UNKNOWN} if it the error state could not
		* be determined. If an [error callback]{@link enyo.Model~Error} was provided, this method
		* will execute it.
		*
		* @see enyo.StateSupport.clearError
		* @param {String} action - The action (one of `'FETCHING'`, `'COMMITTING'`, or
		* `'DESTROYING'`) that failed and is now in an [error state]{@link enyo~States.ERROR}.
		* @param {enyo.Model~ActionOptions} opts - The original options passed to the `action`
		* method, merged with the defaults.
		* @param {*} [res] - The result provided from the given [source]{@link enyo.Model#source},
		* if any. This will vary depending on the source.
		* @param {String} source - The name of the source that has returned an error.
		* @public
		*/
		errored: function (action, opts, res, source) {
			var stat,
				idx;

			// if the error action is a status number then we don't need to update it otherwise
			// we set it to the known state value
			if (typeof action == 'string') {

				// all built-in errors will pass this as their values are > 0 but we go ahead and
				// ensure that no developer used the 0x00 for an error code
				stat = STATES['ERROR_' + action];
			} else stat = action;

			if (isNaN(stat) || (stat & ~STATES.ERROR)) stat = STATES.ERROR_UNKNOWN;

			// correctly set the current status and ensure we clear any busy flags
			this.status = (this.status | stat) & ~STATES.BUSY;

			if (this._waiting) {
				idx = this._waiting.findIndex(function (ln) {
					return (ln instanceof Source ? ln.name : ln) == source;
				});
				if (idx > -1) this._waiting.splice(idx, 1);
				if (!this._waiting.length) this._waiting = null;
			}

			// we need to check to see if there is an options handler for this error
			if (opts && opts.error) opts.error(this, action, opts, res, source);
		}

	});

	/**
	* @name enyo.Model.concat
	* @static
	* @private
	*/
	Model.concat = function (ctor, props) {
		var proto = ctor.prototype || ctor;

		if (props.options) {
			proto.options = enyo.mixin({}, [proto.options, props.options]);
			delete props.options;
		}
	};

	/**
	* @private
	*/
	enyo.kind.features.push(function (ctor) {
		if (ctor.prototype instanceof Model) {
			!enyo.store.models[ctor.prototype.kindName] && (enyo.store.models[ctor.prototype.kindName] = new ModelList());
		}
	});

})(enyo);
