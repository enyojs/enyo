/**
	_enyo.Table_ implements an HTML &lt;table&gt; element filling it with data
	stored in _rows_.

	_rows_ is an array of objects where each object corresponds to one row. The
	simplest use is for each object to itself be an array. each item in the
	row array corresponds to a cell in the row. Alternatively, each row can
	be a hash. You must then set then set the ith item in _columns_ to be the
	key for the ith cell in the final table row. Finally, each row can be an
	arbitrary object. You then define the ith item in _columns to be a function
	that, given the row, returns the content of the ith cell.
*/
enyo.kind({
	name: "enyo.Table",
	tag: "table",
	create: function() {
		this.inherited(arguments);
		if (this.rowData.length && !this.rowCount) this.rowCount = this.rowData.length;
		this._rowData = [];
		this._headerData = null;
		this._footerData = null;
		this.genTable();
	},
	published: {
		//* The number of rows in this 
		//* _setTitles()_ is called because enyo cannot tell when an array
		//* has been mutated
		rowCount: undefined,
		//* Array of row data. Each item in the rows array
		//* corresponds to one row in the table. row data can be
		//* represented in any way you like. By default, enyo.Table can render
		//* an array of arrays. rowData is optional. You can write a _genRow_
		//* function that pulls its data from anywhere. If you do set _rowData_,
		//* rowCount will be set to _rowData.length_. If you do not want this
		//* behavior, set _rowData_ and _rowCount_ at the same time with _setRows_.
		//*  _rowDataChanged()_ is called every time 
		//* _setRowData()_ is called because enyo cannot tell when an array
		//* has been mutated
		rowData: [],
		//* array of titles. _titlesChanged()_ is called every time 
		//* _setTitles()_ is called because enyo cannot tell when an array
		//* has been mutated
		titles: [],
		//* whether to display table header row
		displayHeader: true
	},
	//* set row data and row count at the same time to avoid double table render
	setRows: function(inRowData, inRowCount) {
		this.rowData = enyo.clone(inRowData);
		this.rowDataChanged();
		this.setRowCount(inRowCount);
	},
	//* generate the header. Defaults to creating table headers from the data in _this.titles_
	//* if _displayHeader==true_ and _this.titles_ is not empty.
	genHeader: function() {
		if (!this.displayHeader || !this.titles.length) return null;
		var out = [];
		for (var i=0; i<this.titles.length; i++) {
			out.push({ tag: "th", content: this.titles[i], allowHtml: this.allowHtml });
		}
		return out;
	},
	//* generate data for the inRowCount row of the table. must return an array, each element corresponding
	//* to one cell. If the element is an object, it will be mixed into the kind definition, otherwise it 
	//* will be placed in cell contents. So the returned element 
	//* { class: "negative", content: "-350" } will create a td element with class _genative_ and content of
	//* _-350_; similarly { tag: "th" content: "total" } will create a header cell with the content _total_.
	//* Defalts to simply returning the unmodified array at _inRowCount_ of _this.rowData_.
	genRow: function(inRowCount) {
		return this.rowData[inRowCount] || [];
	},
	//* Generate a table footer. Defaults to null.
	genFooter: function() {
		return null;
	},
	//* get an array of the contents of every cell in the _inRowCount_ row
	getRow: function(inRowCount) {
		return enyo.map(this._rowData[inRowCount], function(cell) { return (cell instanceof Object) ? cell.content : cell; });
	},
	//* get an array of the contents of every cell in the inColCount column
	getCol: function(inColCount) {
		return enyo.map(this._rowData, function(row) { var cell = row[inColCount]; return (cell instanceof Object) ? cell.content : cell; });
	},
	//* get the content of the cell at inRowCount, inColCount
	getCell: function(inRowCount, inColCount) {
		if (inRowCount >= this._rowData.length) return undefined;
		var cell = this._rowData[inRowCount][inColCount];
		return (cell instanceof Object) ? cell.content : cell;
	},
	//* @protected
	// results from genRow are pushed here. useful for calculating column sums and such
	genTable: function() {
		var i,  row, key, content;
		this.destroyComponents();
		this._rowData = [];
		if (this.rowCount < 1) return;
		var that = this;
		// generate a row and each cell given row data.
		var genRow = function(row) {
			if (!row) return;
			var cell, td, tr = { tag: "tr", components: [] };
			for (var i=0; i< row.length; i++) {
				cell = row[i];
				td = { tag: "td", allowHtml: that.allowHtml };
				if (cell instanceof Object) {
					enyo.mixin(td, cell);
				} else {
					td.content = cell;
				}
				tr.components.push(td);
			}
			that.createComponent(tr);
			return row;
		};

		this._headerData = genRow(this.genHeader());
		for (i=0; i<this.rowCount; i++) {
			that._rowData.push(genRow(this.genRow(i)));
		}
		if (this.rowCount > 2) this._footerData = genRow(this.genFooter(this.rowCount-1));
		this.render();
	},
	setRowData: function(inRowData) {
		inRowData = enyo.clone(this.rowData);
		this.setPropertyValue("rowData", inRowData, "rowDataChanged");
		this.setRowCount(inRowData.length);
	},
	setRowCount: function (inRowCount) {
		this.setPropertyValue("rowCount", inRowCount, "rowCountChanged");
	},
	rowCountChanged: function() {
		this.genTable();
	},
	setTitles: function(inTitles) {
		inTitles = enyo.clone(inTitles);
		this.setPropertyValue("titles", inTitles, "titlesChanged");
		this.genTable();
	},
	displayHeaderChanged: function() {
		this.genTable();
	}
});
