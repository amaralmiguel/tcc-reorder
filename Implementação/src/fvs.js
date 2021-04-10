function get_data() {
    var data = {
        pattern: document.getElementById('equi_radio').checked ? 'equi' : 'simplex',
        b: document.getElementById('b').value,
        dimensions: document.getElementById('dimensions').value,
        noise_percent: document.getElementById('noise_percent').value
    };

    return fvs_builder(data);
}

function fvs_builder(data) {
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

    pattern == 'simplex' ? matrix = simplex(matrix, len, b) : matrix = equi(matrix, len, b);

    noise_percent > 0 ? matrix = salt_and_pepper_noise(noise_percent, matrix) : matrix;

    table({ matrix: matrix, method: 'fvs' });
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

function simplex(matrix, len, b) {
    for (let i = 1; i <= len; i++) {
        for (let j = 1; j <= len; j++) {
            var t = ((j / len) - (i / len)) / b;
            matrix[i - 1][j - 1] = (Math.pow(Math.E, t)) / (1 + Math.pow(Math.E, t)); // Simplex formula
        }
    }
    return matrix;
}

function equi(matrix, len, b) {
    for (let i = 1; i <= len; i++) {
        for (let j = 1; j <= len; j++) {
            matrix[i - 1][j - 1] = (b * i) / len; // Equi-correlation formula
        }
    }

    return matrix;
}

/* Reordena a matriz de acordo com o método FVS */
function fvs_order() {
    let row_perm = [],
        col_perm = [];

    for (let i = 0; i < len; i++) {
        row_perm.push(reorder.mean(matrix[i])); // Resultado das médias aritméticas das linhas
        col_perm.push(reorder.meantranspose(matrix, i)); // Resultado das médias aritméticas das colunas
    }
    table.order(reorder.sort_order(row_perm), reorder.sort_order(col_perm)); //Reordena a matriz
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