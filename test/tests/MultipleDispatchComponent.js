var
		kind = require('../../lib/kind'),
		utils = require('../../lib/utils');

var
		Component = require('../../lib/Component');
		MultipleDispatchComponent = require('../../lib/MultipleDispatchComponent');

describe('MultipleDispatch', function () {

	describe('usage', function () {

//	testDefaultDispatch: function () {
//		var s = this, c, mm, test = {};
//		test.Component = enyo.kind({
//			kind: "enyo.Component",
//			handlers: {
//				onTest1: "accept"
//			},
//			accept: function () {
//				s.finish();
//			}
//		});
//		test.DispatchComponent = enyo.kind({
//			kind: "enyo.MultipleDispatchComponent",
//			events: {
//				onTest1: ""
//			}
//		});
//		c = new test.Component();
//		mm = new test.DispatchComponent({owner: c});
//		if (!mm._dispatchDefaultPath) {
//			return this.finish("did not detect default dispatch path");
//		}
//		mm.doTest1();
//	},

		describe('Default dispatch', function () {

			before(function () {
			});

			after(function () {
			});

			it ('should have default dispatch path', function (done) {

				var c, mm, test = {};
				test.Component = kind({
					kind: Component,
					handlers: {
						onTest1: "accept"
					},
					accept: function () {
						done();
					}
				});
				test.DispatchComponent = kind({
					kind: MultipleDispatchComponent,
					events: {
						onTest1: ""
					}
				});
				c = new test.Component();
				mm = new test.DispatchComponent({owner: c});

				mm.doTest1();

				expect(mm._dispatchDefaultPath).to.exist;

			});

		});

//	testAddDispatchTarget: function () {
//		var mm, test = {};
//		test.DispatchComponent = enyo.kind({
//			kind: "enyo.MultipleDispatchComponent",
//			events: {
//				onTest1: ""
//			}
//		});
//		mm = new test.DispatchComponent();
//		if (!mm._dispatchTargets) {
//			return this.finish("dispatch targets not initialized properly");
//		}
//		if (mm._dispatchTargets.length !== 0) {
//			return this.finish("dispatch targets weren't zeroed out");
//		}
//		mm.addDispatchTarget(new enyo.Component());
//		if (mm._dispatchTargets.length !== 1) {
//			return this.finish("dispatch target not added properly");
//		}
//		this.finish();
//	},

			describe('Add dispatch target', function () {

				var mm, test = {};
				test.DispatchComponent = kind({
					kind: MultipleDispatchComponent,
					events: {
						onTest1: ""
					}
				});
				mm = new test.DispatchComponent();

				before(function () {
				});

				after(function () {
				});

				it ('should have _dispatchTargets', function () {

					expect(mm._dispatchTargets).to.exist;

				});

				it ('should have dispatch targets zeroed out', function () {

					expect(mm._dispatchTargets.length).to.equal(0);

				});

				it ('should add dispatch target properly', function () {

					mm.addDispatchTarget(new Component());
					expect(mm._dispatchTargets.length).to.equal(1);

				});

			});

//	testRemoveDispatchTarget: function () {
//		var mm, test = {}, c;
//		test.DispatchComponent = enyo.kind({
//			kind: "enyo.MultipleDispatchComponent",
//			events: {
//				onTest1: ""
//			}
//		});
//		mm = new test.DispatchComponent();
//		mm.addDispatchTarget((c = new enyo.Component()));
//		if (mm._dispatchTargets.length !== 1) {
//			return this.finish("dispatch target not added properly");
//		}
//		mm.removeDispatchTarget(c);
//		if (mm._dispatchTargets.length !== 0) {
//			return this.finish("dispatch target not removed properly");
//		}
//		this.finish();
//	},

		describe('Remove dispatch target', function () {

			var mm, test = {}, c;
			test.DispatchComponent = kind({
				kind: MultipleDispatchComponent,
				events: {
					onTest1: ""
				}
			});
			mm = new test.DispatchComponent();

			before(function () {
			});

			after(function () {
			});

			it ('should add dispatch target properly', function () {

				mm.addDispatchTarget((c = new Component()));
				expect(mm._dispatchTargets.length).to.equal(1);

			});

			it ('should remove dispatch target properly', function () {

				mm.removeDispatchTarget(c);
				expect(mm._dispatchTargets.length).to.equal(0);

			});

		});

//	testMultipleListenersWithoutOwner: function () {
//		var s = this, ex = 4, mm, test = {};
//		test.Component = enyo.kind({
//			kind: "enyo.Component",
//			handlers: {
//				onTest1: "accept"
//			},
//			accept: function () {
//				--ex;
//				if (ex === 0) {
//					s.finish();
//				}
//			}
//		});
//		test.DispatchComponent = enyo.kind({
//			kind: "enyo.MultipleDispatchComponent",
//			events: {
//				onTest1: ""
//			}
//		});
//		mm = new test.DispatchComponent();
//		for (var i=0; i<4; ++i) {
//			mm.addDispatchTarget(new test.Component());
//		}
//		mm.doTest1();
//	},

		describe('Multiple listeners without owner', function () {

			before(function () {
			});

			after(function () {
			});

			it ('should have multiple listeners', function (done) {

				var s = this, ex = 4, mm, test = {};
				test.Component = kind({
					kind: Component,
					handlers: {
						onTest1: "accept"
					},
					accept: function () {
						--ex;
						if (ex === 0) {
							done();
						}
					}
				});
				test.DispatchComponent = kind({
					kind: MultipleDispatchComponent,
					events: {
						onTest1: ""
					}
				});
				mm = new test.DispatchComponent();
				for (var i=0; i<4; ++i) {
					mm.addDispatchTarget(new test.Component());
				}
				mm.doTest1();

			});

		});

//	testMultipleListenersWithOwner: function () {
//		var s = this, c, ex = 5, mm, test = {};
//		test.Component = enyo.kind({
//			kind: "enyo.Component",
//			handlers: {
//				onTest1: "accept"
//			},
//			accept: function () {
//				--ex;
//				if (ex === 0) {
//					s.finish();
//				}
//			}
//		});
//		test.DispatchComponent = enyo.kind({
//			kind: "enyo.MultipleDispatchComponent",
//			events: {
//				onTest1: ""
//			}
//		});
//		c = new test.Component({name: "NotAutoCreated"});
//		mm = new test.DispatchComponent({owner: c});
//		for (var i=0; i<4; ++i) {
//			mm.addDispatchTarget(new test.Component());
//		}
//		mm.doTest1();
//	}

		describe('Multiple listeners without owner', function () {

			before(function () {
			});

			after(function () {
			});

			it ('should have multiple listeners', function (done) {

				var s = this, ex = 5, mm, test = {};
				test.Component = kind({
					kind: Component,
					handlers: {
						onTest1: "accept"
					},
					accept: function () {
						--ex;
						if (ex === 0) {
							done();
						}
					}
				});
				test.DispatchComponent = kind({
					kind: MultipleDispatchComponent,
					events: {
						onTest1: ""
					}
				});
				c = new test.Component({name: "NotAutoCreated"});
				mm = new test.DispatchComponent({owner: c});
				for (var i=0; i<4; ++i) {
					mm.addDispatchTarget(new test.Component());
				}
				mm.doTest1();

			});

		});

	});

});
