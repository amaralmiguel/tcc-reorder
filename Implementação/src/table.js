function table(data) {
	var matrix = data.matrix,
		row_labels = data.row_labels,
		col_labels = data.col_labels,
		row_perm = data.row_permutation,
		col_perm = data.col_permutation,
		row_inv, col_inv,
		n = matrix.length,
		m = matrix[0].length,
		i,
		isBinary = data.isBinary;

	if (!row_labels) {
		row_labels = Array(n);
		for (i = 0; i < n; i++)
			row_labels[i] = i + 1;
	}

	if (!col_labels) {
		col_labels = Array(m);
		for (i = 0; i < m; i++)
			col_labels[i] = i + 1;
	}

	if (!row_perm)
		row_perm = reorder.permutation(n);
	row_inv = reorder.inverse_permutation(row_perm);

	if (!col_perm)
		col_perm = reorder.permutation(m);
	col_inv = reorder.inverse_permutation(col_perm);


	var max_value = d3.max(matrix.map(function (row) { return d3.max(row); })),
		min_value = d3.min(matrix.map(function (row) { return d3.min(row); }));

	if (isBinary) {
		var colors = d3.scale.linear()
			.range(['#00F', '#F00'])
			.domain([min_value, max_value]);
	} else {
		var colors = d3.scale.linear()
			.range(['#00F', '#FFF', '#F00'])
			.domain([min_value, ((min_value + max_value) / 2), max_value]);
	}

	var gridSize = Math.min(width / matrix.length, height / matrix[0].length),
		h = gridSize,
		th = h * n,
		w = gridSize,
		tw = w * m;

	var x = function (i) { return w * col_inv[i]; },
		y = function (i) { return h * row_inv[i]; };

	var row = svg
		.selectAll(".row")
		.data(matrix, function (d, i) { return 'row' + i; })
		.enter().append("g")
		.attr("id", function (d, i) { return "row" + i; })
		.attr("class", "row")
		.attr("transform", function (d, i) {
			return "translate(0," + y(i) + ")";
		});

	var cell = row.selectAll(".cell")
		.data(function (d) { return d; })
		.enter().append("rect")
		.attr("class", "cell")
		.attr("x", function (d, i) { return x(i); })
		.attr("width", w)
		.attr("height", h)
		.style("fill", function (d) { return colors(d) });

	row.append("line")
		.attr("x2", tw);

	row.append("text")
		.attr("x", -6)
		.attr("y", h / 2)
		.attr("dy", ".32em")
		.attr("text-anchor", "end")
		.text(function (d, i) { return row_labels[i]; });

	var col = svg.selectAll(".col")
		.data(matrix[0])
		.enter()
		.append("g")
		.attr("id", function (d, i) { return "col" + i; })
		.attr("class", "col")
		.attr("transform", function (d, i) { return "translate(" + x(i) + ")rotate(-90)"; });

	col.append("line")
		.attr("x1", -th);

	col.append("text")
		.attr("x", 6)
		.attr("y", w / 2)
		.attr("dy", ".32em")
		.attr("text-anchor", "start")
		.style('letter-spacing', '2px')
		.text(function (d, i) { return col_labels[i]; });

	svg.append("rect")
		.attr("width", tw)
		.attr("height", th)
		.style("fill", "none")
		.style("stroke", "black");

	function order(rows, cols) {
		row_perm = rows;
		row_inv = reorder.inverse_permutation(row_perm);
		col_perm = cols;
		col_inv = reorder.inverse_permutation(col_perm);

		var t = svg.transition().duration(1000);

		t.selectAll(".row")
			.attr("transform", function (d, i) {
				return "translate(0," + y(i) + ")";
			})
			.selectAll(".cell")
			.attr("x", function (d, i) { return x(i); });

		t.selectAll(".col")
			.attr("transform", function (d, i) {
				return "translate(" + x(i) + ")rotate(-90)";
			});
	}

	table.order = order;
	table.matrix = matrix;

	for (cell of document.getElementsByTagName('rect')) {
		cell.style.stroke = cell.style.fill
	}
}

