
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
 * Define the entities used in application
 * @author dudevictor.github.io
 */
var Labyrinth = function(rowCount, colCount, horCost, verCost, map, start, goal) {
    this.rowCount = rowCount;
    this.colCount = colCount;
    this.horCost = horCost;
    this.verCost = verCost;
    this.map = map;
    this.start = start;
    this.goal = goal;
};

var TypePosition = {
    ALLOWED: "ALLOWED",
    BLOCKED: "BLOCKED",
    START: "START",
    GOAL: "GOAL",
    OPEN: "OPEN",
    CLOSED: "CLOSED",
    array: ["ALLOWED", "BLOCKED", "START", "GOAL", "OPEN", "CLOSED"]
};

var DimensionSquare = 50;

var PositionSquare = function(iRow, iCol, type) {
    this.pos = [iCol * DimensionSquare, iRow * DimensionSquare];
    this.center = [this.pos[0] + DimensionSquare/2, this.pos[1] + DimensionSquare/2];
    this.type = type;
    this.imgUrl = "assets/Shrub.gif";
};

var Player = function(start) {
  this.pos = start;
  this.sprite = new Sprite('assets/right.png', [0, 0], [56, 68], 9, [0, 1, 2, 3, 4, 5]);
};

/*new Sprite('assets/comemorar.png', [0, 0], [36, 72], 2, [0, 1]);*/
/*new Sprite('assets/cima.png', [0, 0], [40, 76], 9, [0, 1, 2, 3, 4, 5]);*/
/*new Sprite('assets/left.png', [0, 0], [56, 68], 9, [0, 1, 2, 3, 4, 5]); */

var Goal = function(goal) {
    this.pos = goal;
    this.sprite = new Sprite('assets/portal.png', [0, 0], [30, 31], 10, [0, 1, 2]);
}
