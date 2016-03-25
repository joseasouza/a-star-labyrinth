
/*
 * Apache License 2.0
 * Copyright (c) 2016 - José Victor Alves de Souza - https://github.com/dudevictor/
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 */

/**
 * Define the entities used in application
 * @author dudevictor.github.io
 */

var DimensionSquare = 50;
var DimensionBarrier = 56;
var DimensionFootPrint = 32;
var DimensionStart = {width:  21, height: 36};
var Padding = {
    top: 75,
    right: 50,
    bottom: 50,
    left: 50
};

var Labyrinth = function(rowCount, colCount, horCost, verCost, diaCost, map, start, goal) {
    this.rowCount = rowCount;
    this.colCount = colCount;
    this.horCost = horCost;
    this.verCost = verCost;
    this.diaCost = diaCost == null? Math.sqrt(Math.pow(horCost, 2) + Math.pow(verCost, 2)) : diaCost;
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

//@TODO Não é necessario utilizar translate, pois pos[] = translate[]
//@TODO Definição confusa utilizar novo objeto Block
var PositionSquareSprites = {
    START : new Sprite('assets/start.gif', [0,  0], [14, 24], 1, [0], null, null,
        [DimensionStart.width, DimensionStart.height]),
    BLOCK : new Sprite('assets/Shrub48.gif', [0,  0], [48, 48], 1, [0], null, null,
        [DimensionBarrier, DimensionBarrier])
};
var PositionSquare = function(iRow, iCol, type) {
    this.pos = [Padding.left + iCol * DimensionSquare, Padding.top + iRow * DimensionSquare];
    this.center = [this.pos[0] + DimensionSquare/2, this.pos[1] + DimensionSquare/2];
    this.index = [iRow, iCol];
    this.type = type;
    this.translate;
    this.sprite = PositionSquareSprites.BLOCK;
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
    };
    this.updateTranslate = function() {
        this.translate = [DimensionSquare/2 - this.sprite.sizeOfDraw[0]/2+ this.pos[0],
            DimensionSquare/2 - this.sprite.sizeOfDraw[1]/2 + this.pos[1]];
    };
    this.updateSquare = function(newSquare) {
        this.pos = newSquare.pos;
        this.center = newSquare.center;
        this.index = newSquare.index;
        this.updateTranslate();
    };
    this.updateSprite = function(newSprite) {
        this.sprite = newSprite;
        this.updateTranslate();
    } ;
    this.updateTranslate();
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
    LOSE: new Sprite('assets/dead.gif', [0, 0], [64, 28], 1, [0]),
    NORMAL: new Sprite('assets/personagem.gif', [0,  0], [32, 70], 1, [0])
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
 * this.square it defines the actual {@link PositionSquare} the player is located
 * this.updatePosition(newPosition) = the param new Position is the new value of this.pos. This function updates
 *                          the values of pos and translate based on this new value.
 */
var Player = function(start) {
    this.sprite = PlayerSprites.NORMAL;
    this.pos = start.center;
    this.translate = null;
    this.square = start;
    this.updatePosition = function(newPosition) {
        this.pos = newPosition;
        this.updateTranslate();
    };
    this.updateSpriteMoviment = function(oldPos, newPos) {
        var move = MovimentDirection.identifyDirection(oldPos, newPos);
        this.updateSprite(PlayerSprites[move]);
    };
    this.updateSprite = function(newSprite) {
        this.sprite = newSprite;
        this.updateTranslate();
    };

    this.updateTranslate = function() {
        this.translate = [Math.abs(DimensionSquare/2 - this.sprite.size[0]/2)+ this.pos[0] - DimensionSquare/2,
            Math.abs(DimensionSquare/2 - this.sprite.size[1]/2) + this.pos[1] - this.sprite.size[1]];
    };
    this.updateSquare = function(newSquare) {
        this.square = newSquare;
        this.pos = newSquare.center;
        this.updateTranslate();
    };

    this.updatePosition(start.center);
};

var GoalSprite = new Sprite('assets/portal.png', [0, 0], [30, 31], 10, [0, 1, 2]);
var Goal = function(goal) {
    this.pos = goal.pos;
    this.square = goal;
    this.sprite = GoalSprite;
    this.translate;
    this.center;
    this.updateSquare = function(newSquare) {
        this.square = newSquare;
        this.pos = newSquare.pos;
        this.updateTranslate();
    };
    this.updateTranslate = function() {
        this.translate = [Math.abs(DimensionSquare/2 - this.sprite.size[0]/2)+ this.pos[0],
            Math.abs(DimensionSquare/2 - this.sprite.size[1]/2) + this.pos[1]];
        this.center = [this.translate[0] + this.sprite.size[0]/2, this.translate[1] + this.sprite.size[1]/2];
    };
    this.updateTranslate();
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
