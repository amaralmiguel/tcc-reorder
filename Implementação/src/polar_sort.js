function get_data() {
    var data = {
        pattern: document.getElementById('band_radio').checked ? 'band' : 'circumplex',
        b: document.getElementById('b').value,
        dimensions: document.getElementById('dimensions').value,
        noise_percent: document.getElementById('noise_percent').value
    };

    return polar_sort_builder(data);
}

function polar_sort_builder(data) {
    var pattern = data.pattern,
        b = parseFloat(data.b),
        dimensions = parseInt(data.dimensions),
        noise_percent = parseFloat(data.noise_percent);

    margin = { top: 30, right: 0, bottom: 0, left: 30 },
        width = 800 - margin.left - margin.right,
        height = 800 - margin.top - margin.bottom;

    d3.select("svg").remove();
    svg = d3.select("#matrix").append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    matrix = reorder.random_matrix(0, dimensions, dimensions),
        len = matrix.length;

    pattern == 'band' ? matrix = band(matrix, len, b) : matrix = circumplex(matrix, len);

    noise_percent > 0 ? matrix = salt_and_pepper_noise(noise_percent, matrix) : matrix;

    table({ matrix: matrix, method: 'polar-sort' });
}

function salt_and_pepper_noise(noise_percent, matrix) {
    for (i in matrix) {
        for (j in matrix[0]) {
            let noise_check = Math.floor(Math.random() * noise_percent) + 1;
            if (noise_check == noise_percent) {
                matrix[i][j] = Math.random();
            }
        }
    }
    return matrix;
}

function band(matrix, len, b) {
    for (i in matrix) {
        for (j in matrix) {
            var t = ((j / len) - (i / len)) / b;
            matrix[i][j] = (Math.pow(Math.E, -(Math.pow(t, 2))));
        }
    }
    return matrix;
}

function circumplex(matrix, len) {
    for (i in matrix) {
        for (j in matrix) {
            var t = Math.cos(Math.PI * ((j / len) - (i / len)));
            matrix[i][j] = (Math.pow(Math.E, -(Math.pow(t, 2))));
        }
    }
    return matrix;
}

function mds(distance_matrix, dimensions = 2) {

    /* square distances */
    let M = numeric.mul(-.5, numeric.pow(distance_matrix, 2));

    let rowMeans = [],
        colMeans = [];

    for (i in M) {
        rowMeans.push(reorder.mean(M[i]));
        colMeans.push(reorder.meantranspose(M, i))
    }

    totalMean = reorder.mean(rowMeans);

    for (i in M) {
        for (j in M[0]) {
            M[i][j] += totalMean - rowMeans[i] - colMeans[j];
        }
    }

    // take the SVD of the double centred matrix, and return the points from it
    let ret = numeric.svd(M),
        eigenValues = numeric.sqrt(ret.S);

    return ret.U.map(function (row) {
        return numeric.mul(row, eigenValues).splice(0, dimensions);
    });
};

function polar_sort() {
    let distance_matrix = reorder.dist()(matrix),
        cartesian_coordinates = mds(distance_matrix, 2),
        polar_coordinates = [],
        xB = reorder.mean(reorder.transpose(cartesian_coordinates)[0]),
        yB = reorder.mean(reorder.transpose(cartesian_coordinates)[1]);

    /* Convert from Cartesian Coordinates System to Polar Coordinates System */
    for (points of cartesian_coordinates) {
        var x = points[0],
            y = points[1],
            r = (Math.sqrt((Math.pow((x - xB), 2) + Math.pow((y - yB), 2))));
        // theta = Math.atan2(y, x);

        /* I Quadrant */
        var theta = Math.atan(y / x) * (180 / Math.PI);

        /* II Quadrant */
        if (Math.sign(x) == -1 && Math.sign(y) == 1) theta += 180;

        /* III Quadrant */
        if (Math.sign(x) == -1 && Math.sign(y) == -1) theta += 180;

        /* IV Quadrant */
        if (Math.sign(x) == 1 && Math.sign(y) == -1) theta += 360;

        polar_coordinates.push([r, theta]);
    }

    var rowPerm = reorder.sort_order(reorder.transpose(polar_coordinates)[1]),
        colPerm = reorder.permutation(matrix[0].length);

    polar_coordinates = reorder.permute(polar_coordinates, rowPerm);

    var max = 0,
        pair_distance = 0,
        head = 0;

    for (var i = 0; i < len - 1; ++i) {
        for (var j = i + 1; j < len; ++j, i++) {
            var theta1 = polar_coordinates[i][1],
                theta2 = polar_coordinates[j][1];

            pair_distance = theta2 - theta1;

            if (pair_distance > max) {
                max = pair_distance;
                head = j;
            } else break;
        }
    }

    var circularListPerm = [];

    for (index in matrix) {
        if (head > len - 1) head = 0;
        circularListPerm.push(head++);
    }

    rowPerm = reorder.permute(rowPerm, circularListPerm).reverse();
    /* Order the matrix by angular coordinates */
    table.order(rowPerm, colPerm);
}

function shuffle() {
    var rowPerm = reorder.randomPermutation(matrix.length),
        colPerm = reorder.randomPermutation(matrix[0].length);

    table.order(rowPerm, colPerm);
}

function original() {
    table.order(reorder.permutation(matrix.length),
        reorder.permutation(matrix[0].length));
}