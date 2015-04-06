describe('enyo.PriorityQueue', function () {

	var PriorityQueue = enyo.PriorityQueue;

	describe('methods', function () {

		describe('#add', function () {

			var queue;

			before(function () {
				queue = new PriorityQueue();
			});

			after(function () {
				queue.destroy({destroy: true});
			});

			beforeEach(function () {
				queue.clear();
			});

			it ('should update its length after adding an item', function () {

				// add with default priority
				queue.add({name: 'item1'});
				expect(queue.length).to.equal(1);

				// add a few more items
				queue.add({name: 'item2'}, 1);
				queue.add({name: 'item3'}, 3);
				queue.add({name: 'item4'}, 7);
				expect(queue.length).to.equal(4);

			});

			it ('should update priorities after adding an item', function () {

				queue.add({name: 'item1'}, 5);
				expect(queue.peek().name).to.equal('item1');

				// add a few more items
				queue.add({name: 'item2'}, 1);
				queue.add({name: 'item3'}, 3);
				queue.add({name: 'item4'}, 7);
				expect(queue.peek().name).to.equal('item2');

			});

		});

		describe('#remove', function () {

			var queue,
				item1 = {name: 'item1'},
				item2 = {name: 'item2'},
				item3 = {name: 'item3'},
				item4 = {name: 'item4'},
				item5 = {name: 'item5'};

			before(function () {
				queue = new PriorityQueue();
				queue.add(item1, 7);
				queue.add(item2, 5);
				queue.add(item3, 3);
				queue.add(item4, 1);
				queue.add(item5, 7);
			});

			after(function () {
				queue.destroy({destroy: true});
			});

			it ('should update its length after removing an item', function () {

				// remove a single item
				queue.remove(item1);
				expect(queue.length).to.equal(4);

				// try removing the same item again
				queue.remove(item1);
				expect(queue.length).to.equal(4);

			});

			it ('should update priorities after removing an item', function () {

				// remove highest priority item
				queue.remove(item4);
				expect(queue.peek().name).to.equal('item3');

				// remove next-highest priority item
				queue.remove(item3);
				expect(queue.peek().name).to.equal('item2');

			});

		});

		describe('#peek', function () {

			var queue;

			before(function () {
				queue = new PriorityQueue();
			});

			after(function () {
				queue.destroy({destroy: true});
			});

			it ('should retrieve the highest priority item', function () {

				// add a single item
				queue.add({name: 'item1'}, 3);
				expect(queue.peek().name).to.equal('item1');

				// add a higher-priority item
				queue.add({name: 'item2'}, 1);
				expect(queue.peek().name).to.equal('item2');

				// add a lower-priority item
				queue.add({name: 'item3'}, 2);
				expect(queue.peek().name).to.equal('item2');

			});

		});

		describe('#poll', function () {

			var queue;

			before(function () {
				queue = new PriorityQueue();
			});

			after(function () {
				queue.destroy({destroy: true});
			});

			it ('should retrieve the highest priority item and pop it off the queue', function () {

				// add a few items
				queue.add({name: 'item1'}, 3);
				queue.add({name: 'item2'}, 1);
				queue.add({name: 'item3'}, 2);
				queue.add({name: 'item4'}, 5);
				queue.add({name: 'item5'}, 4);

				expect(queue.poll().name).to.equal('item2');
				expect(queue.poll().name).to.equal('item3');
				expect(queue.poll().name).to.equal('item1');
				expect(queue.poll().name).to.equal('item5');
				expect(queue.poll().name).to.equal('item4');

			});

		});

		describe('#clear', function () {

			var queue;

			before(function () {
				queue = new PriorityQueue();
				queue.add({name: 'item1'}, 5);
				queue.add({name: 'item2'}, 7);
				queue.add({name: 'item3'}, 3);
				queue.add({name: 'item4'}, 1);
				queue.add({name: 'item5'}, 7);
			});

			after(function () {
				queue.destroy({destroy: true});
			});

			it ('should update length and gracefully handle requests when emptied', function () {

				queue.clear();
				expect(queue.length).to.equal(0);
				expect(queue.peek()).to.be.an('undefined');
				expect(queue.poll()).to.be.an('undefined');

			});

		});

	});

	describe('statics', function () {

		describe('~constructor', function () {

		});

	});

	describe('usage', function () {

		describe('events', function () {



		});


	});

});