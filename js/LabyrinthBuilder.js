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
    var labyrinth = lab;
    var isRendering = false;
    var blockList = {};
    var start;
    var player;
    var goal;

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

    this.getLabyrinth = function() {
        return labyrinth;
    };

    this.loadLabyrinth = function (lab) {
        pause();
        labyrinth = lab;
        for (var i = 0; i < labyrinth.map.length; i++) {
            for (var j = 0; j < labyrinth.map[0].length; j++) {
                var square = labyrinth.map[i][j];
                if (square.type == TypePosition.BLOCKED) {
                    blockList[square.generateIdentifier()] = square;
                }
            }
        }
        start = labyrinth.start;
        if (labyrinth.start != null) {
            player = new Player(labyrinth.start);
            player.updateSprite(PlayerSprites.VICTORY);
        }

        if (labyrinth.goal != null) {
            goal = new Goal(labyrinth.goal);
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

        isRendering = false;
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

    function renderMap() {
        $.each(blockList, function (key, value) {
            ctx.save();
            ctx.translate(value.translate[0], value.translate[1]);
            ctx.drawImage(resources.get(value.imgUrl), 0, 0, DimensionBarrier, DimensionBarrier);
            ctx.restore();
        });
    }

    this.loadLabyrinth(lab);

};

