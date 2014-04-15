describe ("Collection", function () {
	describe ("Methods", function () {
		var ctor = enyo.Collection;
		
		describe ("#add", function () {
			var col, shared, destroy;
			
			shared = [
				{id: 1, name: "Kevin"},
				{id: 2, name: "Cole"},
				{id: 3, name: "Gray"},
				{id: 4, name: "Jim"},
				{id: 5, name: "Aaron"},
				{id: 6, name: "Blake"}
			];
			
			afterEach (function () {
				col && destroy && col.destroy();
			});
			
			it ("should respond to the method add", function () {
				expect(ctor.prototype).to.respondTo("add");
			});
			it ("should accept an array of object literals", function () {
				var fn;
				col = new ctor();
				col.on("add", function () { throw new Error("add"); });
				fn = function () {
					col.add(shared);
				};
				expect(fn).to.throw("add");
				expect(col).to.have.length(6);
			});
			it ("should default to using existing models when possible", function () {
				var fn;
				expect(col).to.have.length(6);
				
				fn = function () {
					col.add([{id: 6, name: "Blake Stephens"}, {id: 7, name: "Jeff"}]);
				};
				
				expect(fn).to.throw("add");
				expect(col).to.have.length(7);
				expect(col.at(5).get("name")).to.equal("Blake Stephens");
			});
			it ("should accept an array of model instances", function () {
				var len = col.length, fn;
				enyo.forEach(shared, function (ln, idx) {
					shared[idx] = new enyo.Model(ln);
				});
				
				fn = function () {
					col.add(shared);
				};
				expect(fn).to.not.throw("add");
				expect(col).to.have.length(len);
				destroy = true;
			});
		});
		describe ("#remove", function () {
			var col, shared, destroy;
			
			afterEach (function () {
				col && destroy && col.destroy();
			});
			
			it ("should respond to the method remove", function () {
				expect(ctor.prototype).to.respondTo("remove");
			});
			
			it ("should accept an array of model instances to be removed, if found", function () {
				var model, fn;
				col = new ctor();
				col.on("remove", function () { throw new Error("remove"); });
				col.add({id: 0, name: "Cole"});
				expect(col).to.have.length(1);
				model = col.at(0);
				expect(model).to.exist.and.to.be.instanceof(enyo.Model);
				fn = function () {
					col.remove(model);
				};
				expect(fn).to.throw("remove");
				expect(col).to.have.length(0);
				model.destroy();
				model = new enyo.Model();
				expect(fn).to.not.throw("remove");
				model.destroy();
				destroy = true;
			});
		});
	});
});