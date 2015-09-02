var
	kind = require('enyo/kind');

var
	AccessibilitySupport = require('enyo/AccessibilitySupport')
	Control = require('enyo/Control');

describe('AccessibilitySupport', function () {

	describe('usage', function () {

		describe('#updateAccessibilityAttributes', function () {

			var TestControl, testControl, content, label, hint;

			before(function () {
				content = 'content';
				label = 'label';
				hint = 'hint';

				TestControl = kind({
					kind: Control,
					mixins: [AccessibilitySupport]
				});

				testControl = new TestControl();
			});

			after(function () {
				testControl.destroy();
				TestControl = null;
			});

			it ('should equal null with only content', function () {

				testControl.set('content', content);
				testControl.set('accessibilityLabel', '');
				testControl.set('accessibilityHint', '');

				expect(testControl.getAttribute('aria-label')).to.equal(null);
			});

			it ('should equal accessibilityLabel without content', function () {

				testControl.set('content', '');
				testControl.set('accessibilityLabel', label);
				testControl.set('accessibilityHint', '');

				expect(testControl.getAttribute('aria-label')).to.equal(label);
			});

			it ('should equal accessibilityLabel with content', function () {

				testControl.set('content', content);
				testControl.set('accessibilityLabel', label);
				testControl.set('accessibilityHint', '');

				expect(testControl.getAttribute('aria-label')).to.equal(label);
			});

			it ('should equal accessibilityHint', function () {

				testControl.set('content', '');
				testControl.set('accessibilityLabel', '');
				testControl.set('accessibilityHint', hint);

				expect(testControl.getAttribute('aria-label')).to.equal(hint);
			});

			it ('should equal content + accessibilityHint', function () {

				testControl.set('content', content);
				testControl.set('accessibilityLabel', '');
				testControl.set('accessibilityHint', hint);

				expect(testControl.getAttribute('aria-label')).to.equal(content + ' ' + hint);
			});

			it ('should equal accessibilityLabel + accessibilityHint without content', function () {

				testControl.set('content', '');
				testControl.set('accessibilityLabel', label);
				testControl.set('accessibilityHint', hint);

				expect(testControl.getAttribute('aria-label')).to.equal(label + ' ' + hint);
			});

			it ('should equal accessibilityLabel + accessibilityHint with content', function () {

				testControl.set('content', content);
				testControl.set('accessibilityLabel', label);
				testControl.set('accessibilityHint', hint);

				expect(testControl.getAttribute('aria-label')).to.equal(label + ' ' + hint);
			});
		});

		describe('#accessibilityDisabled', function () {

			var TestControl, testControl, label;

			before(function () {
				label = 'label';

				TestControl = kind({
					kind: Control,
					mixins: [AccessibilitySupport]
				});

				testControl = new TestControl();
			});

			after(function () {
				testControl.destroy();
				TestControl = null;
			});

			it ('should equal accessibilityLabel', function () {

				testControl.set('accessibilityLabel', label);
				testControl.set('accessibilityDisabled', false);

				expect(testControl.getAttribute('aria-label')).to.equal(label);
			});

			it ('should equal null', function () {

				testControl.set('accessibilityLabel', label);
				testControl.set('accessibilityDisabled', true);

				expect(testControl.getAttribute('aria-label')).to.equal(null);
				expect(testControl.getAttribute('tabindex')).to.equal(null);
			});
		});

	});

});