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
		this.genTable();
	},
	published: {
		//* Array of row data. Each item in the rows array
		//* corresponds to one row in the table. row data can be
		//* represented in any way you like. Use `columns` array
		//* to tell table how to parse data in each row. if each row
		//* is an array, then `columns` is not required.
		rows: [],
		//* array of titles.
		titles: [],
		//* instructions for how to render each column in a row. It can be one of three things: (1)
		//* undefined (pull directly from row array). (2) function(row, rows, rowIndex, colIndex)
		//* (3) key to get value from row hash.
		//* To get the contents for
		//* the cell at row i, column j, the genTable first looks at this.columns:
		//*  * if this.columns[j] is undefined, this.rows[i] must be an array and contents will
		//*  * be pulled from this.rows[i][j]
		//*  * if this.columns[j] is a function, then the function's return value will be the
		//*    cell contents. function is called this.columns[j](this.rows[i], this.rows, i, j)
		//*  * otherwise, this.columns[j] is assumed to be a key for a hash at rows[i],
		//*    so the cell value will be this.rows[i][this.columns[j]]. if the value is a function
		//*    it will be called with (this.rows, i, j).
		//* columns must be empty or the exact length of each row. If you want most cells
		//* to default to the row index, but want to modify some, instantiate an empty array
		//* of the proper length: `this.columns=Array(len)` then insert your modification
		//* functions as needed.
		columns: [],
		//* whether to display table header row
		displayHeader: true
	},
	rowsChanged: function() {
		this.rows = enyo.clone(this.rows);
		this.genTable();
	},
	titlesChanged: function() {
		this.titles = enyo.clone(this.titles);
		this.genTable();
	},
	columnsChanged: function() {
		this.genTable();
	},
	displayHeaderChanged: function() {
		this.genTable();
	},
	genTable: function() {
		var i, tr, th, td, row, key, content;
		this.destroyComponents();
		var numCols = this.titles.length;
		if (numCols && this.displayHeader) {
			tr = { tag: "tr", components: [] };
			for (i=0; i<numCols; i++) {
				th = { tag: "th", content: this.titles[i], allowHtml: this.allowHtml };
				tr.components.push(th);
			}
			this.createComponent(tr);
		}
		
		numCols = this.columns.length || this.rows[0].length || 0;
		for (i=0; i<numCols; i++) {
			row = this.rows[i];
			tr = { tag: "tr", components: [] };
			for (var j=0; j<numCols; j++) {
				var col = this.columns[j];
				content =   (col instanceof Function) ? col.call(this, row, this.rows, i, j) :
							(col !== undefined) ? row[col] : row[j];
				if (content instanceof Function) content = content.call(row, this.rows, i, j);
				td = { tag: "td", content: content, allowHtml: this.allowHtml };
				tr.components.push(td);
			}
			this.createComponent(tr);
		}
		this.render();
	}
});
