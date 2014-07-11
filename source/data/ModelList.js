(function (enyo) {
	
	/**
	* A special type of [Array]{@link external:Array} used internally by _data layer_
	* [kinds]{@link external:kind}.
	*
	* @class enyo.ModelList
	* @protected
	*/
	function ModelList (args) {
		Array.call(this);
		this.table = {};
		if (args) this.add(args, 0);
	}
	
	ModelList.prototype = Object.create(Array.prototype);
	
	enyo.ModelList = ModelList;
	
	/**
	* Adds [models]{@link enyo.Model} to the [list]{@link enyo.ModelList}. It updates an internal
	* table by the [models]{@link enyo.Model} [primaryKey]{@link enyo.Model#primaryKey} (if
	* possible) and its [euid]{@link external:euid}.
	*
	* @name enyo.ModelList#add
	* @method
	* @param {(enyo.Model|enyo.Model[])} models The [model or models]{@link enyo.Model} to add to
	*	the [list]{@link enyo.ModelList}.
	* @param {Number} [idx] If provided and valid will [splice]{@link external:Array.splice} the
	*	[models]{@link enyo.Model} into the [list]{@link enyo.ModelList} at that position.
	* @returns {enyo.Model[]} An immutable [array]{@link external:Array} with any
	*	[models]{@link enyo.Model} that were actually added.
	* @protected
	*/
	enyo.ModelList.prototype.add = function (models, idx) {
		var table = this.table,
			added = [],
			model,
			euid,
			id,
			i = 0;
		
		if (models && !(models instanceof Array)) models = [models];
		
		for (; (model = models[i]); ++i) {
			euid = model.euid;
			
			// we only want to actually add models we haven't already seen...
			if (!table[euid]) {
				id = model.get(model.primaryKey);
			
				if (id != null) {
				
					// @TODO: For now if we already have an entry for a model by its supposed unique
					// identifier but it isn't the instance we just found we can't just
					// overwrite the previous instance so we mark the new one as headless
					if (table[id] && table[id] !== model) model.headless = true;
					// otherwise we do the normal thing and add the entry for it
					else table[id] = model; 
				}
			
				// nomatter what though the euid should be unique
				table[euid] = model;
				added.push(model);
			}
		}
		
		if (added.length) {
			idx = !isNaN(idx) ? Math.min(Math.max(0, idx), this.length) : 0;
			added.unshift(0);
			added.unshift(idx);
			this.splice.apply(this, added);
		}
		
		return added.length > 0 ? added.slice(2) : added; 
	};
	
	/**
	* Removes the [models]{@link enyo.Model} from the [list]{@link enyo.ModelList}.
	*
	* @name enyo.ModelList#remove
	* @method
	* @param {(enyo.Model|enyo.Model[])} models The [model or models]{@link enyo.Model} to remove
	*	from the [list]{@link enyo.ModelList}.
	* @returns {enyo.Model[]} An immutable [array]{@link external:Array} of
	*	[models]{@link enyo.Model} that were actually removed from the [list]{@link enyo.ModelList}.
	* @protected
	*/
	enyo.ModelList.prototype.remove = function (models) {
		var table = this.table,
			removed = [],
			model,
			idx,
			id,
			i;
		
		if (models && !(models instanceof Array)) models = [models];
		
		// we start at the end to ensure that you could even pass the list itself
		// and it will work
		for (i = models.length - 1; (model = models[i]); --i) {
			table[model.euid] = null;
			id = model.get(model.primaryKey);
			
			if (id != null) table[id] = null;
			
			idx = models === this ? i : this.indexOf(model);
			if (idx > -1) {
				this.splice(idx, 1);
				removed.push(model);
			}
		}
		
		return removed;
	};
	
	/**
	* Determine if the [model]{@link enyo.Model} is present in the [list]{@link enyo.ModelList}. It
	* attempts to resolve a [string]{@link external:String} or [number]{@link external:Number} to
	* either a [primaryKey]{@link enyo.Model} or [euid]{@link external:euid}.
	*
	* @name enyo.ModelList#has
	* @method
	* @param {(enyo.Model|String|Number)} model An identifier representing either the
	*	[model]{@link enyo.Model} instance, its [primaryKey]{@link enyo.Model} or its
	*	[euid]{@link external:euid}.
	* @returns {Boolean} Whether or not the _model_ is present in the [list]{@link enyo.ModelList}.
	* @protected
	*/
	enyo.ModelList.prototype.has = function (model) {
		if (model === undefined || model === null) return false;
		
		if (typeof model == 'string' || typeof model == 'number') {
			return !! this.table[model];
		} else return this.indexOf(model) > -1;
	};
	
	/**
	* Attempts to turn an identifier into a [model]{@link enyo.Model}. The identifier should be
	* a [string]{@link external:String} or [number]{@link external:Number}.
	*
	* @name enyo.ModelList#resolve
	* @method
	* @param {(String|Number)} model An identifier of either a
	*	[primaryKey]{@link enyo.Model#primaryKey} or an [euid]{@link external:euid}.
	* @returns {(undefined|null|enyo.Model)} If the identifier could be resolved a
	*	[model]{@link enyo.Model} instance will be returned otherwise `undefined` or possibly
	*	`null` if the [model]{@link enyo.Model} had once belonged to the
	*	[list]{@link enyo.ModelList}.
	* @protected
	*/
	enyo.ModelList.prototype.resolve = function (model) {
		if (typeof model == 'string' || typeof model == 'number') {
			return this.table[model];
		} else return model;
	};
	
	/**
	* Copies the current [list]{@link enyo.ModelList} and returns an shallow copy. This method
	* differs from [slice]{@link external:Array.slice} that it inherits from native
	* [Array]{@link external:Array} because this returns a {@link enyo.ModelList} and
	* [slice]{@link external:Array.slice} returns an [Array]{@link external:Array}.
	* 
	* @name enyo.ModelList#copy
	* @method
	* @returns {enyo.ModelList} A shallow copy of the callee.
	* @protected
	*/
	enyo.ModelList.prototype.copy = function () {
		return new ModelList(this);
	};
	
})(enyo);