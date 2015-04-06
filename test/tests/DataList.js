describe('enyo.DataList', function () {
	
	var Repeater = enyo.DataList,
		proto = Repeater.prototype;
	
	describe('methods', function () {
		
		// these selection api methods are tested in the usage section since they could all
		// be better tested in unity
		describe('#select', function () {
			it ('should respond to the method select', function () {
				expect(proto).to.itself.respondTo('select');
			});
		});
		describe('#deselect', function () {
			it ('should respond to the method deselect', function () {
				expect(proto).to.itself.respondTo('deselect');
			});
		});
		describe('#selectAll', function () {
			it ('should respond to the method selectAll', function () {
				expect(proto).to.itself.respondTo('selectAll');
			});
		});
		describe('#deselectAll', function () {
			it ('should respond to the method deselectAll', function () {
				expect(proto).to.itself.respondTo('deselectAll');
			});
		});
		
	});
	
	describe('usage', function () {
		
		describe('selection', function () {
			
			// the repeater instance we will use
			var repeater,
			
			// the collection
				collection,
				
			// the temporary div
				div,
				
			// the binding target for testing bound selections
				target;
			
			before(function () {
				
				// create our repeater kind
				enyo.kind({
					name: 'TestRepeater',
					kind: Repeater,
					renderDelay: null,
					components: [
						{}
					]
				});
				
				// we have to give the repeater something to render into or else the child
				// controls won't be available
				div = document.createElement('div');
				
				// we need an object that we can create bindings from/to
				target = new enyo.Object();
				
				// we will instance the collection and add some data
				collection = new enyo.Collection([
					{id: 0},
					{id: 1},
					{id: 2},
					{id: 3}
				]);
				
				// instance the repeater with the collection so it will have a few children
				// to look through
				repeater = new TestRepeater({
					collection: collection
				});
				
				// create the binding that we will test later
				repeater.binding({from: 'selected', to: 'selected', target: target});
				
				// render it into the temporary node
				repeater.renderInto(div);
			});
			
			after(function () {
				
				// dereference our constructor
				TestRepeater = null;
				
				// teardown our rendered control
				repeater.destroy();
				
				// teardown our collection
				collection.destroy();
				
				// teardown our temporary object
				target.destroy();
				
			});
			
			it ('should be able to select a valid index by default (selection set to true)',
				function () {
				repeater.select(0);
				expect(repeater.get('selected')).to.exist.and.to.be.an.instanceof(enyo.Model);
				expect(repeater.get('selected').get('id')).to.equal(0);
			});
			
			it ('should be able to deselect a selected index', function () {
				repeater.deselect(0);
				expect(repeater.get('selected')).to.not.exist;
			});
			
			it ('should not make a selection when selection is disabled', function () {
				repeater.set('selection', false);
				repeater.select(0);
				expect(repeater.get('selected')).to.not.exist;
			});
			
			it ('should update bindings to the selected property for single selection as a ' +
				'model instance when valid', function () {
				
				repeater.set('selection', true);
				repeater.select(0);
				
				// ensure that the selection is valid and equal (same reference) to the one
				// the repeater holds as its selected instance
				expect(target.get('selected')).to.exist.and.to.equal(repeater.get('selected'));
			});
			
			it ('should update bindings to the selected property as an array when multiple ' +
				'selection is enabled', function () {
				
				var selected;
				
				repeater.set('selectionType', 'multi');
				repeater.select(0);
				repeater.select(1);
				selected = repeater.get('selected');
				expect(selected).to.exist.and.to.have.length(2);
				expect(selected).to.equal(repeater.get('selected'));
			});
			
			it ('should be able to deselect a selected index when multiply selected', function () {
				repeater.deselect(0);
				expect(repeater.get('selected')).to.exist.and.to.have.length(1);
			});
			
			it ('should update the bound array when deselecting an index that was multiply ' +
				'selected', function () {
				
				expect(target.get('selected')).to.exist.and.to.have.length(1);
				expect(target.get('selected')).to.equal(repeater.get('selected'));
			});
			
			it ('should set the correct property on the model if selectionProperty is set',
				function () {
				
				var selected;
				
				repeater.deselectAll();
				repeater.selectionProperty = 'selected';
				repeater.selectAll();
				selected = repeater.get('selected');
				if (selected) {
					selected = selected.filter(function (ln) {
						return ln.get('selected');
					});
				}
				repeater.deselectAll();
				expect(selected).to.exist.and.to.have.length(collection.length);
			});
			
			it ('should select all available indices when selectionType is "multi" and the ' +
				'selectAll method is called', function () {
				
				repeater.selectAll();
				expect(repeater.get('selected')).to.exist.and.to.have.length(collection.length);
			});
			
			it ('should deselect all available indices when selectionType is "multi" and the ' +
				'deselectAll method is called', function () {
				
				repeater.deselectAll();
				expect(repeater.get('selected')).to.exist.and.to.have.length(0);
			});
			
			it ('should deselect a model that was selected and destroyed in single select mode',
				function () {
				
				repeater.set('selectionType', 'single');
				repeater.select(3);
				
				// ensure that we had a selection to begin with for the sake of the test
				expect(repeater.get('selected')).to.exist.and.to.equal(collection.at(3));
				collection.at(3).destroy();
				
				// now we expect it to have been cleared entirely
				expect(repeater.get('selected')).to.be.null;
			});
			
			it ('should update a binding to the selected property with null if in single select ' +
				'mode and the selected model was destroyed', function () {
				
				expect(target.get('selected')).to.be.null;
			});
			
			it ('should deselect a model that was selected and destroyed in multiple select mode',
				function () {
				
				repeater.set('selectionType', 'multi');
				repeater.selectAll();
				
				// for sanity of the test
				expect(repeater.get('selected')).to.exist.and.to.have.length(3);
				expect(target.get('selected')).to.exist.and.to.equal(repeater.get('selected'));
				
				collection.at(0).destroy();
				
				// now we expect it to have been removed from the array
				expect(repeater.get('selected')).to.exist.and.to.have.length(2);
			});
			
			it ('should update a binding to the selected property with the correct array when ' +
				'in multiple select mode and a selected model was destroyed', function () {
				
				// we sanity checked the binding before the destroy in the last test so we only
				// need to verify they are the same now
				expect(target.get('selected')).to.equal(repeater.get('selected'));
			});
			
		});
		
	});
	
});