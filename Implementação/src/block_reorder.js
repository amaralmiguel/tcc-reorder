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

    matrix = reorder.random_matrix(0, 16, 16),
        len = matrix.length;

    //matrix = block_matrix(matrix, k);

    matrix = [
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1],
        [0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1],
        [0, 0, 0, 0, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 1, 1, 1, 1, 0, 0, 0, 0, 1, 1, 1, 1],
        [0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0],
        [0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
        [1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1],
        [1, 1, 1, 1, 0, 0, 0, 0, 1, 1, 1, 1, 0, 0, 0, 0],
        [1, 1, 1, 1, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1],
        [1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0],
        [1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 1, 1, 1, 1],
        [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0],
        [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    ];

    matrix = reorder.permutetranspose(matrix, reorder.permutation(len).reverse());

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

function createBinaryString(nMask) {
    for (var nFlag = 0, nShifted = nMask, sMask = ""; nFlag < 32;
        nFlag++, sMask += String(nShifted >>> 31), nShifted <<= 1);
    return sMask;
}

let bits = [];
function block_matrix(matrix, k) {
    let block_height = Math.round(len / (math.pow(2, k))),
        block_width = Math.round(len / k),
        index = 0;

    console.log('Colunas: ' + block_width, 'Linhas: ' + block_height)

    let qtd_blocos_linha = Math.round(len / block_height);

    for (let i = 0; i < qtd_blocos_linha; i++) {
        let temp = createBinaryString(i);
        for (let j = 0; j < k; j++) {
            bits.push(Number(temp[temp.length - 1 - j]));
        }
    }

    /* Loop over every cell of the matrix */
    for (let i = 0; i < len; i++) {
        for (let j = 0; j < len; j++) {
            if (i % block_height == 0) {
                matrix[i][j] = bits[index];
                if (j != 0 && j % block_width == 0) {
                    index++;
                }
            }
            else {
                matrix[i][j] = matrix[i - 1][j];
            }
        }
    }
    return matrix;
}

function block_reorder() {
    function noise_percent(listOfColumns) {
        let noise_array = [];

        for (column of listOfColumns) {
            let numberZeros = 0;

            for (cell of column) {
                cell >= 0.5 ? numberZeros : numberZeros++;
            }

            noise_array.push(Math.abs((numberZeros - (column.length / 2))) / column.length);
        }
        return noise_array;
    }

    function simple_matching(pivot, listOfColumns) {
        let match_array = [];

        for (column of listOfColumns) {
            let v = i = 0.0;

            for (cell of column) {
                cell == pivot[i] ? v += 1 : v;
                i++;
            }
            match_array.push(v /= column.length);
        }
        return match_array;
    }

    function optimal(numberOfSisters, listOfColumns) {
        let optimal = [];
        for (index in matrix) {
            let qtdZeros = 0;
            for (col of listOfColumns.slice(0, numberOfSisters)) {
                if ((col[index] >= 0.5) == false) {
                    qtdZeros++;
                }
            }
            optimal.push(qtdZeros < numberOfSisters / 2 ? 1 : 0);
        }

        return optimal;
    }

    const SISTERHOOD_BOUNDARY = 0.6;
    var optimals = [], // Lista de colunas ótimas
        listOfColumns = reorder.transpose(matrix), // Lista de colunas da matriz
        Clinha = [], // Lista de colunas ordenadas da matriz
        orderOfColumns = [];

    while (listOfColumns.length != 0) {
        // Coluna pivô atual de C
        var pivot = listOfColumns[noise_percent(listOfColumns).indexOf(Math.min(...noise_percent(listOfColumns)))];

        // Reordene C com base na similaridade com p
        listOfColumns = reorder.permute(listOfColumns, reorder.sort_order_descending(simple_matching(pivot, listOfColumns)));

        // Colunas irmãs de p
        var numberOfSisters = simple_matching(pivot, listOfColumns).filter(similarity => similarity >= SISTERHOOD_BOUNDARY).length;
        var I = listOfColumns.filter((cell, index) => index < numberOfSisters);
        for (index in reorder.transpose(matrix)) {
            for (column of I) {
                if (JSON.stringify(reorder.transpose(matrix)[index]) == JSON.stringify(column)) {
                    orderOfColumns.push(parseInt(index));
                    break;
                }
            }
        }
        // Coluna ótima, baseada em I
        optimals.push(optimal(numberOfSisters, listOfColumns));

        // Insira em C' os elementos pertencentes a I
        Clinha = Clinha.concat(I);

        // Retire de C os elementos pertencentes a I
        listOfColumns.splice(0, numberOfSisters);
    }

    table.order(reorder.permutation(len), orderOfColumns.reverse());

    for (optimal of optimals) {
        table.order(reorder.sort_order(optimal), orderOfColumns.reverse())
    }
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