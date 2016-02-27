
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
    this.index = [iRow, iCol];
    this.type = type;
    this.imgUrl = "assets/Shrub.gif";
    this.equals  = function(otherSquare) {
        if (this.index === otherSquare.index) return true;
        if (this.index == null || otherSquare.index == null) return false;
        if (this.index.length != otherSquare.index.length) return false;
        for (var i = 0; i < this.index.length; ++i) {
            if (this.index[i] !== otherSquare.index[i]) return false;
        }
        return true;
    };
};

var Player = function(start) {
    this.pos = null;
    this.sprite = new Sprite('assets/right.png', [0, 0], [56, 68], 9, [0, 1, 2, 3, 4, 5]);
    this.localPosition = null;
    this.actualSquare = start;
    this.updatePosition = function(newPosition) {
        this.pos = newPosition;
        this.localPosition = [this.pos[0] - this.sprite.size[0]/2, this.pos[1] - this.sprite.size[1] + 8];
    };
    this.updatePosition(start.pos);
};

/*new Sprite('assets/comemorar.png', [0, 0], [36, 72], 2, [0, 1]);*/
/*new Sprite('assets/cima.png', [0, 0], [40, 76], 9, [0, 1, 2, 3, 4, 5]);*/
/*new Sprite('assets/left.png', [0, 0], [56, 68], 9, [0, 1, 2, 3, 4, 5]); */

var Goal = function(goal) {
    this.pos = goal;
    this.sprite = new Sprite('assets/portal.png', [0, 0], [30, 31], 10, [0, 1, 2]);
};

var TypeMovement = {
    HORIZONTAL : "HOR",
    VERTICAL : "VER",
    DIAGONAL : "DIA",
    identifyDirection : function(squareFrom, squareTo) {
        if (squareTo.index[0] = squareFrom.index[0]) return this.VERTICAL;
        else if (squareTo.index[1] = squareFrom.index[1]) return this.HORIZONTAL;
        else return this.DIAGONAL;
    }
};

var MovimentDirection = function() {
    this.UP = "UP";
    this.DOWN = "DOWN";
    this.LEFT = "LEFT";
    this.RIGHT = "RIGHT";
    this.D_LEFT_UP = "D_LEFT_UP";
    this.D_LEFT_DOWN = "D_LEFT_DOWN";
    this.D_RIGHT_UP = "D_RIGHT_UP";
    this.D_RIGHT_DOWN = "D_RIGHT_DOWN";

    this.identifyDirection = function(squareFrom, squareTo) {
        if (squareTo.index[0] < squareFrom.index[0]
            && squareTo.index[1] < squareFrom.index[1]) return this.D_LEFT_UP;
        else if (squareTo.index[0] == squareFrom.index[0]
            && squareTo.index[1] < squareFrom.index[1]) return this.UP;
        else if (squareTo.index[0] > squareFrom.index[0]
                && squareTo.index[1] < squareFrom.index[1]) return this.D_RIGHT_UP;
        else if (squareTo.index[0] < squareFrom.index[0]
                && squareTo.index[1] == squareFrom.index[1]) return this.LEFT;
        else if (squareTo.index[0] > squareFrom.index[0]
                && squareTo.index[1] == squareFrom.index[1]) return this.RIGHT;
        else if (squareTo.index[0] < squareFrom.index[0]
            && squareTo.index[1] > squareFrom.index[1]) return this.D_LEFT_DOWN;
        else if (squareTo.index[0] == squareFrom.index[0]
            && squareTo.index[1] > squareFrom.index[1]) return this.DOWN;
        else return this.D_RIGHT_DOWN;
    }

};
