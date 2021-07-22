# TCC Reorder.js @ Unicamp
Projeto desenvolvido como Trabalho de Conclusão de Curso em Sistemas de Informação. 
**Tema**: Implementação de algoritmos de reordenação de matrizes em JavaScript utilizando a biblioteca reorder.js.
# Instruções para rodar o projeto
1.   Faça o download deste repositório em seu sistema;
2.   Na pasta raiz, abra o arquivo index.html.

    Será aberto uma nova página no navegador, mostrando as matrizes reordenáveis e as formas de interação.

A implementação obedece a seguinte estrutura:
- `src/reorderable-matrix.js` arquivo contendo a implementação dos algoritmos de reordenação de matrizes e de criação de matrizes com padrões canônicos de dados;
- `src/demo.js` arquivo responsável por fazer chamada aos métodos implementados de acordo com a interação do usuário na interface gráfica;
- `src/table.js` arquivo originário da biblioteca reorder.js responsável por renderizar matrizes em tela, modificado para atender os requisitos deste trabalho;
- `lib` bibliotecas utilizadas na implementação, inclusive a reorder.js.

A *API* para acesso remoto ao classificador *Hybrid Sort* está na pasta `API Hybrid Sort`. A implementação do lado do servidor está no caminho: `src/main/java/ft/unicamp/apihybridsort/ApiHybridSortApplication.java`.
Para a *API*, não é necessário executar nenhum arquivo adicional.  No entanto, para classificar uma matriz em um determinado padrão canônico de dados, devem ser informados os seguintes parâmetros via requisição *POST* para o endereço `https://hybrid-sort-api.herokuapp.com/classifier`:
- Matriz reordenável (`chave` "matrix");
- Vetor de permutação de linhas (`chave` "rowPerm");
- Vetor de permutação de colunas (`chave` "colPerm").

Um exemplo de como fazer a requisição está no método *Hybrid Sort* do arquivo `src/reorderable-matrix.js`.
