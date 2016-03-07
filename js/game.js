/*
 * The MIT License (MIT)
 * Copyright© fev/2016 - José Victor Alves de Souza - https://github.com/dudevictor
 *
 * Permission is hereby granted, free of charge, to any playeron obtaining a copy of this
 * software and associated documentation files (the "Software"), to deal in the Software
 * without restriction, including without limitation the rights to use, copy, modify, merge,
 *  publish, distribute, sublicense, and/or sell copies of the Software, and to permit playerons to
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
 * This script defines the game function and all logic to render and control the canvas element
 * @param labyrinth a instance of {@link Labyrinth}
 * @constructor it initializes the Game
 */
var Game = function(labyrinth, aStar, nameFile) {

    var canvas = document.getElementById("canvas");
    var ctx = canvas.getContext("2d");
    var gameTime = 0;
    var playerSpeed = 150;
    var texture;
    var way = aStar.way().slice();
    var openned = aStar.openned().slice();
    var closed = aStar.closed().slice();
    var blockList = {};
    for (var i = 0; i < labyrinth.map.length; i++) {
        for (var j = 0; j < labyrinth.map[0].length; j++) {
            var square = labyrinth.map[i][j];
            if (square.type == TypePosition.BLOCKED) {
                blockList[square.generateIdentifier()] = square;
            }
        }
    }
    var start = labyrinth.start;

    var GameMove = function(squareTo) {
        this.squareTo = squareTo;
    };

    this.stop = function() {
        main = function() {};
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
        var now = Date.now();
        var dt = (now - lastTime) / 1000.0;

        update(dt);
        render();

        lastTime = now;

        requestAnimFrame(main);
    };

    function iniciar() {
        texture = ctx.createPattern(resources.get('assets/textura.png'), 'repeat');
        lastTime = Date.now();
        main();
    }

    var player = new Player(labyrinth.start);
    var goal = new Goal(labyrinth.goal);

    var gameMove = new GameMove(labyrinth.start);
    function update(dt) {
        gameTime += dt;
        updatePlayer(dt);
        player.sprite.update(dt);
        goal.sprite.update(dt);
    }

    function updatePlayer(dt) {
        if (checkIfPlayerIsOnSquare()) {
            player.actualSquare = gameMove.squareTo;
            var newSquare = aStar.next();
            if (newSquare != null) {
                gameMove = new GameMove(newSquare);
            } else {
                endGame();
            }
        }
        movePlayer(dt);
    }

    function checkIfPlayerIsOnSquare() {
        var x = Math.pow(player.pos[0] - gameMove.squareTo.center[0], 2);
        var y = Math.pow(player.pos[1] - gameMove.squareTo.center[1], 2);
        var result = Math.sqrt(x + y);
        if (result == 0) {
            return true;
        } else {
            return false;
        }

    }

    function movePlayer(dt) {
        var x = player.pos[0];
        var y = player.pos[1];

        if (Math.abs(x - gameMove.squareTo.center[0]) <= 2) {
            x = gameMove.squareTo.center[0];
        } else if (x < gameMove.squareTo.center[0]) {
            x += dt*playerSpeed;
        } else if (x > gameMove.squareTo.center[0]) {
            x -= dt*playerSpeed;
        }

        if (Math.abs(y - gameMove.squareTo.center[1]) <= 2) {
            y = gameMove.squareTo.center[1];
        } else if (y < gameMove.squareTo.center[1]) {
            y += dt*playerSpeed;
        } else if (y > gameMove.squareTo.center[1]) {
            y -= dt*playerSpeed;
        }

        player.updatePosition([x, y]);

    }

    var opts = {
        distance: 50,
        lineWidth: 0.2,
        gridColor: "#000000",
        caption: false,
        horizontalLines: true,
        verticalLines: true
    };

    var grid = new Grid(opts);

    function render() {
        ctx.fillStyle = texture;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        grid.draw(ctx);
        renderOpenNClosed();
        renderWay();
        renderStartNGoal();



        var blockListDown = renderMapUp();
        ctx.save();
        ctx.translate(player.translate[0], player.translate[1]);
        player.sprite.render(ctx);
        ctx.restore();

        renderMapDown(blockListDown);
        //renderRefersPoint();

    }

    function renderOpenNClosed() {
        $.each(closed, function(key, square) {
            ctx.save();
            ctx.fillStyle = "rgba(192, 72, 72, 0.2)";
            ctx.fillRect(square.pos[0], square.pos[1], DimensionSquare, DimensionSquare);
            ctx.restore();
        });

        $.each(openned, function(key, square) {
            ctx.save();
            ctx.fillStyle = "rgba(60, 162, 162, 0.2)";
            ctx.fillRect(square.pos[0], square.pos[1], DimensionSquare, DimensionSquare);
            ctx.restore();
        });
    }

    function renderStartNGoal() {
        ctx.save();
        ctx.translate(goal.translate[0], goal.translate[1]);
        goal.sprite.render(ctx);
        ctx.restore();

        var startImg = resources.get(start.imgUrl);
        var translate = [start.translate[0] + Math.abs(DimensionStart.width/2 - DimensionSquare/2),
            start.translate[1] + Math.abs(DimensionStart.height/2 - DimensionSquare/2)];
        ctx.save();
        ctx.translate(translate[0], translate[1]);
        ctx.drawImage(startImg, 0, 0, DimensionStart.width, DimensionStart.height);
        ctx.restore();
    }

    function renderWay() {
        var footPrintImg = resources.get("assets/footprints.gif");

        $.each(way, function(index, square) {
            if (!square.equals(start) && !square.equals(goal.square)) {
                ctx.save();
                var translate = square.translate;
                translate = [translate[0] + Math.abs(DimensionFootPrint / 2 - DimensionSquare / 2),
                    translate[1] + Math.abs(DimensionFootPrint / 2 - DimensionSquare / 2)];
                ctx.translate(translate[0], translate[1]);
                ctx.drawImage(footPrintImg, 0, 0, DimensionFootPrint, DimensionFootPrint);
                ctx.restore();
            }
        });
    }

    function renderRefersPoint() {
        ctx.save();
        ctx.translate(player.translate[0], player.translate[1]);
        ctx.fillStyle = "rgb(0, 0, 0)";
        ctx.fillRect(0,0,10,10);
        ctx.restore();

        ctx.save();
        ctx.translate(gameMove.squareTo.center[0] - 5, gameMove.squareTo.center[1] - 5);
        ctx.fillStyle = "rgb(128, 128, 128)";
        ctx.fillRect(0,0,10,10);
        ctx.restore();

        ctx.save();
        ctx.translate(player.pos[0] - 5, player.pos[1] - 5);
        ctx.fillStyle = "rgb(255, 0, 0)";
        ctx.fillRect(0,0,10,10);
        ctx.restore();

        ctx.save();
        ctx.fillStyle = "white";
        ctx.font = "14px Cultive Mono";
        ctx.fillText(nameFile, canvas.width - ctx.measureText(nameFile).width - 3, canvas.height - 24);
        ctx.restore();
    }

    function renderMapUp() {
        var blockListCopy = jQuery.extend(true, {}, blockList);
        $.each(blockList, function(key, value) {
            if (player.pos[1] > value.center[1]) {
                ctx.save();
                ctx.translate(value.translate[0], value.translate[1]);
                ctx.drawImage(resources.get(value.imgUrl), 0, 0, DimensionBarrier, DimensionBarrier);
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
            ctx.drawImage(resources.get(value.imgUrl), 0, 0, DimensionBarrier, DimensionBarrier);
            ctx.restore();
        });
    }

    function endGame() {
        if (player.actualSquare.equals(goal.square)) {
            player.updateSprite(PlayerSprites.VICTORY);
        } else {
            player.updateSprite(PlayerSprites.LOSE);
        }
        movePlayer = function(){};
        updatePlayer = function(){};
    }

    resources.load([
        'assets/textura.png',
        "assets/personagem.gif",
        "assets/left.png",
        "assets/right.png",
        "assets/baixo.png",
        "assets/cima.png",
        "assets/portal.png",
        "assets/Shrub48.gif",
        "assets/comemorar.png",
        "assets/dead.gif",
        "assets/footprints.gif",
        "assets/start.gif"
    ]);
    resources.onReady(iniciar);

};

