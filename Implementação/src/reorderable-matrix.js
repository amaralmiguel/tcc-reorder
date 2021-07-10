/**
 * @author Miguel Amaral
*/

/**
 * Classe para criar matrizes com padrões canônicos de dados
 * @param numberOfRows matriz a ser reordenada
 * @param numberOfCols matriz a ser reordenada
 * @param paramB matriz a ser reordenada
 * @param noiseLevel matriz a ser reordenada
 */
class ReorderableMatrixBuilder {
    constructor(numberOfRows, numberOfCols, paramB, noiseLevel, isBinary) {
        this.numberOfRows = numberOfRows;
        this.numberOfCols = numberOfCols;
        this.paramB = paramB;
        this.noiseLevel = noiseLevel;
        this.isBinary = isBinary;
        this.matrix = reorder.random_matrix(true, numberOfRows, numberOfCols);
    }

    /** 
     * Adiciona ruído na matriz
    */
    addNoiseToMatrix(isBinary) {
        let numberOfCells = this.numberOfRows * this.numberOfCols,
            noiseLength = parseInt(this.noiseLevel * numberOfCells),
            maxValue = d3.max(this.matrix.map(function (row) { return d3.max(row); })),
            minValue = d3.min(this.matrix.map(function (row) { return d3.min(row); })),
            difference = maxValue - minValue,
            noiseVal;

        for (let i = 0; i < noiseLength; i++) {
            let rowIndex = Math.floor(Math.random() * this.numberOfRows),
                colIndex = Math.floor(Math.random() * this.numberOfCols);

            if (isBinary) {
                noiseVal = Math.floor(Math.random() * (maxValue - minValue + 1)) + minValue;
            } else {
                noiseVal = Math.random() * difference + minValue;
            }
            this.matrix[rowIndex][colIndex] = noiseVal;
        }
        return this.matrix;
    }

    /** 
     * Cria uma matriz com padrão canônico do tipo Equi
    */
    equi() {
        for (let i = 1; i <= this.numberOfRows; i++) {
            for (let j = 1; j <= this.numberOfCols; j++) {
                this.matrix[i - 1][j - 1] = (this.paramB * i) / this.numberOfRows;
            }
        }

        return this.addNoiseToMatrix(this.isBinary);
    }

    /** 
     * Cria uma matriz com padrão canônico do tipo Simplex
    */
    simplex() {
        for (let i = 1; i <= this.numberOfRows; i++) {
            for (let j = 1; j <= this.numberOfCols; j++) {
                let t = ((j / this.numberOfCols) - (i / this.numberOfRows)) / this.paramB;
                this.matrix[i - 1][j - 1] = (Math.pow(Math.E, t)) / (1 + Math.pow(Math.E, t));
            }
        }
        return this.addNoiseToMatrix(this.isBinary);
    }

    /** 
     * Cria uma matriz com padrão canônico do tipo Band
    */    
    band() {
        for (let i = 1; i <= this.numberOfRows; i++) {
            for (let j = 1; j <= this.numberOfCols; j++) {
                let t = ((j / this.numberOfCols) - (i / this.numberOfRows)) / this.paramB;
                this.matrix[i - 1][j - 1] = (Math.pow(Math.E, -(Math.pow(t, 2))));
            }
        }

        return this.addNoiseToMatrix(this.isBinary);
    }

    /** 
     * Cria uma matriz com padrão canônico do tipo Circumplex
    */
    circumplex() {
        for (let i = 1; i <= this.numberOfRows; i++) {
            for (let j = 1; j <= this.numberOfCols; j++) {
                let t = Math.cos(Math.PI * ((j / this.numberOfCols) - (i / this.numberOfRows)));
                this.matrix[i - 1][j - 1] = (Math.pow(Math.E, -(Math.pow(t, 2))));
            }
        }

        return this.addNoiseToMatrix(this.isBinary);
    }

