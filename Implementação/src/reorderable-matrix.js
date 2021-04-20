class ReorderableMatrix {
    constructor(numberOfRows, numberOfCols, density, paramB, isBinary) {
        this.matrix = reorder.random_matrix(0, numberOfRows, numberOfCols);
        this.numberOfRows = numberOfRows;
        this.numberOfCols = numberOfCols;
        this.density = density;
        this.paramB = paramB;
        this.isBinary = isBinary;
    }

    shuffleMatrix() {
        let rowPerm = reorder.randomPermutation(this.numberOfRows),
            colPerm = reorder.randomPermutation(this.numberOfCols);

        table.order(rowPerm, colPerm);
    }

    originalMatrixOrder() {
        table.order(reorder.permutation(this.numberOfRows), reorder.permutation(this.numberOfCols));
    }

    addNoiseToMatrix() {
        let k = 0,
            numberOfEntries = this.numberOfRows * this.numberOfCols,
            valuesAboveLimit = parseInt(this.density * numberOfEntries),
            deposit = new Array(numberOfEntries),
            maxValue = d3.max(this.matrix.map(function (row) { return d3.max(row); })),
            minValue = d3.min(this.matrix.map(function (row) { return d3.min(row); }));

        if (this.isBinary) {
            // Filling the deposit with values above the limit:
            for (let i = 0; i < valuesAboveLimit; i++) deposit[i] = 1;

            // Filling the deposit with values under the limit:
            for (let i = valuesAboveLimit; i < numberOfEntries; i++) deposit[i] = 0;

            // Shuffling the deposit array:
            deposit = reorder.permute(deposit, reorder.randomPermutation(deposit.length));

            // Tranfering the entries to the matrix:
            for (let i = 0; i < this.numberOfRows; i++) {
                for (let j = 0; j < this.numberOfCols; j++, k++) {
                    if (deposit[k] == 1) {
                        this.matrix[i][j] = 1 - this.matrix[i][j];
                    }
                }
            }
        } else {
            if (valuesAboveLimit > 0) {
                let depositList = [];

                //Creating list of boolean values:
                for (let i = 0; i < valuesAboveLimit; i++) depositList.push(true);

                for (let i = valuesAboveLimit; i < numberOfEntries; i++) depositList.push(false);

                //Shuffle position of depositList
                depositList = reorder.permute(depositList, reorder.randomPermutation(depositList.length));

                //Calculating deference between maxValue and minValue of the matrix:
                let dif = maxValue - minValue;

                //Inluding noise in the matrix:
                k = 0;
                for (let i = 0; i < this.numberOfRows; i++) {
                    for (let j = 0; j < this.numberOfCols; j++, k++) {
                        if (depositList[k]) {
                            this.matrix[i][j] = Math.random() * dif + minValue;
                        }
                    }
                }
            }
        }
        return this.matrix;
    }

    simplexMatrix() {
        for (let i = 1; i <= this.numberOfRows; i++) {
            for (let j = 1; j <= this.numberOfCols; j++) {
                let t = ((j / this.numberOfCols) - (i / this.numberOfRows)) / this.paramB;
                this.matrix[i - 1][j - 1] = (Math.pow(Math.E, t)) / (1 + Math.pow(Math.E, t));
            }
        }
        return this.addNoiseToMatrix();
    }

    equiMatrix() {
        for (let i = 1; i <= this.numberOfRows; i++) {
            for (let j = 1; j <= this.numberOfCols; j++) {
                this.matrix[i - 1][j - 1] = (this.paramB * i) / this.numberOfRows;
            }
        }
        return this.addNoiseToMatrix();
    }

    bandMatrix() {
        for (let i = 0; i < this.numberOfRows; i++) {
            for (let j = 0; j < this.numberOfCols; j++) {
                let t = ((j / this.numberOfCols) - (i / this.numberOfRows)) / this.paramB;
                this.matrix[i][j] = (Math.pow(Math.E, -(Math.pow(t, 2))));
            }
        }
        return this.addNoiseToMatrix();
    }

    circumplexMatrix() {
        for (let i = 0; i < this.numberOfRows; i++) {
            for (let j = 0; j < this.numberOfCols; j++) {
                let t = Math.cos(Math.PI * ((j / this.numberOfCols) - (i / this.numberOfRows)));
                this.matrix[i][j] = (Math.pow(Math.E, -(Math.pow(t, 2))));
            }
        }
        return this.addNoiseToMatrix();
    }

    blockMatrix() {
        let blockHeight = this.numberOfRows / Math.pow(2, this.paramB),
            blockWidth = this.numberOfCols / this.paramB;

        for (let i = 0; i < this.numberOfRows; i++) {
            let bitPattern = parseInt((i / blockHeight));
            for (let j = 0; j < this.numberOfCols; j++) {
                let patternColumn = parseInt((j / blockWidth));
                let value = (bitPattern & parseInt(Math.pow(2, patternColumn))) > 0 ? 1 : 0;
                this.matrix[i][j] = value;
            }
        }
        return this.addNoiseToMatrix();
    }

    // Sort Methods: 
    fvsSort() {
        let rowPerm = new Array(this.numberOfRows),
            colPerm = new Array(this.numberOfCols);

        // Resultado das médias aritméticas das linhas:
        for (let i = 0; i < this.numberOfRows; i++) rowPerm[i] = reorder.mean(this.matrix[i]);

        // Resultado das médias aritméticas das colunas:
        for (let i = 0; i < this.numberOfCols; i++) colPerm[i] = reorder.meantranspose(this.matrix, i);

        table.order(reorder.sort_order(rowPerm), reorder.sort_order(colPerm));
    }

    polarSort() {
        function mds(distanceMatrix, dimensions = 2) {
            /* square distances */
            let M = numeric.mul(-.5, numeric.pow(distanceMatrix, 2));

            let rowMeans = [],
                colMeans = [];

            for (let i in M) {
                rowMeans.push(reorder.mean(M[i]));
                colMeans.push(reorder.meantranspose(M, i))
            }

            let totalMean = reorder.mean(rowMeans);

            for (let i in M) {
                for (let j in M[0]) {
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


        let distanceMatrix = reorder.dist()(this.matrix),
            cartesianCoords = mds(distanceMatrix, 2),
            polarCoords = [],
            xB = reorder.mean(reorder.transpose(cartesianCoords)[0]),
            yB = reorder.mean(reorder.transpose(cartesianCoords)[1]);

        /* Convert from Cartesian Coordinates System to Polar Coordinates System */
        for (let points of cartesianCoords) {
            var x = points[0],
                y = points[1],
                r = (Math.sqrt((Math.pow((x - xB), 2) + Math.pow((y - yB), 2))));

            /* I Quadrant */
            var theta = Math.atan(y / x) * (180 / Math.PI);

            /* II Quadrant */
            if (Math.sign(x) == -1 && Math.sign(y) == 1) theta += 180;

            /* III Quadrant */
            if (Math.sign(x) == -1 && Math.sign(y) == -1) theta += 180;

            /* IV Quadrant */
            if (Math.sign(x) == 1 && Math.sign(y) == -1) theta += 360;

            polarCoords.push([r, theta]);
        }

        let rowPerm = reorder.sort_order(reorder.transpose(polarCoords)[1]),
            colPerm = reorder.permutation(this.numberOfCols);

        polarCoords = reorder.permute(polarCoords, rowPerm);

        let max = 0,
            pair_distance = 0,
            head = 0;

        for (let i = 0; i < this.numberOfRows - 1; ++i) {
            for (let j = i + 1; j < this.numberOfCols; ++j, i++) {
                let theta1 = polarCoords[i][1],
                    theta2 = polarCoords[j][1];

                pair_distance = theta2 - theta1;

                if (pair_distance > max) {
                    max = pair_distance;
                    head = j;
                } else break;
            }
        }

        var circularListPerm = [];

        for (let index in this.matrix) {
            if (head > this.numberOfRows - 1) head = 0;
            circularListPerm.push(head++);
        }

        rowPerm = reorder.permute(rowPerm, circularListPerm).reverse();

        table.order(rowPerm, colPerm);
    }

    blockSort() {
        let orderOfColumns = [],
            optimals = [],
            columns = [];

        const SISTERHOOD_BOUNDARY = 0.6;

        // Get properties of columns:
        for (let i = 0; i < this.numberOfCols; ++i) {
            let col = { 'list': [], 'noise': null, 'similarity': null, 'index': i },
                numberZeros = 0;

            for (let j = 0; j < this.numberOfRows; ++j) {
                let cellVal = this.matrix[j][i],
                    boolVal = (cellVal >= 0.5);
                col.list.push(boolVal);

                if (!boolVal) {
                    numberZeros++;
                }
            }
            col.noise = Math.abs((parseFloat(numberZeros - (col.list.length / 2)))) / col.list.length;
            columns.push(col);
        }

        function NOISE_RANK(columns) {
            let NOISE_LIST = [];
            for (let col of columns) {
                NOISE_LIST.push(col.noise);
            }
            return reorder.sort_order(NOISE_LIST);
        }

        function SIMILARITY_RANK(columns) {
            let SIMILARITY_LIST = [];
            for (let col of columns) {
                SIMILARITY_LIST.push(col.similarity);
            }
            return reorder.sort_order_descending(SIMILARITY_LIST);
        }

        while (columns.length != 0) {
            // Current pivot of columns:
            columns = reorder.permute(columns, NOISE_RANK(columns));
            var pivot = columns[0];

            // Calc similarity:
            for (let col of columns) {
                if (JSON.stringify(col) == JSON.stringify(pivot)) {
                    col.similarity = 1.0;
                } else {
                    col.similarity = 0.0;
                    for (let j = 0; j < col.list.length; ++j) {
                        if (pivot.list[j] == col.list[j]) {
                            col.similarity += 1;
                        }
                    }
                    col.similarity /= col.list.length;
                }
            }

            // Sort by similarity:
            columns = reorder.permute(columns, SIMILARITY_RANK(columns));

            // Identify sisters:
            let numberOfSisters = columns.filter((col) => (col.similarity >= SISTERHOOD_BOUNDARY)).length;

            // Populate col perm:
            for (let col of columns.slice(0, numberOfSisters)) {
                orderOfColumns.push(col.index);
            }

            // Make optimal column:
            let optimal = [];
            for (let i = 0; i < this.numberOfRows; ++i) {
                let numberOfZeros = 0;
                for (let col of columns.slice(0, numberOfSisters)) {
                    if (!col.list[i]) {
                        numberOfZeros++;
                    }
                }
                optimal.push(numberOfZeros < numberOfSisters / 2 ? false : true);
            }

            optimals.push(optimal);

            // Remove sisters:
            columns.splice(0, numberOfSisters);
        }

        // Populate row perm:
        let orderOfRows = reorder.permutation(this.numberOfRows);

        for (let optimal of optimals.reverse()) {
            for (let i = 1; i < this.numberOfRows; ++i) {
                for (let j = i; j > 0; --j) {
                    if (optimal[j] && !optimal[j - 1]) {
                        for (let auxOptimal of optimals) {
                            let temp = auxOptimal[j];
                            auxOptimal[j] = auxOptimal[j - 1];
                            auxOptimal[j - 1] = temp;
                        }

                        // Sorts row perm:
                        let temp = orderOfRows[j];
                        orderOfRows[j] = orderOfRows[j - 1];
                        orderOfRows[j - 1] = temp;

                    } else {
                        break;
                    }
                }
            }
        }
        table.order(orderOfRows, orderOfColumns.reverse());
    }
}

var margin = { top: 30, right: 0, bottom: 0, left: 30 },
    width = 800 - margin.left - margin.right,
    height = 800 - margin.top - margin.bottom;

function reorderableMatrixParams(isBinary) {
    let params = document.getElementById("params").elements;

    let pattern = params[0].value,
        paramB = parseFloat(params[1].value),
        numberOfRows = parseInt(params[2].value),
        numberOfCols = parseInt(params[3].value),
        density = parseFloat(params[4].value);

    instance = new ReorderableMatrix(numberOfRows, numberOfCols, density, paramB, isBinary);

    let matrix;

    switch (pattern) {
        case 'equi':
            matrix = instance.equiMatrix();
            break;

        case 'simplex':
            matrix = instance.simplexMatrix();
            break;

        case 'band':
            matrix = instance.bandMatrix();
            break;

        case 'circumplex':
            matrix = instance.circumplexMatrix();
            break;

        case 'block':
            matrix = instance.blockMatrix();
            break;

        default:
            break;
    }

    // Display selected matrix on screen:
    d3.select("svg").remove();
    svg = d3.select("#matrix").append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    table({ matrix: matrix, isBinary: isBinary });
}