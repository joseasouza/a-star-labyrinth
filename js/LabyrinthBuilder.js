/*
 * Copyright (c) 2016 - José Victor Alves de Souza - https://github.com/dudevictor/
 */
/**
 * This script defines the game function and all logic to render and control the canvas element
 * @param labyrinth a instance of {@link Labyrinth}
 * @constructor it initializes the Game
 */
var LabyrinthBuilder = function(grid, lab) {
    var canvas = document.getElementById("canvas");
    var ctx = canvas.getContext("2d");
    var gameTime = 0;
    var texture;
    var isShowGrade = true;
    var isRendering = false;
    var blockList = {};
    var player;
    var goal;
    var builder = this;
    var isMovingObject = false;
    var elementHover;
    var EraseSprite = new Sprite('assets/erase.png', [0, 0], [137, 273], 1, [0], null, null, [22, 40]);

    var mousePosition = {
        x: 0,
        y : 0
    };
    var OPTION_SELECTED = {
        START_POSITION : "start_position",
        GOAL: "goal",
        BLOCK: "block",
        ERASE: "erase",
        NONE: "none"
    };

    var actualOptionSelected = OPTION_SELECTED.NONE;


    this.stop = function() {
        $(canvas).unbind();
        main = function() {};
        while(isRendering);
    };

    var isPaused = false;
    function pause() {
        isPaused = true;
        while(isRendering);
    }

    function play() {
        isPaused = false;
        iniciar();
    }

    this.startPositionSelected = function() {
        cancelMoving();
        actualOptionSelected = OPTION_SELECTED.START_POSITION;
        var indexes = findIndexSquareMouseHover();
        var square = new PositionSquare(indexes.row, indexes.col);
        elementHover = new Player(square);
    };

    this.goalPositionSelected = function() {
        cancelMoving();
        actualOptionSelected = OPTION_SELECTED.GOAL;
        var indexes = findIndexSquareMouseHover();
        var square = new PositionSquare(indexes.row, indexes.col);
        elementHover = new Goal(square);
    };

    this.noControlSelected = function () {
        cancelMoving();
        actualOptionSelected = OPTION_SELECTED.NONE;
        elementHover = null;
    };

    this.controlBlockSelected = function() {
        cancelMoving();
        actualOptionSelected = OPTION_SELECTED.BLOCK;
        var indexes = findIndexSquareMouseHover();
        elementHover = new PositionSquare(indexes.row, indexes.col);
    };

    this.controlEraseSelected = function() {
        cancelMoving();
        actualOptionSelected = OPTION_SELECTED.ERASE;
        var indexes = findIndexSquareMouseHover();
        elementHover = new PositionSquare(indexes.row, indexes.col);
        elementHover.updateSprite(EraseSprite);
    };

    this.buildLabyrinth = function() {
        var labyrinthConfigs = generateLabyrinthSettings();
        var rowCount = labyrinthConfigs.rowCount;
        var colCount = labyrinthConfigs.colCount;
        var map = emptyMap(rowCount, colCount);
        var startSquare = player.square;
        var goalSquare = goal.square;
        startSquare.type = TypePosition.START;
        startSquare.updateSprite(PositionSquareSprites.START);
        goalSquare.type = TypePosition.GOAL;

        map[goalSquare.index[0]][goalSquare.index[1]] = goalSquare;
        map[goalSquare.index[0]][goalSquare.index[1]] = goalSquare;

        $.each(blockList, function(key, value) {
            map[value.index[0]][value.index[1]] = value;
        });

        return new Labyrinth(rowCount, colCount, labyrinthConfigs.horCost, labyrinthConfigs.verCost,
                            map, startSquare, goalSquare);
    };

    //@TODO UTILITY JS
    function emptyMap(rowCount, colCount) {

        var map = [];
        for (var i = 0; i < rowCount; i++) {
            var array = [];
            for (var j = 0; j < colCount; j++) {
                array.push(new PositionSquare(i, j, TypePosition.ALLOWED));
            }
            map.push(array);
        }
        return map;
    }

    this.loadLabyrinth = function (lab) {
        pause();
        blockList = {};
        for (var i = 0; i < lab.map.length; i++) {
            for (var j = 0; j < lab.map[0].length; j++) {
                var square = lab.map[i][j];
                if (square.type == TypePosition.BLOCKED) {
                    blockList[square.generateIdentifier()] = square;
                }
            }
        }
        if (lab.start != null) {
            player = new Player(lab.start);
        }

        if (lab.goal != null) {
            goal = new Goal(lab.goal);
        }
        play();
    };

    this.showGrade = function(isShow) {
        isShowGrade = isShow;
    };

    var requestAnimFrame = (function () {
        return window.requestAnimationFrame ||
            window.webkitRequestAnimationFrame ||
            window.mozRequestAnimationFrame ||
            window.oRequestAnimationFrame ||
            window.msRequestAnimationFrame ||
            function (callback) {
                window.setTimeout(callback, 1000 / 30);
            };
    })();

    var lastTime;

    function main() {
        if (!isPaused) {
            var now = Date.now();
            var dt = (now - lastTime) / 1000.0;

            update(dt);
            render();

            lastTime = now;
            requestAnimFrame(main);
        }
    };

    function iniciar() {
        texture = ctx.createPattern(resources.get('assets/textura.png'), 'repeat');
        lastTime = Date.now();
        main();
    }

    function update(dt) {
        gameTime += dt;
        if (player != null) {
            player.sprite.update(dt);
        }

        if (goal != null) {
            goal.sprite.update(dt);
        }
    }

    function render() {
        isRendering = true;
        ctx.fillStyle = texture;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        if (isShowGrade) {
            grid.draw(ctx);
        }

        if (goal != null) {
            ctx.save();
            ctx.translate(goal.translate[0], goal.translate[1]);
            goal.sprite.render(ctx);
            ctx.restore();
        }

        if (player != null) {
            var blockListDown = renderMapUp();
            ctx.save();
            ctx.translate(player.translate[0], player.translate[1]);
            player.sprite.render(ctx);
            ctx.restore();
            renderMapDown(blockListDown);
        } else {
            renderMap();
        }

        renderOptionSelected();

        isRendering = false;
    }

    function renderMapUp() {
        var blockListCopy = jQuery.extend(true, {}, blockList);
        $.each(blockList, function(key, value) {
            if (player.pos[1] > value.center[1]) {
                ctx.save();
                ctx.translate(value.translate[0], value.translate[1]);
                value.sprite.render(ctx);
                ctx.restore();
                delete blockListCopy[key];
            }
        });
        return blockListCopy;
    }

    function renderMapDown(blockListDown) {
        $.each(blockListDown, function(key, value) {
            ctx.save();
            ctx.translate(value.translate[0], value.translate[1]);
            value.sprite.render(ctx);
            ctx.restore();
        });
    }

    function renderMap() {
        $.each(blockList, function (key, value) {
            ctx.save();
            ctx.translate(value.translate[0], value.translate[1]);
            value.sprite.render(ctx);
            ctx.restore();
        });
    }

    function renderOptionSelected() {
        if (elementHover != null) {
            var indexSquareHover = findIndexSquareMouseHover();
            var square = new PositionSquare(indexSquareHover.row, indexSquareHover.col);
            elementHover.updateSquare(square);
            ctx.save();
            ctx.globalAlpha = 0.5;
            ctx.translate(elementHover.translate[0], elementHover.translate[1]);
            elementHover.sprite.render(ctx);
            ctx.restore();
        }
    }

    function cancelMoving() {
        if (isMovingObject) {
            if (elementHover instanceof Player) {
                player = elementHover;
            } else if (elementHover instanceof Goal) {
                goal = elementHover;
            } else if (elementHover instanceof PositionSquare) {
                blockList[elementHover.generateIdentifier()] = elementHover;
            }
            isMovingObject = false;
        }
        elementHover = null;
    }

    function getMousePos(canvas, evt) {
        var rect = canvas.getBoundingClientRect();
        return {
            x: evt.clientX - rect.left,
            y: evt.clientY - rect.top
        };
    }

    $(canvas).on('click', function(e) {
        var indexSquareHover = findIndexSquareMouseHover();
        var square = new PositionSquare(indexSquareHover.row, indexSquareHover.col);
        if (!existsElementOn(indexSquareHover.row, indexSquareHover.col)) {
            if (actualOptionSelected == OPTION_SELECTED.START_POSITION) {
                player = new Player(square);
                elementHover = null;
                $(builder).trigger("finishSelection");
                actualOptionSelected = OPTION_SELECTED.NONE;
            } else if(actualOptionSelected == OPTION_SELECTED.GOAL) {
                goal = new Goal(square);
                elementHover = null;
                $(builder).trigger("finishSelection");
                actualOptionSelected = OPTION_SELECTED.NONE;
            } else if(actualOptionSelected == OPTION_SELECTED.BLOCK) {
                square.type = TypePosition.BLOCKED;
                blockList[square.generateIdentifier()] = square;
            } else if (actualOptionSelected == OPTION_SELECTED.NONE && isMovingObject) {
                //@TODO Aperfeicoar usando o cancelMove
                if (elementHover instanceof Player) {
                    player = new Player(square);
                } else if (elementHover instanceof Goal) {
                    goal = new Goal(square);
                } else if (elementHover instanceof PositionSquare) {
                    blockList[elementHover.generateIdentifier()] = elementHover;
                }
                isMovingObject = false;
                elementHover = null;
            }

        } else if (actualOptionSelected == OPTION_SELECTED.ERASE) {
            findAndRemoveElementClicked(indexSquareHover.row, indexSquareHover.col);
        } else if (actualOptionSelected == OPTION_SELECTED.NONE) {
            elementHover = findAndRemoveElementClicked(indexSquareHover.row, indexSquareHover.col);
            if (elementHover != null) {
                isMovingObject = true;
            }
        }


    });

    function findIndexSquareMouseHover() {
        var i = Math.floor(mousePosition.y / DimensionSquare);
        var j = Math.floor(mousePosition.x / DimensionSquare);
        return {
            row :  i,
            col : j
        };
    }

    function existsElementOn(row, col) {
        var exists = false;
        var playerIndex = [], goalIndex = [];
        if (player != null) {
            playerIndex = player.square.index;
        }
        if (goal != null) {
            goalIndex = goal.square.index;
        }
        if ((row == playerIndex[0] && col == playerIndex[1])
            || (row == goalIndex[0] && col == goalIndex[1])) {
            exists = true;
        } else {
            $.each(blockList, function(key, value) {
                if (value.index[0] == row && value.index[1] == col) {
                    exists = true;
                    return false;
                }
            });
        }
        return exists;
    }

    function findAndRemoveElementClicked(row, col) {
        var playerIndex = [], goalIndex = [];
        if (player != null) {
            playerIndex = player.square.index;
        }
        if (goal != null) {
            goalIndex = goal.square.index;
        }
        var element = null;
        if (row == playerIndex[0] && col == playerIndex[1]) {
            element = player;
            player = null;
        } else if (row == goalIndex[0] && col == goalIndex[1]) {
            element = goal;
            goal = null;
        } else {
            $.each(blockList, function(key, value) {
               if (value.index[0] == row && value.index[1] == col) {
                   element = value;
                   delete blockList[key];
                   return false;
               }
            });
        }
        return element;
    }

    //@TODO essa classe nao precisa se preocupar em preencher essas informacoes, deixe para o app.js
    function generateLabyrinthSettings() {
        return {
            rowCount : Number($("#linhas").val()),
            colCount : Number($("#colunas").val()),
            horCost : Number($("#pesoHorizontal").val()),
            verCost : Number($("#pesoVertical").val()),
            diaCost : Number($("#pesoDiagonal").val())
        }
    }

    $(canvas).on('mousemove', function(e) {
        mousePosition = getMousePos(canvas, e);
    });

    this.loadLabyrinth(lab);

};

