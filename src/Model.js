require('enyo');

/**
* Contains the declaration for the {@link module:enyo/Model~Model} kind.
* @module enyo/Model
*/

var
	kind = require('./kind'),
	utils = require('./utils');

var
	ObserverSupport = require('./ObserverSupport'),
	ComputedSupport = require('./ComputedSupport'),
	BindingSupport = require('./BindingSupport'),
	EventEmitter = require('./EventEmitter'),
	StateSupport = require('./StateSupport'),
	ModelList = require('./ModelList'),
	Source = require('./Source'),
	States = require('./States'),
	Store = require('./Store');

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
* The event emitted when [attributes]{@link module:enyo/Model~Model#attributes} have been modified.
* The event [object]{@glossary Object} will consist of key/value pairs of attributes
* that changed and their new values.
*
* @event module:enyo/Model~Model#change
* @type {Object}
* @public
*/

/**
* The default configurable [options]{@link module:enyo/Model~Model#options} used in certain API methods
* of {@link module:enyo/Model~Model}.
*
* @typedef {Object} module:enyo/Model~Model~Options
* @property {Boolean} silent=false - Keep events and notifications from being emitted.
* @property {Boolean} commit=false - Immediately [commit]{@link module:enyo/Model~Model#commit} changes
*	after they have occurred. Also note that, if `true`, when the [model]{@link module:enyo/Model~Model}
* is [destroyed]{@link module:enyo/Model~Model#destroy}, it will also be destroyed via any
* [sources]{@link module:enyo/Model~Model#source} it has.
* @property {Boolean} parse=false - During initialization, [parse]{@link module:enyo/Model~Model#parse}
*	any given [attributes]{@link module:enyo/Model~Model#attributes}; after
*	[fetching]{@link module:enyo/Model~Model#fetch}, parse the data before calling
* [set()]{@link module:enyo/Model~Model#set}.
* @property {Boolean} fetch=false - Automatically call [fetch()]{@link module:enyo/Model~Model#fetch}
*	during initialization.
*/

/**
* The configurable options for [fetch()]{@link module:enyo/Model~Model#fetch},
* [commit()]{@link module:enyo/Model~Model#commit}, and [destroy()]{@link module:enyo/Model~Model#destroy}.
*
* @typedef {module:enyo/Model~Model~Options} module:enyo/Model~Model~ActionOptions
* @property {module:enyo/Model~Model~Success} success - The callback executed upon successful
*	completion.
* @property {module:enyo/Model~Model~Error} error - The callback executed upon a failed attempt.
*/

/**
* @callback module:enyo/Model~Model~Success
* @param {module:enyo/Model~Model} model - The [model]{@link module:enyo/Model~Model} that is returning successfully.
* @param {module:enyo/Model~Model~ActionOptions} opts - The original options passed to the action method
*	that is returning successfully.
* @param {*} res - The result, if any, returned by the [source]{@link module:enyo/Source~Source} that
*	executed it.
* @param {String} source - The name of the [source]{@link module:enyo/Model~Model#source} that has
* returned successfully.
*/

/**
* @callback module:enyo/Model~Model~Error
* @param {module:enyo/Model~Model} model - The model that is returning an error.
* @param {String} action - The name of the action that failed, one of `'FETCHING'`,
*	`'COMMITTING'`, or `'DESTROYING'`.
* @param {module:enyo/Model~Model~Options} opts - The original options passed to the action method
*	that is returning an error.
* @param {*} res - The result, if any, returned by the [source]{@link module:enyo/Source~Source} that
*	executed it.
* @param {String} source - The name of the [source]{@link module:enyo/Model~Model#source} that has
*	returned an error.
*/

/**
* An [object]{@glossary Object} used to represent and maintain state. Usually,
* an {@link module:enyo/Model~Model} is used to expose data to the view layer. It keeps logic
* related to the data (retrieving it, updating it, storing it, etc.) out of the
* view, and the view can automatically update based on changes in the model.
* Models have the ability to work with other data layer [kinds]{@glossary kind}
* to provide more sophisticated implementations.
*
* Models have [bindable]{@link module:enyo/BindingSupport~BindingSupport}
* [attributes]{@link module:enyo/Model~Model#attributes}. Models differs from other
* bindable kinds in that attribute values are proxied from an internal
* [hash]{@glossary Object} instead of being set on the target properties
* directly.
*
* @see module:enyo/Store~Store
* @see module:enyo/Collection~Collection
* @see module:enyo/RelationalModel~RelationalModel
* @see module:enyo/ModelController~ModelController
* @class Model
* @mixes module:enyo/ObserverSupport~ObserverSupport
* @mixes module:enyo/ComputedSupport~ComputedSupport
* @mixes module:enyo/BindingSupport~BindingSupport
* @mixes module:enyo/EventEmitter
* @mixes module:enyo/StateSupport~StateSupport
* @public
*/
var Model = module.exports = kind(
	/** @lends module:enyo/Model~Model.prototype */ {

	name: 'enyo.Model',

	/**
	* @private
	*/
	kind: BaseModel,

	/**
	* @private
	*/


	/**
	* Used by various [sources]{@link module:enyo/Model~Model#source} as part of the
	* [URI]{@glossary URI} from which they may be [fetched]{@link module:enyo/Model~Model#fetch},
	* [committed]{@link module:enyo/Model~Model#commit}, or [destroyed]{@link module:enyo/Model~Model#destroy}.
	* Some sources may use this property in other ways.
	*
	* @see module:enyo/Model~Model#getUrl
	* @see module:enyo/Source~Source
	* @see module:enyo/AjaxSource~AjaxSource
	* @see module:enyo/JsonpSource~JsonpSource
	* @type {String}
	* @default ''
	* @public
	*/
	url: '',

	/**
	* Implement this method to be used by [sources]{@link module:enyo/Model~Model#source} to
	* dynamically derive the [URI]{@glossary URI} from which they may be
	* [fetched]{@link module:enyo/Model~Model#fetch}, [committed]{@link module:enyo/Model~Model#commit},
	* or [destroyed]{@link module:enyo/Model~Model#destroy}. Some sources may use this
	* property in other ways. Note that, if this method is implemented, the
	* [url]{@link module:enyo/Model~Model#url} will not be used.
	*
	* @see module:enyo/Model~Model#url
	* @see module:enyo/Source~Source
	* @see module:enyo/AjaxSource~AjaxSource
	* @see module:enyo/JsonpSource~JsonpSource
	* @type {Function}
	* @default null
	* @virtual
	* @public
	*/
	getUrl: null,

	/**
	* The [hash]{@glossary Object} of properties proxied by this [model]{@link module:enyo/Model~Model}.
	* If defined on a [subkind]{@glossary subkind}, it may be assigned default values and
	* all instances will share its default structure. If no attributes are defined, an
	* empty [hash]{@glossary Object} will be assigned during initialization. It is not
	* necessary to pre-define the structure of a model; depending on the model's complexity,
	* pre-defining the structure may possibly hinder performance.
	*
	* It should also be noted that calls to [get()]{@link module:enyo/Model~Model#get} or
	* [set()]{@link module:enyo/Model~Model#set} will access and modify this property. This includes
	* the values to which (or from which) [bindings]{@link module:enyo/BindingSupport~BindingSupport} are bound.
	*
	* @type {Object}
	* @default null
	* @public
	*/
	attributes: null,

	/**
	* The [source(s)]{@link module:enyo/Source~Source} to use when [fetching]{@link module:enyo/Model~Model#fetch},
	* [committing]{@link module:enyo/Model~Model#commit}, or [destroying]{@link module:enyo/Model~Model#destroy}.
	* Any method that uses sources may override this default value in its configuration
	* options. This value may be a [string]{@glossary String}, an
	* [Array]{@glossary Array} of strings, an instance of {@link module:enyo/Source~Source}, or an
	* array of `enyo/Source` instances.
	*
	* @see module:enyo/Source~Source
	* @see module:enyo/Model~Model#fetch
	* @see module:enyo/Model~Model#commit
	* @see module:enyo/Model~Model#destroy
	* @type {(String|String[]|module:enyo/Source~Source|module:enyo/Source~Source[])}
	* @default null
	* @public
	*/
	source: null,

	/**
	* These [keys]{@glossary Object.keys} will be the only
	* [attributes]{@link module:enyo/Model~Model#attributes} included if the
	* [model]{@link module:enyo/Model~Model} is [committed]{@link module:enyo/Model~Model#commit}. This
	* directly modifies the result of calling [raw()]{@link module:enyo/Model~Model#raw}. If
	* not defined, all keys from the [attributes]{@link module:enyo/Model~Model#attributes}
	* [hash]{@glossary Object} will be used.
	*
	* @see module:enyo/Model~Model#raw
	* @see module:enyo/Model~Model#toJSON
	* @type {String[]}
	* @default null
	* @public
	*/
	includeKeys: null,

	/**
	* The inheritable default configuration options. These specify the behavior of particular
	* API features of {@link module:enyo/Model~Model}. Any method that uses these options may override
	* the default values in its own configuration options. Note that setting an
	* [options hash]{@glossary Object} on a [subkind]{@glossary subkind} will result in
	* the new values' being merged with--not replacing--the
	* [superkind's]{@glossary superkind} own `options`.
	*
	* @type {module:enyo/Model~Model~Options}
	* @public
	*/
	options: {
		silent: false,
		commit: false,
		parse: false,
		fetch: false
	},

	/**
	* The current [state(s)]{@link module:enyo/States} possessed by the [model]{@link module:enyo/Model~Model}.
	* There are limitations as to which state(s) the model may possess at any given time.
	* By default, a model is [NEW]{@link module:enyo/States#NEW} and [CLEAN]{@link module:enyo/States#CLEAN}.
	* Note that this is **not** a [bindable]{@link module:enyo/BindingSupport~BindingSupport} property.
	*
	* @see module:enyo/States~States
	* @see {@link module:enyo/StateSupport~StateSupport}
	* @type {module:enyo/States~States}
	* @readonly
	* @public
	*/
	status: States.NEW | States.CLEAN,

	/**
	* The unique attribute by which the [model]{@link module:enyo/Model~Model} may be indexed. The
	* attribute's value must be unique across all instances of the specific model
	* [kind]{@glossary kind}
	*
	* @type {String}
	* @default 'id'
	* @public
	*/
	primaryKey: 'id',

	/**
	* Inspects and restructures incoming data prior to [setting]{@link module:enyo/Model~Model#set} it on
	* the [model]{@link module:enyo/Model~Model}. While this method may be called directly, it is most
	* often used via the [parse]{@link module:enyo/Model~Model~Options#parse} option and executed
	* automatically, either during initialization or when [fetched]{@link module:enyo/Model~Model#fetch}
	* (or, in some cases, both). This is a virtual method and must be provided to suit a
	* given implementation's needs.
	*
	* @see module:enyo/Model~Model~Options#parse
	* @param {*} data - The incoming data that may need to be restructured or reduced prior to
	*	being [set]{@link module:enyo/Model~Model#set} on the [model]{@link module:enyo/Model~Model}.
	* @returns {Object} The [hash]{@glossary Object} to apply to the
	*	model via [set()]{@link module:enyo/Model~Model#set}.
	* @virtual
	* @public
	*/
	parse: function (data) {
		return data;
	},

	/**
	* Returns an [Object]{@glossary Object} that represents the underlying data structure
	* of the [model]{@link module:enyo/Model~Model}. This is dependent on the current
	* [attributes]{@link module:enyo/Model~Model#attributes} as well as the
	* [includeKeys]{@link module:enyo/Model~Model#includeKeys}.
	* [Computed properties]{@link module:enyo/ComputedSupport} are **never** included.
	*
	* @see module:enyo/Model~Model#includeKeys
	* @see module:enyo/Model~Model#attributes
	* @returns {Object} The formatted [hash]{@glossary Object} representing the underlying
	*	data structure of the [model]{@link module:enyo/Model~Model}.
	* @public
	*/
	raw: function () {
		var inc = this.includeKeys
			, attrs = this.attributes
			, keys = inc || Object.keys(attrs)
			, cpy = inc? utils.only(inc, attrs): utils.clone(attrs);
		keys.forEach(function (key) {
			var ent = this.get(key);
			if (typeof ent == 'function') cpy[key] = ent.call(this);
			else if (ent && ent.raw) cpy[key] = ent.raw();
			else cpy[key] = ent;
		}, this);
		return cpy;
	},

	/**
	* Returns the [JSON]{@glossary JSON} serializable [raw()]{@link module:enyo/Model~Model#raw} output
	* of the [model]{@link module:enyo/Model~Model}. Will automatically be executed by
	* [JSON.parse()]{@glossary JSON.parse}.
	*
	* @see module:enyo/Model~Model#raw
	* @returns {Object} The return value of [raw()]{@link module:enyo/Model~Model#raw}.
	* @public
	*/
	toJSON: function () {

		// @NOTE: Because this is supposed to return a JSON parse-able object
		return this.raw();
	},

	/**
	* Restores an [attribute]{@link module:enyo/Model~Model#attributes} to its previous value. If no
	* attribute is specified, all previous values will be restored.
	*
	* @see module:enyo/Model~Model#set
	* @see module:enyo/Model~Model#previous
	* @param {String} [prop] - The [attribute]{@link module:enyo/Model~Model#attributes} to
	*	[restore]{@link module:enyo/Model~Model#restore}. If not provided, all attributes will be
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
	* Commits the [model]{@link module:enyo/Model~Model} to a [source or sources]{@link module:enyo/Model~Model#source}.
	* A model cannot be [committed]{@link module:enyo/Model~Model#commit} if it is in an
	* [error]{@link module:enyo/States#ERROR} ({@link module:enyo/StateSupport~StateSupport#isError}) or
	* [busy]{@link module:enyo/States#BUSY} ({@link module:enyo/StateSupport~StateSupport#isBusy})
	* [state]{@link module:enyo/Model~Model#status}. While executing, it will add the
	* [COMMITTING]{@link module:enyo/States#COMMITTING} flag to the model's
	* [status]{@link module:enyo/Model~Model#status}. Once it has completed execution, it will
	* remove this flag (even if it fails).
	*
	* @see module:enyo/Model~Model#committed
	* @see module:enyo/Model~Model#status
	* @param {module:enyo/Model~Model~ActionOptions} [opts] - Optional configuration options.
	* @returns {this} The callee for chaining.
	* @public
	*/
	commit: function (opts) {
		var options,
			source,
			it = this;

		// if the current status is not one of the error or busy states we can continue
		if (!(this.status & (States.ERROR | States.BUSY))) {

			// if there were options passed in we copy them quickly so that we can hijack
			// the success and error methods while preserving the originals to use later
			options = opts ? utils.clone(opts, true) : {};

			// make sure we keep track of how many sources we're requesting
			source = options.source || this.source;
			if (source && ((source instanceof Array) || source === true)) {
				this._waiting = source.length ? source.slice() : Object.keys(Source.sources);
			}

			options.success = function (source, res) {
				it.committed(opts, res, source);
			};

			options.error = function (source, res) {
				it.errored('COMMITTING', opts, res, source);
			};

			// set the state
			this.status = this.status | States.COMMITTING;

			// now pass this on to the source to execute as it sees fit
			Source.execute('commit', this, options);
		} else this.errored(this.status, opts);

		return this;
	},

	/**
	* Fetches the [model]{@link module:enyo/Model~Model} from a
	* [source or sources]{@link module:enyo/Model~Model#source}. A model cannot be
	* [fetched]{@link module:enyo/Model~Model#fetch} if it is in an
	* [error]{@link module:enyo/States#ERROR} ({@link module:enyo/StateSupport~StateSupport#isError}) or
	* [busy]{@link module:enyo/States#BUSY} ({@link module:enyo/StateSupport~StateSupport#isBusy})
	* [state]{@link module:enyo/Model~Model#status}. While executing, it will add the
	* [FETCHING]{@link module:enyo/States#FETCHING} flag to the model's
	* [status]{@link module:enyo/Model~Model#status}. Once it has completed execution, it will
	* remove this flag (even if it fails).
	*
	* @see module:enyo/Model~Model#fetched
	* @see module:enyo/Model~Model#status
	* @param {module:enyo/Model~Model~ActionOptions} [opts] - Optional configuration options.
	* @returns {this} The callee for chaining.
	* @public
	*/
	fetch: function (opts) {
		var options,
			source,
			it = this;

		// if the current status is not one of the error or busy states we can continue
		if (!(this.status & (States.ERROR | States.BUSY))) {

			// if there were options passed in we copy them quickly so that we can hijack
			// the success and error methods while preserving the originals to use later
			options = opts ? utils.clone(opts, true) : {};

			// make sure we keep track of how many sources we're requesting
			source = options.source || this.source;
			if (source && ((source instanceof Array) || source === true)) {
				this._waiting = source.length ? source.slice() : Object.keys(Source.sources);
			}

			options.success = function (source, res) {
				it.fetched(opts, res, source);
			};

			options.error = function (source, res) {
				it.errored('FETCHING', opts, res, source);
			};

			// set the state
			this.status = this.status | States.FETCHING;

			// now pass this on to the source to execute as it sees fit
			Source.execute('fetch', this, options);
		} else this.errored(this.status, opts);

		return this;
	},

	/**
	* Destroys the [model]{@link module:enyo/Model~Model}. By default, the model will only
	* be [destroyed]{@glossary destroy} in the client. To execute with a
	* [source or sources]{@link module:enyo/Model~Model#source}, either the
	* [commit default option]{@link module:enyo/Model~Model#options} must be `true` or a
	* `source` property must be explicitly provided in the `opts` parameter.
	* A model cannot be destroyed (using a source) if it is in an
	* [error]{@link module:enyo/States#ERROR} ({@link module:enyo/StateSupport~StateSupport#isError})
	* or [busy]{@link module:enyo/States#BUSY} ({@link module:enyo/StateSupport~StateSupport#isBusy})
	* [state]{@link module:enyo/Model~Model#status}. While executing, it will add the
	* [DESTROYING]{@link module:enyo/States#DESTROYING} flag to the model's
	* [status]{@link module:enyo/Model~Model#status}. Once it has completed execution, it
	* will remove this flag (even if it fails).
	*
	* @see module:enyo/Model~Model#status
	* @param {module:enyo/Model~Model~ActionOptions} [opts] - Optional configuration options.
	* @returns {this} The callee for chaining.
	* @public
	*/
	destroy: function (opts) {
		var options = opts ? utils.mixin({}, [this.options, opts]) : this.options,
			it = this,
			idx;

		// this becomes an (potentially) async operation if we are committing this destroy
		// to a source and its kind of tricky to figure out because there are several ways
		// it could be flagged to do this

		if (options.commit || options.source) {

			// if the current status is not one of the error states we can continue
			if (!(this.status & (States.ERROR | States.BUSY))) {

				// remap to the originals
				options = opts ? utils.clone(opts, true) : {};

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

				this.status = this.status | States.DESTROYING;

				Source.execute('destroy', this, options);
			} else if (this.status & States.ERROR) this.errored(this.status, opts);

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
		this.status = States.DESTROYED;
		this.unsilence(true).emit('destroy');
		this.removeAllListeners();
		this.removeAllObservers();

		// if this does not have the the batching flag (that would be set by a collection)
		// then we need to do the default of removing it from the store
		if (!opts || !opts.batching) this.store.remove(this);
	},

	/**
	* Retrieves the value for the given property or path. If the property is a
	* [computed property]{@link module:enyo/ComputedSupport}, then it will return
	* that value; otherwise, it will attempt to retrieve the value from the
	* [attributes hash]{@link module:enyo/Model~Model#attributes}.
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
	* [model]{@link module:enyo/Model~Model}. Properties are applied to the
	* [attributes hash]{@link module:enyo/Model~Model#attributes} and are retrievable via
	* [get()]{@link module:enyo/Model~Model#get}. If properties were updated and the `silent`
	* option is not `true`, this method will emit a `change` event, as well as
	* individual [notifications]{@link module:enyo/ObserverSupport~ObserverSupport.notify} for the
	* properties that were modified.
	*
	* @fires module:enyo/Model~Model#change
	* @see {@link module:enyo/ObserverSupport~ObserverSupport}
	* @see {@link module:enyo/BindingSupport~BindingSupport}
	* @param {(String|Object)} path - Either the property name or a [hash]{@glossary Object}
	*	of properties and values to set.
	* @param {(*|module:enyo/Model~Options)} is If `path` is a [string]{@glossary String},
	* this should be the value to set for the given property; otherwise, it should be
	* an optional hash of available [configuration options]{@link module:enyo/Model~Model~Options}.
	* @param {module:enyo/Model~Options} [opts] - If `path` is a string, this should be the
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

			opts = opts ? utils.mixin({}, [options, opts]) : options;
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
				if (!fetched) this.status = (this.status | States.DIRTY) & ~States.CLEAN;

				if (!silent) this.emit('change', changed, this);

				if (commit && !fetched) this.commit(opts);

				// reset value so subsequent changes won't be added to this change-set
				this.changed = null;
			}
		}

		return this;
	},

	/**
	* A bit of hackery to facade the normal [getter]{@link module:enyo/ComputedSupport~ComputedSupport#get}. Note that
	* we pass an arbitrary super-method that automatically returns `undefined`, which is
	* consistent with this use case and its intended purpose.
	*
	* @private
	*/
	_getComputed: ComputedSupport.get.fn(function () { return undefined; }),

	/**
	* Initializes the [model]{@link module:enyo/Model~Model}. Unlike some methods, the parameters are not
	* interchangeable. If you are not using a particular (optional) parameter, pass in `null`.
	*
	* @param {Object} [attrs] - Optionally initialize the [model]{@link module:enyo/Model~Model} with some
	*	[attributes]{@link module:enyo/Model~Model#attributes}.
	* @param {Object} [props] - Properties to apply directly to the [model]{@link module:enyo/Model~Model} and
	*	not the [attributes hash]{@link module:enyo/Model~Model#attributes}. If these properties contain an
	*	`options` property (a [hash]{@glossary Object}) it will be merged with existing
	*	[options]{@link module:enyo/Model~Model#options}.
	* @param {module:enyo/Model~Model~Options} [opts] - This is a one-time [options hash]{@link module:enyo/Model~Model~Options} that
	*	is only used during initialization and not applied as defaults.
	* @public
	*/
	constructor: function (attrs, props, opts) {

		// in cases where there is an options hash provided in the _props_ param
		// we need to integrate it manually...
		if (props && props.options) {
			this.options = utils.mixin({}, [this.options, props.options]);
			delete props.options;
		}

		// the _opts_ parameter is a one-hit options hash it does not leave
		// behind its values as default options...
		opts = opts? utils.mixin({}, [this.options, opts]): this.options;

		// go ahead and mix all of the properties in
		props && utils.mixin(this, props);

		var noAdd = opts.noAdd
			, commit = opts.commit
			, parse = opts.parse
			, fetch = this.options.fetch
			, defaults;

		// defaults = this.defaults && (typeof this.defaults == 'function'? this.defaults(attrs, opts): this.defaults);
		defaults = this.defaults && typeof this.defaults == 'function'? this.defaults(attrs, opts): null;

		// ensure we have a unique identifier that could potentially
		// be used in remote systems
		this.euid = this.euid || utils.uid('m');

		// if necessary we need to parse the incoming attributes
		attrs = attrs? parse? this.parse(attrs): attrs: null;

		// ensure we have the updated attributes
		this.attributes = this.attributes? defaults? utils.mixin({}, [defaults, this.attributes]): utils.clone(this.attributes, true): defaults? utils.clone(defaults, true): {};
		attrs && utils.mixin(this.attributes, attrs);
		this.previous = utils.clone(this.attributes);

		// now we need to ensure we have a store and register with it
		this.store = this.store || Store;

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
	emit: kind.inherit(function (sup) {
		return function (e, props) {
			if (e == 'change' && props && this.isObserving()) {
				for (var key in props) this.notify(key, this.previous[key], props[key]);
			}
			return sup.apply(this, arguments);
		};
	}),

	/**
	* Overloaded to alias the (also overloaded) [emit()]{@link module:enyo/Model~Model#emit} method.
	*
	* @private
	*/
	triggerEvent: function () {
		return this.emit.apply(this, arguments);
	},

	/**
	* When a [fetch]{@link module:enyo/Model~Model#fetch} has completed successfully, it is returned
	* to this method. This method handles special and important behavior; it should not be
	* called directly and, when overloading, care must be taken to ensure that you call
	* the super-method. This correctly sets the [status]{@link module:enyo/Model~Model#status} and, in
	* cases where multiple [sources]{@link module:enyo/Model~Model#source} were used, it waits until
	* all have responded before clearing the [FETCHING]{@link module:enyo/States#FETCHING} flag.
	* If a [success]{@link module:enyo/Model~Model~Success} callback was provided, it will be called
	* once for each source.
	*
	* @param {module:enyo/Model~Model~ActionOptions} opts - The original options passed to
	*	[fetch()]{@link module:enyo/Model~Model#fetch}, merged with the defaults.
	* @param {*} [res] - The result provided from the given [source]{@link module:enyo/Model~Model#source},
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
		opts = opts ? utils.mixin({}, [options, opts]) : options;
		opts.fetched = true;

		// for a special case purge to only use the result sub-tree of the fetched data for
		// the model attributes
		if (opts.parse) res = this.parse(res);

		// note this will not add the DIRTY state because it was fetched but also note that it
		// will not clear the DIRTY flag if it was already DIRTY
		if (res) this.set(res, opts);

		// clear the FETCHING and NEW state (if it was NEW) we do not set it as dirty as this
		// action alone doesn't warrant a dirty flag that would need to be set in the set method
		if (!this._waiting) this.status = this.status & ~(States.FETCHING | States.NEW);

		// now look for an additional success callback
		if (opts.success) opts.success(this, opts, res, source);
	},

	/**
	* When a [commit]{@link module:enyo/Model~Model#commit} has completed successfully, it is returned
	* to this method. This method handles special and important behavior; it should not be
	* called directly and, when overloading, care must be taken to ensure that you call the
	* super-method. This correctly sets the [status]{@link module:enyo/Model~Model#status} and, in cases
	* where multiple [sources]{@link module:enyo/Model~Model#source} were used, it waits until all have
	* responded before clearing the [COMMITTING]{@link module:enyo/States#COMMITTING} flag. If a
	* [success]{@link module:enyo/Model~Model~Success} callback was provided, it will be called once for
	* each source.
	*
	* @param {module:enyo/Model~Model~ActionOptions} opts - The original options passed to
	*	[commit()]{@link module:enyo/Model~Model#commit}, merged with the defaults.
	* @param {*} [res] - The result provided from the given [source]{@link module:enyo/Model~Model#source},
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
			this.previous = utils.clone(this.attributes);
			this.status = (this.status | States.CLEAN) & ~(States.COMMITTING | States.DIRTY);
		}

		if (opts && opts.success) opts.success(this, opts, res, source);
	},

	/**
	* When an action ([fetch()]{@link module:enyo/Model~Model#fetch}, [commit()]{@link module:enyo/Model~Model#commit},
	* or [destroy()]{@link module:enyo/Model~Model#destroy}) has failed, it will be passed to this method.
	* This method handles special and important behavior; it should not be called directly
	* and, when overloading, care must be taken to ensure that you call the super-method.
	* This correctly sets the [status]{@link module:enyo/Model~Model#status} to the known
	* [error state]{@link module:enyo/States#ERROR}, or to the
	* [unknown error state]{@link module:enyo/States#ERROR_UNKNOWN} if it the error state could not
	* be determined. If an [error callback]{@link module:enyo/Model~Model~Error} was provided, this method
	* will execute it.
	*
	* @see {@link module:enyo/StateSupport~StateSupport#clearError}
	* @param {String} action - The action (one of `'FETCHING'`, `'COMMITTING'`, or
	* `'DESTROYING'`) that failed and is now in an [error state]{@link module:enyo/States#ERROR}.
	* @param {module:enyo/Model~Model~ActionOptions} opts - The original options passed to the `action`
	* method, merged with the defaults.
	* @param {*} [res] - The result provided from the given [source]{@link module:enyo/Model~Model#source},
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
			stat = States['ERROR_' + action];
		} else stat = action;

		if (isNaN(stat) || (stat & ~States.ERROR)) stat = States.ERROR_UNKNOWN;

		// correctly set the current status and ensure we clear any busy flags
		this.status = (this.status | stat) & ~States.BUSY;

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
* @name module:enyo/Model~Model.concat
* @static
* @private
*/
Model.concat = function (ctor, props) {
	var proto = ctor.prototype || ctor;

	if (props.options) {
		proto.options = utils.mixin({}, [proto.options, props.options]);
		delete props.options;
	}
};

/**
* @private
*/
kind.features.push(function (ctor) {
	if (ctor.prototype instanceof Model) {
		!Store.models[ctor.prototype.kindName] && (Store.models[ctor.prototype.kindName] = new ModelList());
	}
});
