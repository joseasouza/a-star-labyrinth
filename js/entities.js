
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
    this.diaCost = Math.sqrt(Math.pow(horCost, 2) + Math.pow(verCost, 2));
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
var DimensionBarrier = 56;
var DimensionFootPrint = 32;
var DimensionStart = {width:  21, height: 36};

//@TODO Não é necessario utilizar translate, pois pos[] = translate[]
//@TODO this.imgurl deve ser alterado para utilizar sprite
var PositionSquare = function(iRow, iCol, type) {
    this.pos = [iCol * DimensionSquare, iRow * DimensionSquare];
    this.center = [this.pos[0] + DimensionSquare/2, this.pos[1] + DimensionSquare/2];
    this.translate = [this.center[0] - DimensionBarrier/2, this.center[1] - DimensionBarrier/2];
    this.index = [iRow, iCol];
    this.type = type;
    this.imgUrl = "assets/Shrub48.gif";
    this.equals  = function(otherSquare) {
        if (this.index === otherSquare.index) return true;
        if (this.index == null || otherSquare.index == null) return false;
        if (this.index.length != otherSquare.index.length) return false;
        for (var i = 0; i < this.index.length; ++i) {
            if (this.index[i] !== otherSquare.index[i]) return false;
        }
        return true;
    };
    this.generateIdentifier = function() {
        return this.pos[0].toString() + this.pos[1].toString();
    }
};

var PlayerSprites = {
    UP : new Sprite('assets/cima.png', [0, 0], [40, 76], 9, [0, 1, 2, 3, 4, 5]),
    RIGHT: new Sprite('assets/right.png', [0, 0], [56, 68], 9, [0, 1, 2, 3, 4, 5]),
    DOWN: new Sprite('assets/baixo.png', [0, 0], [40, 72], 9, [0, 1, 2, 3, 4, 5]),
    LEFT: new Sprite('assets/left.png', [0, 0], [56, 68], 9, [0, 1, 2, 3, 4, 5]),
    D_LEFT_UP: new Sprite('assets/cima.png', [0, 0], [40, 76], 9, [0, 1, 2, 3, 4, 5]),
    D_LEFT_DOWN: new Sprite('assets/left.png', [0, 0], [56, 68], 9, [0, 1, 2, 3, 4, 5]),
    D_RIGHT_UP: new Sprite('assets/right.png', [0, 0], [56, 68], 9, [0, 1, 2, 3, 4, 5]),
    D_RIGHT_DOWN: new Sprite('assets/baixo.png', [0, 0], [40, 72], 9, [0, 1, 2, 3, 4, 5]),
    VICTORY: new Sprite('assets/comemorar.png', [0, 0], [36, 72], 3, [0, 1]),
    LOSE: new Sprite('assets/dead.gif', [0, 0], [64, 28], 1, [0])
};

/**
 * Function that defines a Player
 * @param start this is the actual square {@link PositionSquare} that our player is located.
 *        It is just updated when the player stay on top of the new square
 *
 * this.pos = It is an array [x y] that defines the position of drawing
 * this.sprite = Define the sprite object {@link Sprite} of the player
 * this.translate = It is an array [x y] that defines how much have to deslocate to start drawing at canvas
 * this.pos = It in an array[x y] that defines where is the player is located on the scene
 *                  (it points to the foot of the character)
 * this.actualSquare it defines the actual {@link PositionSquare} the player is located
 * this.updatePosition(newPosition) = the param new Position is the new value of this.pos. This function updates
 *                          the values of pos and translate based on this new value.
 */
var Player = function(start) {
    this.sprite = PlayerSprites[MovimentDirection.RIGHT];
    this.pos = start.center;
    this.translate = null;
    this.actualSquare = start;
    this.updatePosition = function(newPosition) {
        this.updateMoviment(MovimentDirection.identifyDirection(this.pos, newPosition));
        this.pos = newPosition;
        this.translate = [Math.abs(DimensionSquare/2 - this.sprite.size[0]/2)+ this.pos[0] - this.sprite.size[0]/2,
                        Math.abs(DimensionSquare/2 - this.sprite.size[1]/2) + this.pos[1] - this.sprite.size[1]];
    };
    this.updateMoviment = function(newMoviment) {
        this.sprite = PlayerSprites[newMoviment];
    };
    this.updateSprite = function(newSprite) {
        this.sprite = newSprite;
        this.translate = [Math.abs(DimensionSquare/2 - this.sprite.size[0]/2)+ this.pos[0] - this.sprite.size[0]/2,
            Math.abs(DimensionSquare/2 - this.sprite.size[1]/2) + this.pos[1] - this.sprite.size[1]];
    };
    this.updatePosition(start.center);
};

var Goal = function(goal) {
    this.pos = goal.pos;
    this.square = goal;
    this.sprite = new Sprite('assets/portal.png', [0, 0], [30, 31], 10, [0, 1, 2]);
    this.translate = [Math.abs(DimensionSquare/2 - this.sprite.size[0]/2)+ this.pos[0],
                      Math.abs(DimensionSquare/2 - this.sprite.size[1]/2) + this.pos[1]];
    this.center = [this.translate[0] + this.sprite.size[0]/2, this.translate[1] + this.sprite.size[1]/2];

};

var TypeMovement = {
    HORIZONTAL : "HOR",
    VERTICAL : "VER",
    DIAGONAL : "DIA",
    identifyDirection : function(squareFrom, squareTo) {
        if (squareTo.index[1] == squareFrom.index[1]) return this.VERTICAL;
        else if (squareTo.index[0] == squareFrom.index[0]) return this.HORIZONTAL;
        else return this.DIAGONAL;
    }
};

var MovimentDirection = {
    UP : "UP",
    DOWN : "DOWN",
    LEFT : "LEFT",
    RIGHT : "RIGHT",
    D_LEFT_UP : "D_LEFT_UP",
    D_LEFT_DOWN : "D_LEFT_DOWN",
    D_RIGHT_UP : "D_RIGHT_UP",
    D_RIGHT_DOWN : "D_RIGHT_DOWN",

    identifyDirection : function(from, to) {
        if (to[0] < from[0]
            && to[1] < from[1]) return this.D_LEFT_UP;
        else if (to[0] == from[0]
            && to[1] < from[1]) return this.UP;
        else if (to[0] > from[0]
                && to[1] < from[1]) return this.D_RIGHT_UP;
        else if (to[0] < from[0]
                && to[1] == from[1]) return this.LEFT;
        else if (to[0] > from[0]
                && to[1] == from[1]) return this.RIGHT;
        else if (to[0] < from[0]
            && to[1] > from[1]) return this.D_LEFT_DOWN;
        else if (to[0] == from[0]
            && to[1] > from[1]) return this.DOWN;
        else return this.D_RIGHT_DOWN;
    }

};
