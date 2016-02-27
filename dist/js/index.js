
/*
 * The MIT License (MIT)
 * Copyright© fev/2016 - José Victor Alves de Souza - https://github.com/dudevictor
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this
 * software and associated documentation files (the "Software"), to deal in the Software
 * without restriction, including without limitation the rights to use, copy, modify, merge,
 *  publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to
 *   whom the Software is furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all copies or
 *  substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL
 * THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR
 * OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE,
 * ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE
 * OR OTHER DEALINGS IN THE SOFTWARE.
 */

/**
 * Contains general scripts for the index.html page
 * @author dudevictor.github.io
 */
$(document).ready(function() {
    var game;

    $('#fileUpload').change(function(e) {
        var file = this.files[0];
        var textType = /text.*/;

        if (file.type.match(textType)) {
            var reader = new FileReader();
            reader.onload = function(e) {
                $("#fileUpload").val("");
                $("li.dropdown.profile").removeClass("open");
                var lab = labyrinthFromFile(reader.result);
                game = new Game(lab);
            };
            reader.readAsText(file);
        }

    });

    function labyrinthFromFile(result) {
        var linesFile = result.split("\n");
        var firstLine = linesFile[0].split(" ");

        var rowCount = Number(firstLine[0]);
        var colCount = Number(firstLine[1]);
        var horCost = Number(firstLine[2]);
        var verCost = Number(firstLine[3]);
        var start = [];
        var goal = [];
        var map = [];

        var row, iRow, rowMap, type, square;
        for (var i = 1; i < linesFile.length; i++) {
            row = linesFile[i].split(" ");
            iRow = i-1;
            rowMap = [];
            $.each(row, function(iCol, value) {
                tipo = TypePosition.array[Number(value)];
                var square = new PositionSquare(iRow, iCol, tipo);
                rowMap.push(square);

                if (tipo == TypePosition.START) {
                    start = square.center;
                }
                if (tipo == TypePosition.GOAL) {
                    goal = square.center;
                }

            });
            map.push(rowMap);
        }

        return new Labyrinth(rowCount, colCount, horCost, verCost, map, start, goal);
    }
});