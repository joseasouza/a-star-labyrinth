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
var Game = function(labyrinth, aStar) {
    var canvas = document.getElementById("canvas");
    var ctx = canvas.getContext("2d");
    var gameTime = 0;
    var playerSpeed = 130;
    var texture;

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
            gameMove = new GameMove(newSquare.center);
        }
        movePlayer(dt);
    }

    function checkIfPlayerIsOnSquare() {
        if (player.localPosition[0] > gameMove.squareTo.center[0] - DimensionSquare/10
            && player.localPosition[0] < gameMove.squareTo.center[0] + DimensionSquare/10
            && player.localPosition[1] > gameMove.squareTo.center[1] - DimensionSquare/10
            && player.localPosition[1] < gameMove.squareTo.center[1] + DimensionSquare/10) {
            return true;
        } else {
            return false;
        }
    }

    function movePlayer(dt) {
        var x = player.pos[0];
        var y = player.pos[1];

        if (player.localPosition[0] < gameMove.squareTo.center[0]) {
            x += dt*playerSpeed;
        } else {
            x -= dt*playerSpeed;
        }

        if (player.localPosition[1] < gameMove.squareTo.center[1]) {
            y += dt*playerSpeed;
        } else {
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


       renderMap();

        ctx.save();
        ctx.translate(player.pos[0] - player.sprite.size[0]/2, player.pos[1] - player.sprite.size[1] + 8);
        player.sprite.render(ctx);
        ctx.restore();

        ctx.save();
        ctx.translate(goal.pos[0] - goal.sprite.size[0]/2, goal.pos[1] - goal.sprite.size[1]/2);
        goal.sprite.render(ctx);
        ctx.restore();
    }

    function renderMap() {
        var map = labyrinth.map;
        var square;
        for (var i = 0; i < map.length; i++) {
            for (var j = 0; j < map[0].length; j++) {
                square = map[i][j];
                if (square.type == TypePosition.BLOCKED) {
                    ctx.save();
                    ctx.translate(square.center[0] - (square.pos[0] + 20), square.center[1] - (square.pos[1] + 20));
                    ctx.drawImage(resources.get(square.imgUrl), square.pos[0], square.pos[1], 40, 40);
                    ctx.restore();
                }
            }
        }
    }

    var GameMove = function(squareTo) {
        this.squareTo = squareTo;
    };


    resources.load([
        'assets/textura.png',
        'assets/Shrub.gif',
        "assets/personagem.gif",
        "assets/left.png",
        "assets/right.png",
        "assets/baixo.png",
        "assets/cima.png",
        "assets/portal.png",
        "assets/Shrub.gif",
        "assets/comemorar.png"
    ]);
    resources.onReady(iniciar);

};

