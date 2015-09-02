var
	kind = require('enyo/kind');

var
	Control = require('enyo/Control'),
	UiComponent = require('enyo/UiComponent');

describe('Control', function () {

	describe('usage', function () {

		describe('renderOnShow', function () {

			var TestControl, testControl;

			before(function () {
				TestControl = kind({
					name: 'TestControl',
					kind: Control,
					id: 'TESTCONTROL1',
					components: [
						{name: 'child', id: 'TESTCONTROL2', renderOnShow: true}
					]
				});

				testControl = new TestControl({parentNode: document.body});
			});

			after(function () {
				testControl.destroy();
				TestControl = null;
			});

			it ('should not render a control with renderOnShow true until it has its showing ' +
				'value set to true', function () {

				var pn, node;

				testControl.render();
				pn = document.querySelector('#TESTCONTROL1');

				expect(pn).to.exist;

				node = pn.querySelector('#TESTCONTROL2');

				expect(node).to.not.exist;

				testControl.$.child.set('showing', true);

				node = pn.querySelector('#TESTCONTROL2');

				expect(node).to.exist;
			});

		});

	});

	describe('statics', function () {

		describe('concat', function () {

			// we will share a single instance of the subclassed control for inspection
			var control;

			var TestControl1, TestControl2;

			before(function () {

				// we want to create two classes, one that the second can base off of, so as to
				// test what happens to the concatenated properties when being subclassed
				TestControl1 = kind({
					name: 'TestControl1',
					kind: Control,
					attributes: {
						attr1: 'attr1',
						attr2: 'attr2'
					},
					classes: 'class1 class2',
					style: 'height: 50px; width: 50px;'
				});

				TestControl2 = kind({
					name: 'TestControl2',
					kind: TestControl1,
					attributes: {
						attr1: 'attr1*',
						attr3: 'attr3'
					},
					classes: 'class3 class4',
					style: 'color: #000;'
				});

				control = new TestControl2();
			});

			after(function () {

				// dereference our globals
				TestControl1 = null;
				TestControl2 = null;
			});

			it ('should merge attributes', function () {
				// by the time it is instanced the attributes hash may have additional properties
				// we don't wish to test
				expect(control.attributes).to.have.property('attr1', 'attr1*');
				expect(control.attributes).to.have.property('attr2', 'attr2');
				expect(control.attributes).to.have.property('attr3', 'attr3');
			});

			it ('should merge the style property as kindStyle (internal) and style', function () {
				expect(control.kindStyle).to.equal('height: 50px; width: 50px; color: #000;');
				expect(control.style).to.equal(control.kindStyle);
			});

			it ('should merge classes as kindClasses (internal) and classes', function () {

				// it should be noted the difference between classes and style (not sure why
				// the difference) but classes, when merged, do not add incoming classes to
				// the kindClasses property and instead replace the classes property merging
				// its previous value down into the kindClasses string
				expect(control.kindClasses.trim()).to.equal('class1 class2');
				expect(control.classes.trim()).to.equal('class1 class2 class3 class4');
			});

		});

	});

	describe('stateful keys', function () {
		var TestControl, testControl, defaultData = [
				{
					kind: Control,
					nonstateful: 'foo',
					active: true
				},
				{
					kind: Control,
					nonstateful: 'bar',
					active: false
				}
			];

		TestControl = kind({
			name: 'TestControl',
			kind: Control
		});

		describe('simple', function () {

			beforeEach(function () {
				testControl = new TestControl({parentNode: document.body});

				testControl.updateComponents(defaultData);
			});

			afterEach(function () {
				testControl.destroy();
			});

			it('should detect that a re-render is needed when non-state is changed', function () {
				var result = testControl.updateComponents([
					{
						kind: Control,
						nonstateful: 'foo',
						active: true
					},
					{
						kind: Control,
						nonstateful: 'baz',
						active: false
					}
				]);
				expect(result).to.equal(true);
			});

			it('should detect that a re-render is not needed when state is the same', function () {
				var result = testControl.updateComponents(defaultData);
				expect(result).to.equal(false);
			});

			it('should detect that a re-render is not needed when stateful key changes', function () {
				var result = testControl.updateComponents([
					{
						kind: Control,
						nonstateful: 'foo',
						active: false
					},
					{
						kind: Control,
						nonstateful: 'bar',
						active: true
					}]);
				expect(result).to.equal(false);
			});

			it('should detect different number of controls', function () {
				var result = testControl.updateComponents(defaultData.concat({active: true}));
				expect(result).to.equal(true);
			});

			it('should detect empty array', function () {
				var result = testControl.updateComponents([]);
				expect(result).to.equal(true);
			});

			it('should detect fewer keys', function () {
				var result = testControl.updateComponents([
					{
						kind: Control,
						nonstateful: 'foo',
						active: false
					},
					{
						kind: Control,
						active: true
					}]);
				expect(result).to.equal(true);
			});

		});

		describe('advanced', function () {
			var SubControl = kind({
					kind: Control,
					name: 'SubControl',
					statics: {
						statefulKeys: UiComponent.findStatic(Control, 'statefulKeys').concat('stateful', 'statefulFn')
					}
				}),
			subDefinition = [
					{
						kind: Control,
						nonstateful: 'foo',
						nonstatefulFn: function () { console.log('foo'); },
						active: true
					},
					{
						kind: SubControl,
						stateful: 'bar',
						statefulFn: function () { console.log('bar'); },
						active: false
					}
				];

			it('should detect control type changes', function () {
				testControl = new TestControl({parentNode: document.body});
				testControl.updateComponents(defaultData);

				var result = testControl.updateComponents([
					{
						kind: Control,
						nonstateful: 'foo',
						nonstatefulFn: function () { console.log('foo'); },
						active: true
					},
					{
						kind: SubControl,
						nonstateful: 'bar',
						statefulFn: function () { console.log('bar'); },
						active: false
					}
				]);
				expect(result).to.equal(true);
			});

			it('should detect function changes', function () {
				testControl = new TestControl({parentNode: document.body});
				testControl.updateComponents(subDefinition);

				var result = testControl.updateComponents([
					{
						kind: Control,
						nonstateful: 'foo',
						nonstatefulFn: function () { console.log('fooz'); },
						active: true
					},
					{
						kind: SubControl,
						stateful: 'bar',
						statefulFn: function () { console.log('bar'); },
						active: false
					}
				]);
				expect(result).to.equal(true);
			});

			it('should use subkind stateful keys', function () {
				testControl = new TestControl({parentNode: document.body});
				testControl.updateComponents(subDefinition);

				var result = testControl.updateComponents([
					{
						kind: Control,
						nonstateful: 'foo',
						nonstatefulFn: function () { console.log('foo'); },
						active: true
					},
					{
						kind: SubControl,
						stateful: 'baz',
						statefulFn: function () { console.log('baz'); },
						active: false
					}
				]);
				expect(result).to.equal(false);
			});
		});
	});

});
