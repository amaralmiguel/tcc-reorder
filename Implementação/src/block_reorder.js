function get_data() {
    var data = {
        k: document.getElementById('k').value,
        dimensions: document.getElementById('dimensions').value,
        noise_percent: document.getElementById('noise_percent').value
    };

    return block_builder(data);
}

function block_builder(data) {
    var k = parseInt(data.k),
        dimensions = parseInt(data.dimensions),
        noise_percent = parseFloat(data.noise_percent),
        value,
        bitPattern,
        patternColumn,
        numberOfRows = dimensions,
        numberOfColumns = dimensions,
        blockHeight = numberOfRows / Math.pow(2, k),
        blockWidth = numberOfColumns / k;

    console.log('blockHeight:', blockHeight, 'blockWidth:', blockWidth);
    margin = { top: 30, right: 0, bottom: 0, left: 30 },
        width = 800 - margin.left - margin.right,
        height = 800 - margin.top - margin.bottom;

    d3.select("svg").remove();
    svg = d3.select("#matrix").append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    matrix = reorder.random_matrix(0, numberOfRows, numberOfColumns), len = matrix.length;

    for (let i = 0; i < numberOfRows; i++) {
        bitPattern = parseInt((i / blockHeight));
        for (let j = 0; j < numberOfColumns; j++) {
            patternColumn = parseInt((j / blockWidth));
            value = (bitPattern & parseInt(Math.pow(2, patternColumn))) > 0 ? 1 : 0;
            matrix[i][j] = value;
        }
    }

    matrix = reorder.permute(matrix, reorder.randomPermutation(len));
    matrix = reorder.permutetranspose(matrix, reorder.randomPermutation(len));
    
    noise_percent > 0 ? matrix = salt_and_pepper_noise(noise_percent, matrix) : matrix;

    table({ matrix: matrix, method: 'block-reorder' });
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

function block_reorder() {
    var numberOfColumns = matrix[0].length,
        numberOfRows = matrix.length,
        orderOfColumns = [],
        optimals = [];

    const SISTERHOOD_BOUNDARY = 0.6;

    var columns = [];

    for (let i = 0; i < numberOfColumns; ++i) {
        var col = { 'list': [], 'noise': null, 'similarity': null, 'index': i },
            numberZeros = 0;

        for (let j = 0; j < numberOfRows; ++j) {
            let cellVal = matrix[j][i],
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
        for (col of columns) {
            NOISE_LIST.push(col.noise);
        }
        return reorder.sort_order(NOISE_LIST);
    }

    function SIMILARITY_RANK(columns) {
        let SIMILARITY_LIST = [];
        for (col of columns) {
            SIMILARITY_LIST.push(col.similarity);
        }
        return reorder.sort_order_descending(SIMILARITY_LIST);
    }

    while (columns.length != 0) {
        // Coluna pivô atual de C
        columns = reorder.permute(columns, NOISE_RANK(columns));
        var pivot = columns[0];

        /* calc similarity */
        for (col of columns) {
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

        // Reordena as colunas com base na similaridade com a pivot
        columns = reorder.permute(columns, SIMILARITY_RANK(columns));

        // Colunas irmãs de p
        var numberOfSisters = columns.filter((col) => (col.similarity >= SISTERHOOD_BOUNDARY)).length;

        // Construindo o col perm
        for (col of columns.slice(0, numberOfSisters)) {
            orderOfColumns.push(col.index);
        }

        // Coluna ótima, baseada em I
        var optimal = [];
        for (let i = 0; i < numberOfRows; ++i) {
            var numberOfZeros = 0;
            for (col of columns.slice(0, numberOfSisters)) {
                if (!col.list[i]) {
                    numberOfZeros++;
                }
            }
            optimal.push(numberOfZeros < numberOfSisters / 2 ? false : true);
        }

        optimals.push(optimal);

        // Retira de C as colunas irmãs
        columns.splice(0, numberOfSisters);
    }
        
    matrix = reorder.permutetranspose(matrix, orderOfColumns.reverse());
    //table.order(reorder.permutation(len),  orderOfColumns.reverse());
    for (optimal of optimals.reverse()) {
        for (let i = 1; i < numberOfRows; ++i) {
            for (let j = i; j > 0; --j) {
                if (optimal[j] && !optimal[j - 1]) {
                    for (auxOptimal of optimals) {
                        let temp = auxOptimal[j];
                        auxOptimal[j] = auxOptimal[j - 1];
                        auxOptimal[j - 1] = temp;
                    }
                    
                    let temp = matrix[j];
                    matrix[j] = matrix[j-1];
                    matrix[j - 1] = temp;
                    
                    // let temp = d3.select("#row"+j).attr("transform");
                    // d3.select("#row"+j).attr("transform", d3.select("#row"+(j-1)).attr("transform"));
                    // d3.select("#row"+(j-1)).attr("transform", temp);
                } else {
                    break;
                }
            }
        }
    }

    d3.select("svg").remove();
    svg = d3.select("#matrix").append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    table({ matrix: matrix, col_labels: orderOfColumns.reverse(), method: 'block-reorder' });

    console.log(rowPerm)
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