(function (enyo, scope) {

	enyo.kind({
		name: 'enyo.sample.NewDrawerSample',
		components: [
			{
				kind: 'enyo.NewDrawer', 
				components: [
					{
						name: 'r',
						kind: 'enyo.DataRepeater',
						components: [
							{
								bindings: [
									{from: 'model.label', to: 'content'}
								]
							}
						]
					}
				]
			},
			{content: 'foo'}
		],
		create: enyo.inherit(function (sup) {
			return function () {
				var n = 50,
					d = [];

				sup.apply(this, arguments);

				for (var i = 0; i < n; i++) {
					d.push({label: 'Item ' + (i + 1)});
				}

				this.$.r.collection = new enyo.Collection(d);
			};
		})
	});
})(enyo, this);