    /** 
     * Cria uma matriz com padrão canônico do tipo Block
    */
    block() {
        let k = this.paramB,
            blockHeight = this.numberOfRows / Math.pow(2, k),
            blockWidth = this.numberOfCols / k;

        for (let i = 0; i < this.numberOfRows; i++) {
            let bitPattern = parseInt((i / blockHeight));
            for (let j = 0; j < this.numberOfCols; j++) {
                let patternColumn = parseInt((j / blockWidth));
                this.matrix[i][j] = (bitPattern & parseInt(Math.pow(2, patternColumn))) > 0 ? 1 : 0;
            }
        }
        return this.addNoiseToMatrix(this.isBinary);
    }
}


/**
 * Classe para reordenar matrizes
 * @param matrix matriz a ser reordenada
 */
class ReorderableMatrixSort {
    constructor(matrix) {
        this.matrix = matrix;
        this.numberOfRows = matrix.length;
        this.numberOfCols = matrix[0].length;
        this.rowPerm = reorder.permutation(this.numberOfRows);
        this.colPerm = reorder.permutation(this.numberOfCols);
    }

    /**
     * Reordena a matriz de forma aleatória
     */
    shuffle() {
        this.rowPerm = reorder.randomPermutation(this.numberOfRows);
        this.colPerm = reorder.randomPermutation(this.numberOfCols);
        this.matrix = reorder.permute(this.matrix, this.rowPerm);
        this.matrix = reorder.permutetranspose(this.matrix, this.colPerm);
    }

    /**
     * Reordena a matriz de acordo com seus índices originais
     */
    originalOrder() {
        this.rowPerm = reorder.permutation(this.numberOfRows);
        this.colPerm = reorder.permutation(this.numberOfCols);
        this.matrix = reorder.permute(this.matrix, this.rowPerm);
        this.matrix = reorder.permutetranspose(this.matrix, this.colPerm);
    }

    /**
     * Reordena uma matriz a afim de revelar os padrões Equi e Simplex
     */
    fvs() {
        let rowMean = [],
            colMean = [];

        // Média aritmética das linhas
        for (let i = 0; i < this.numberOfRows; i++) {
            rowMean.push(reorder.mean(this.matrix[i]));
        }

        // Média aritmética das colunas
        for (let j = 0; j < this.numberOfCols; j++) {
            colMean.push(reorder.meantranspose(this.matrix, j));
        }

        // Vetores de permutação com a ordem das médias obtidas
        this.rowPerm = reorder.sort_order(rowMean);
        this.colPerm = reorder.sort_order(colMean);

        // Ordena a matriz com base nos vetores de permutação definidos
        this.matrix = reorder.permute(this.matrix, this.rowPerm);
        this.matrix = reorder.permutetranspose(this.matrix, this.colPerm);
        return this.matrix;
    }

    /**
     * Reordena uma matriz a afim de revelar os padrões Band e Circumplex
     */
    polarSort() {
        const getSortingOrder = (isRowSorting) => {
            /**
             * Escalonamento Multidimensional Clássico
             */
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


            // Obtém as distâncias das linhas e colunas da matriz
            let distanceMatrix,
                sortingOrder;

            if (isRowSorting) {
                distanceMatrix = reorder.dist()(this.matrix);
                sortingOrder = reorder.permutation(this.numberOfRows);
            } else {
                distanceMatrix = reorder.dist()(reorder.transpose(this.matrix));
                sortingOrder = reorder.permutation(this.numberOfCols)
            }

            // Obtém as coordenadas cartesianas e o baricentro dos pontos
            let cartesianCoords = mds(distanceMatrix, 2),
                meanX = reorder.meantranspose(cartesianCoords, 0),
                meanY = reorder.meantranspose(cartesianCoords, 1);

            // Converte os pontos cartesianos em ângulos polares
            let angles = [];
            for (let points of cartesianCoords) {
                var x = points[0],
                    y = points[1],
                    angle = Math.atan2(y - meanY, x - meanX);

                angles.push(angle);
            }

            // Ordena os ângulos crescentemente
            let newOrder = reorder.sort_order(angles);
            angles = reorder.permute(angles, newOrder);
            sortingOrder = reorder.permute(sortingOrder, newOrder);

            // Obtém a maior distância entre pares de pontos
            let max = 0,
                pairDistance = 0,
                cutPoint = 0;

            for (let i = 0; i < this.numberOfRows - 1; ++i) {
                for (let j = i + 1; j < this.numberOfCols; ++j, i++) {
                    let angle1 = angles[i],
                        angle2 = angles[j];

                    pairDistance = math.abs(angle1 - angle2);

                    if (pairDistance > max) {
                        max = pairDistance;
                        cutPoint = j;
                    }
                }
            }

            let circularListPerm = [];

            for (let index in this.matrix) {
                if (cutPoint > this.numberOfRows - 1) cutPoint = 0;
                circularListPerm.push(cutPoint++);
            }

            sortingOrder = reorder.permute(sortingOrder, circularListPerm);

            return sortingOrder;
        }

        // Define os vetores de permutação das linhas e colunas da matriz
        this.rowPerm = getSortingOrder(true);
        this.colPerm = getSortingOrder(false);

        // Ordena a matriz com base nos vetores de permutação definidos
        this.matrix = reorder.permute(this.matrix, this.rowPerm);
        this.matrix = reorder.permutetranspose(this.matrix, this.colPerm);
        return this.matrix
    }

