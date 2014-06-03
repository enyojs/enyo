(function (enyo) {
	
	/**
		
	*/
	function ModelList () {
		Array.call(this);
		
		this.table = {};
	}
	
	ModelList.prototype = [];
	
	enyo.ModelList = ModelList;
		
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
		
	enyo.ModelList.prototype.has = function (model) {
		if (model === undefined || model === null) return false;
		
		if (typeof model == 'string' || typeof model == 'number') {
			return !! this.table[model];
		} else return this.indexOf(model) > -1;
	};
	
	enyo.ModelList.prototype.resolve = function (model) {
		if (typeof model == 'string' || typeof model == 'number') {
			return this.table[model];
		} else return model;
	};
	
})(enyo);