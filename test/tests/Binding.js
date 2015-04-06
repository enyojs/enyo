describe('enyo.Binding', function () {
	
	var Binding = enyo.Binding,
		proto = Binding.prototype;
	
	describe('methods', function () {
		
		// to test these methods we need an instance of a binding and a target and source
		// object to connect
		var binding,
		
		// the source object
			source,
			
		// the target object
			target;
			
		before(function () {
			
			// we create two generic objects and then a binding between them that we will
			// manipulate with api methods to verify they are working as intended
			source = new enyo.Object({prop: 0});
			target = new enyo.Object();
			
			// create our binding
			binding = source.binding({
				source: source,
				from: 'prop',
				target: target,
				to: 'prop'
			});
		});
		
		after(function () {
			
			// break it all down
			source.destroy();
			target.destroy();
		});
		
		describe('#isConnected', function () {
			
			it ('should respond to the method isConnected', function () {
				expect(proto).to.itself.respondTo('isConnected');
			});
			
			it ('should return true if the binding is connected (observing) at both ends',
				function () {
				
				// we expect the binding to already be connected the first time we look
				expect(binding.isConnected()).to.be.true;
			});
			
			it ('should return false if the binding is not connected (observing) at both ends',
				function () {
				
				binding.disconnect();
				expect(binding.isConnected()).to.be.false;
			});
			
		});
		
		describe('#isReady', function () {
			
			it ('should respond to the method isReady', function () {
				expect(proto).to.itself.respondTo('isReady');
			});
			
			it ('should return true if the binding has been resolved (only happens once)',
				function () {
				
				expect(binding.isReady()).to.be.true;
			});
			
			it ('should return false if any of the required parts could not be resolved',
				function () {
				
				// create a temporary binding with no information so it cannot be resolved
				var bnd = new enyo.Binding();
				
				// there is no way this should be true
				expect(bnd.isReady()).to.be.false;
				bnd.destroy();
			});
			
		});
		
		describe('#connect', function () {
			
			it ('should respond to the method connect', function () {
				expect(proto).to.itself.respondTo('connect');
			});
			
			it ('should connect a binding (begin observing at both ends) if it is ready',
				function () {
				
				// it is already disconnected from an earlier test of isConnected
				expect(binding.isConnected()).to.be.false;
				binding.connect();
				expect(binding.isConnected()).to.be.true;
			});
			
		});
		
		describe('#disconnect', function () {
			
			it ('should respond to the method disconnect', function () {
				expect(proto).to.itself.respondTo('disconnect');
			});
			
			it ('should stop observing both ends if it was connected', function () {
				
				// sanity check
				expect(source.get('prop')).to.exist.and.to.equal(target.get('prop'));
				
				// break the loop
				binding.disconnect();
				
				// expect that it reports being disconnected
				expect(binding.isConnected()).to.be.false;
				
				// update the value and then attempt a sync to ensure it isn't really connected
				source.set('prop', source.prop + 1);
				binding.sync();
				
				// should not have changed
				expect(source.get('prop')).to.be.above(target.get('prop'));
			});
			
		});
		
		describe('#sync', function () {
			
			it ('should respond to the method sync', function () {
				expect(proto).to.itself.respondTo('sync');
			});
			
			it ('should force a value synchronization from the source to the target if it is ' +
				'connected and ready', function () {
				
				binding.connect();
				binding.sync(true);
				expect(source.get('prop')).to.exist.and.to.equal(target.get('prop'));
			});
			
		});
		
		describe('#destroy', function () {
			
			before(function () {
				binding.destroy();
			});
			
			it ('should disconnect the binding', function () {
				expect(binding.isConnected()).to.be.false;
			});
			
			it ('should remove itself from its owner if it is not destroyed itself', function () {
				expect(source.bindings.indexOf(binding)).to.equal(-1);
			});
			
			it ('should permanently unready the binding by clearing all references', function () {
				expect(binding.ready).to.be.null;
				expect(binding.isReady()).to.be.false;
				expect(binding.owner).to.be.null;
				expect(binding.source).to.be.null;
				expect(binding.target).to.be.null;
			});
			
			it ('should remove itself from the global bindings array', function () {
				expect(Binding.find(binding.euid)).to.be.undefined;
			});
			
		});
		
	});
	
	describe('statics', function () {
		
		describe('~find', function () {
			
			// the binding instance we will use for these tests
			var binding;
			
			before(function () {
				binding = new Binding();
			});
		
			after(function () {
				binding.destroy();
			});
		
			it ('should respond to find', function () {
				expect(Binding).to.itself.respondTo('find');
			});
		
			it ('should return an instance of a binding if found by its euid', function () {
				expect(Binding.find(binding.euid)).to.equal(binding);
			});
			
			it ('should return undefined when not found', function () {
				expect(Binding.find(enyo.uid('b'))).to.be.undefined;
			});
			
		});
		
	});
	
	describe('properties', function () {
		
		// the source object for these tests
		var source,
		
		// the target for these tests
			target,
			
		// reference to a oneWay binding
			oneWay,
			
		// reference to a twoWay binding
			twoWay,
			
		// reference to a binding with autoConnect false
			noAuto,
			
		// reference to ownerless binding
			ownerless,

		// reference to global 'from' binding
			globalFrom,

		// reference to global 'to' binding
			globalTo;
		
		before(function () {
			
			// temporary kind used for transform tests
			enyo.kind({
				name: 'TestComponent',
				kind: 'enyo.Component',
				
				ownerless: 0,
				noAuto: 0,
				
				components: [
					{name: 'child1', bindings: [
						{transform: 'xform'}
					]}
				],
				
				// the test transform
				xform: function (value) {
					return value;
				}
			});
			
			// temporarily we create a truly global function
			window.globalXform = function (value, direction, binding) {
				if (value === 5) return binding.stop();
				// 0x01 is DIRTY_FROM
				return direction === 0x01 ? value + 1 : value - 1;
			};
			
			// we instance the ends of the bindings before creating them
			source = new TestComponent({oneWay: true, twoWay: false, sourceProp: 'source'});
			target = new enyo.Object();
			
			// we do this to be able to test resolution of the source and target later
			source.target = target;
			
			// now create two bindings a one-way and two-way binding for testing
			oneWay = source.binding({
				from: 'oneWay',
				to: 'target.oneWay'
			});
			
			twoWay = source.binding({
				from: 'twoWay',
				target: target,
				to: 'twoWay',
				oneWay: false,
				transform: 'xform'
			});
			
			noAuto = source.binding({
				from: 'noAuto',
				target: target,
				to: 'noAuto',
				oneWay: false,
				autoConnect: false,
				autoSync: false,
				transform: 'globalXform'
			});
			
			ownerless = new Binding({
				source: source,
				from: 'ownerless',
				target: target,
				to: 'ownerless',
				transform: function (value) { return value + 1; }
			});

			window.globalTestComponent = new TestComponent({sourceProp: 'source', destProp: null});
			globalFrom = target.binding({
				from: '^globalTestComponent.sourceProp',
				to: '.destProp'
			});

			globalTo = source.binding({
				from: '.sourceProp',
				to: '^globalTestComponent.destProp'
			});
		});
		
		after(function () {
			
			// dereference our constructor
			TestComponent = null;
			
			// free the objects
			source.destroy();
			target.destroy();
			ownerless.destroy();
			globalTo.destroy();
			globalFrom.destroy();
			globalTestComponent.destroy();
			
			// and the function
			window.globalXform = null;

			// and the global instance
			window.globalTestComponent = null;
		});
		
		describe('#oneWay', function () {
			
			it ('should have a default value of true', function () {
				expect(oneWay.oneWay).to.be.true;
			});
			
			it ('should indicate that the binding only synchronizes changes from the source ' +
				'to the target', function () {
				
				// sanity check to make sure they start synchronized
				expect(source.get('oneWay')).to.equal(target.get('oneWay'));
				
				source.set('oneWay', false);
				// expect to be synchronized
				expect(target.get('oneWay')).to.be.false;
				
				// should not see the same change in reverse
				target.set('oneWay', true);
				expect(source.get('oneWay')).to.be.false;
			});
			
			it ('should allow bi-directional synchronization when set to false (for two-way)',
				function () {
				
				// sanity check to make sure they start synchronized
				expect(source.get('twoWay')).to.equal(target.get('twoWay'));
				
				// check from source
				source.set('twoWay', true);
				expect(target.get('twoWay')).to.be.true;
				
				// check from the target
				target.set('twoWay', false);
				expect(source.get('twoWay')).to.be.false;
			});
			
		});
		
		describe('#connected', function () {
			
			it ('should be true when both ends have been resolved and their observers have been ' +
				'registered', function () {
				
				expect(oneWay.connected).to.be.true;
				expect(twoWay.connected).to.be.true;
			});
			
			it ('should be false when ends could not be resolved or it has been disconnected',
				function () {
				
				twoWay.disconnect();
				expect(twoWay.connected).to.be.false;
			});
			
		});
		
		describe('#autoConnect', function () {
			
			it ('should default to true and attempt to connect when initialized', function () {
				expect(oneWay.autoConnect).to.be.true;
				expect(oneWay.isConnected()).to.be.true;
			});
			
			it ('should keep a binding from connecting on initialization when false', function () {
				expect(noAuto.isConnected()).to.be.false;
			});
			
		});
		
		describe('#autoSync', function () {
			
			it ('should default to true and attempt to synchronize on initialization', function () {
				expect(oneWay.autoSync).to.be.true;
			});
			
			it ('should keep a binding from automatically synchronizing during initialization or ' +
				'when connecting/reconnecting if set to false', function () {
				
				noAuto.connect();
				expect(target.get('noAuto')).to.be.undefined;
			});
			
		});
		
		describe('#source', function () {
			
			it ('should be derrived out of the from property if not explicitly provided and ' +
				'relative to the binding\'s owner if it has one', function () {
				
				expect(oneWay._source).to.equal(source);
			});
			
			it ('should use the object passed in when explicitly set', function () {
				expect(ownerless._source).to.equal(source);
			});
			
		});
		
		describe('#target', function () {
			
			it ('should be derrived out of the to property if not explicitly provided and ' +
				'relative to the binding\'s owner if it has one', function () {
				
				// here we are showing that it doesn't actually store a reference to the target
				// in this way it relies on the underlying path-resolution but it is correctly
				// finding it relative to the source
				var path = oneWay.to.split('.').shift();
				
				// the source and target will be the same object actually
				expect(oneWay._source).to.equal(oneWay._target);
				expect(oneWay._source.get(path)).to.equal(target);
			});
			
			it ('should use the object passed in when explicitly set', function () {
				expect(ownerless._target).to.equal(target);
			});
			
		});
		
		describe('#from', function () {

			it ('should resolve global paths when it begins with ^', function () {
				expect(target.get('destProp')).to.equal('source');
			})
			
		});
		
		describe('#to', function () {
			
			it ('should resolve global paths when it begins with ^', function () {
				expect(globalTestComponent.get('destProp')).to.equal('source');
			})
			
		});
		
		describe('#transform', function () {
		
			it ('should not find a transform if there isn\'t one provided', function () {
				expect(oneWay.transform).to.be.null;
			});
			
			it ('should find a transform if it is a function', function () {
				expect(ownerless.transform).to.exist.and.to.be.a('function');
				expect(ownerless.getTransform()).to.exist.and.to.be.a('function');
			});
			
			it ('should find a transform if it is a string-global', function () {
				expect(noAuto.getTransform()).to.exist.and.to.be.a('function');
				expect(noAuto.getTransform()).to.equal(globalXform);
			});
			
			it ('should find a transform if it is a string-owner', function () {
				expect(twoWay.getTransform()).to.exist.and.to.be.a('function');
				expect(twoWay.getTransform()).to.equal(source.xform);
			});
			
			it ('should find a transform if it is a string-bindingTransformOwner', function () {
				var binding = source.$.child1.bindings[0];
				
				expect(binding.getTransform()).to.exist.and.to.be.a('function');
				expect(binding.getTransform()).to.equal(source.xform);
			});
			
			it ('should use a transform when it exists', function () {
				
				// it should have been 0 but the transform incremented it by 1
				expect(target.get('ownerless')).to.equal(1);
			});
			
			it ('should supply the correct direction to the transform', function () {
				noAuto.connect();
				noAuto.sync(true);
				
				// sanity check
				expect(source.get('noAuto')).to.equal(0);
				expect(target.get('noAuto')).to.equal(1);
				
				// check to see if it is working in the from direction
				source.set('noAuto', 1);
				expect(target.get('noAuto')).to.equal(2);
				
				// check to see if it is working in the other direction
				target.set('noAuto', 3);
				expect(source.get('noAuto')).to.equal(2);
			});
			
			it ('should stop propagation of the binding change when stop() is called', function () {
				// the transform was fitted with a special case to stop if the value is
				// set to 5
				source.set('noAuto', 5);
				// if it didn't stop then target's noAuto should be 6 otherwise 3 because that was
				// its last set value
				expect(target.get('noAuto')).to.equal(3);
			});
		});
	});
	
	describe('usage', function () {
		
		describe('constructor', function () {
			
			// it should be the default binding constructor kind unless overridden by an
			// application specific need
			it ('should be the enyo.defaultBindingKind static property default', function () {
				expect(enyo.defaultBindingKind).to.equal(Binding);
			});
			
		});
		
	});
	
});