    /**
    * Reordena uma matriz a afim de revelar o padrão Block
    */
    blockReordering() {
        let optimals = [],
            columns = [];
        const SISTERHOOD_BOUNDARY = 0.6;
        this.colPerm = [];

        // Obtém as propriedades das colunas da matriz
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

        // Funções auxiliares
        function noiseRank(columns) {
            let noiseList = [];
            for (let col of columns) {
                noiseList.push(col.noise);
            }
            return reorder.sort_order(noiseList);
        }

        function similarityRank(columns) {
            let similarityList = [];
            for (let col of columns) {
                similarityList.push(col.similarity);
            }
            return reorder.sort_order_descending(similarityList);
        }

        while (columns.length != 0) {
            // Coluna pivô atual
            columns = reorder.permute(columns, noiseRank(columns));
            var pivot = columns[0];

            // Obtém a taxa de similaridade das colunas
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

            columns = reorder.permute(columns, similarityRank(columns));

            // Identificação de colunas irmãs
            let numberOfSisters = columns.filter((col) => (col.similarity >= SISTERHOOD_BOUNDARY)).length;

            for (let col of columns.slice(0, numberOfSisters)) {
                this.colPerm.push(col.index);
            }

            // Criação das colunas ótimas
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

            columns.splice(0, numberOfSisters);
        }

        // Vetor de permutação das linhas
        this.rowPerm = reorder.permutation(this.numberOfRows);

        for (let optimal of optimals.reverse()) {
            for (let i = 1; i < this.numberOfRows; ++i) {
                for (let j = i; j > 0; --j) {
                    if (optimal[j] && !optimal[j - 1]) {
                        for (let auxOptimal of optimals) {
                            let temp = auxOptimal[j];
                            auxOptimal[j] = auxOptimal[j - 1];
                            auxOptimal[j - 1] = temp;
                        }

                        let temp = this.rowPerm[j];
                        this.rowPerm[j] = this.rowPerm[j - 1];
                        this.rowPerm[j - 1] = temp;

                    } else {
                        break;
                    }
                }
            }
        }

        // Ordena a matriz com base nos vetores de permutação definidos
        this.matrix = reorder.permute(this.matrix, this.rowPerm);
        this.matrix = reorder.permutetranspose(this.matrix, this.colPerm);
        return this.matrix;
    }

    /**
    * Reordena a matriz de acordo com o padrão obtido na classificação
    */
    async hybridSort() {
        let response = await $.ajax({
            url: 'https://hybrid-sort-api.herokuapp.com/classifier',
            type: "POST",
            data: JSON.stringify({
                matrix: this.matrix,
                rowPerm: this.rowPerm,
                colPerm: this.colPerm
            }),
            contentType: "application/json; charset=utf-8"
        });

        console.log(response);
        
        switch (response) {
            case 'equi':
                return this.fvs();
            case 'simplex':
                return this.fvs();
            case 'band':
                return this.polarSort();
            case 'circumplex':
                return this.polarSort();
            case 'block':
                return this.blockReordering();
            case 'noise':
                return "Nenhum padrão canônico encontrado para essa matriz";
            default:
                return "Ops, algo deu errado. Verifique se as informações estão corretas";
        }
    }
}