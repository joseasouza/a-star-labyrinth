/**
 * Created by victor on 23/02/16.
 */
$(document).ready(function() {

    var canvas = document.getElementById("canvas");
    var ctx = canvas.getContext("2d");
    var textura;

    var requestAnimFrame = (function(){
        return window.requestAnimationFrame       ||
            window.webkitRequestAnimationFrame ||
            window.mozRequestAnimationFrame    ||
            window.oRequestAnimationFrame      ||
            window.msRequestAnimationFrame     ||
            function(callback){
                window.setTimeout(callback, 1000 / 60);
            };
    })();

    var lastTime;
    function main() {
        var now = Date.now();
        var dt = (now - lastTime) / 1000.0;

        atualizar(dt);
        renderizar();

        lastTime = now;
        requestAnimFrame(main);
    };

    function iniciar() {
        textura = ctx.createPattern(resources.get('assets/textura.png'), 'repeat');
        lastTime = Date.now();
        main();
    }

    var pers = {
        pos: [50, 63],
        sprite: new Sprite('assets/right.png', [0, 0], [56, 68], 9, [0, 1, 2, 3, 4, 5])
    };

    var goal = {
        pos: [1160, 455],
        sprite: new Sprite('assets/portal.png', [0, 0], [30, 31], 10, [0, 1, 2])
    }

    var gameTime = 0;
    var playerSpeed = 130;

    function atualizar(dt) {
        gameTime += dt;

        pers.sprite.update(dt);
        goal.sprite.update(dt);
    }

    var opts = {
        distance : 50,
        lineWidth : 0.2,
        gridColor : "#000000",
        caption : false,
        horizontalLines : true,
        verticalLines : true
    };

    var grid = new Grid(opts);
    function renderizar() {
        ctx.fillStyle = textura;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        grid.draw(ctx);


        ctx.save();
        ctx.drawImage(resources.get("assets/Shrub.gif"), 55, 50, 40, 40);
        ctx.restore();

        ctx.save();
        ctx.drawImage(resources.get("assets/Shrub.gif"), 105, 100, 40, 40);
        ctx.restore();

        ctx.save();
        ctx.translate(pers.pos[0], pers.pos[1]);
        pers.sprite.render(ctx);
        ctx.restore();

        ctx.save();
        ctx.translate(goal.pos[0], goal.pos[1]);
        goal.sprite.render(ctx);
        ctx.restore();
    }

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
        "assets/sprites.png",
    ]);
    resources.onReady(iniciar);


});

