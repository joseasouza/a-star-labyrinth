/*
 * Copyright (c) 2016 - José Victor Alves de Souza - https://github.com/dudevictor/
 */
/**
 * This script defines the App function and all logic to control and build the labyrinth.
 * Also it control and calls gameplay and A* algorithm functions.
 * @constructor it initializes the App
 */
var App = function() {

    var canvas = document.getElementById("canvas");
    var minCanvasWidth = 25 * DimensionSquare;
    var minCanvasHeight = 11 * DimensionSquare;
    var grid;
    var game;
    var aStar;
    var labBuilder;
    var isBuildingLab;

    function iniciar(oldLabyrinth) {
        isBuildingLab = true;
        if (oldLabyrinth == null) {
            var newLab =  emptyLabyrinth();
            setCanvasSize(newLab.rowCount, newLab.colCount);
            labBuilder = new LabyrinthBuilder(grid, newLab);
        } else {
            labBuilder = new LabyrinthBuilder(grid, oldLabyrinth);
        }

        $(labBuilder).on("finishSelection", function() {
            deactivateAllControls();
            //@TODO Refatorar e organizar
        });
    }

    function emptyLabyrinth() {
        var linhas = Number($("#linhas").val());
        var colunas = Number($("#colunas").val());
        var horCost = Number($("#pesoHorizontal").val());
        var verCost = Number($("#pesoVertical").val());
        var diaCost = Number($("#pesoDiagonal").val());

        var map = [];
        for (var i = 0; i < linhas; i++) {
            var array = [];
            for (var j = 0; j < colunas; j++) {
                array.push(new PositionSquare(i, j, TypePosition.ALLOWED));
            }
            map.push(array);
        }
        //@TODO Colocar Peso diagonal
        return new Labyrinth(linhas, colunas, horCost, verCost, map, null, null);
    }

    $('#fileUpload').change(function(e) {
        if (game != null) {
            gameStop();
        }
        var file = this.files[0];
        var textType = /text.*/;

        if (file.type.match(textType)) {
            var reader = new FileReader();
            reader.onload = function(e) {
                $("#fileUpload").val("");
                $("li.dropdown.profile").removeClass("open");
                var lab = labyrinthFromFile(reader.result);
                setCanvasSize(lab.rowCount, lab.colCount);
                updateSettingsLabyrinthOnView(lab);
                labBuilder.loadLabyrinth(lab);

            };
            reader.readAsText(file);
        }

    });

    function setCanvasSize(rowCount, colCount) {
        var canvas = document.getElementById("canvas");
        var canvasWidth = colCount * DimensionSquare ;
        var canvasHeight = rowCount * DimensionSquare;

        if (minCanvasWidth > canvasWidth) canvasWidth = minCanvasWidth;
        if (minCanvasHeight > canvasHeight) canvasHeight = minCanvasHeight;

        canvas.width = canvasWidth;
        canvas.height = canvasHeight;
        $(".card-body").slimScroll({
            height: '101%',
            axis: 'both'
        });
    }

    $("#play").on("click", function () {
        labBuilder.stop();
        deactivateAllControls();
        var costs = {};
        costs[TypeMovement.VERTICAL] = Number($("#pesoVertical").val());
        costs[TypeMovement.HORIZONTAL] = Number($("#pesoHorizontal").val());
        costs[TypeMovement.DIAGONAL] = Number($("#pesoDiagonal").val());
        var lab = labBuilder.buildLabyrinth();
        var configs = {
            start: lab.start,
            goal: lab.goal,
            map: lab.map,
            costs: costs
        };

        aStar = new AStarAlgorithm(configs);
        game = new Game(lab, aStar, "arquivo");

        $("#control-labyrinth").removeClass("slideInUp").addClass("slideOutDown");
        setTimeout(function () {
            $("div.div-absolute-control-labyrinth").css("z-index", -1)
        }, 500);
        $("#control-game").toggleClass("slideOutUp").toggleClass("slideInDown").removeClass("hide");
    });

    $("#continue").on("click", function () {
        $(this).find("i").toggleClass("fa-play").toggleClass("fa-pause");
        if ($(this).find("i").hasClass("fa-play")) {
            game.pause();
        } else {
            game.proceed();
        }
    });

    function gameStop() {
        game.stop();
        game = null;
    }

    $("#controlStartPosition").on("click", function(){
        if ($(this).hasClass("active")) {
            deactivateAllControls();
            labBuilder.noControlSelected();
        } else {
            deactivateAllControls();
            $(this).addClass("active");
            labBuilder.startPositionSelected();
        }

    });

    $("#controlGoalPosition").on("click", function(){
        if ($(this).hasClass("active")) {
            deactivateAllControls();
            labBuilder.noControlSelected();
        } else {
            deactivateAllControls();
            $(this).addClass("active");
            labBuilder.goalPositionSelected();
        }

    });

    $("#controlBlock").on("click", function() {
        if ($(this).hasClass("active")) {
            deactivateAllControls();
            labBuilder.noControlSelected();
        } else {
            deactivateAllControls();
            $(this).addClass("active");
            labBuilder.controlBlockSelected();
        }
    });

    $("#controlErase").on("click", function() {
        if ($(this).hasClass("active")) {
            deactivateAllControls();
            labBuilder.noControlSelected();
        } else {
            deactivateAllControls();
            $(this).addClass("active");
            labBuilder.controlEraseSelected();
        }
    });

    $("#stop").on("click", function() {
        gameStop();
        $("#continue i").removeClass("fa-play").addClass("fa-pause");
        iniciar(labBuilder.buildLabyrinth());
        $("#control-labyrinth").removeClass("slideOutDown").addClass("slideInUp");
        $("div.div-absolute-control-labyrinth").css("z-index", 0);
        $("#control-game").toggleClass("slideOutUp").toggleClass("slideInDown");
    });

    $("#chkAbertos").on("change", function() {
        if (game != null) {
            game.showOpen($("#chkAbertos").prop("checked"));
        }
    });

    $("#chkFechados").on("change", function() {
        if (game != null) {
            game.showClosed($("#chkFechados").prop("checked"));
        }
    });

    $("#chkGrade").on("change", function() {
        if (game != null) {
            game.showGrade($("#chkGrade").prop("checked"));
        }
    });

    function updateSettingsLabyrinthOnView(lab) {
        $("#linhas").val(lab.rowCount);
        $("#colunas").val(lab.colCount);
        $("#pesoHorizontal").val(lab.horCost);
        $("#pesoVertical").val(lab.verCost);
        $("#pesoDiagonal").val(lab.diaCost);
    }

    function deactivateAllControls() {
        $("div.control-labyrinth a.active").removeClass("active");
    }

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
            if (row.length != colCount) continue;
            $.each(row, function(iCol, value) {
                var tipo = TypePosition.array[Number(value)];
                var square = new PositionSquare(iRow, iCol, tipo);
                rowMap.push(square);

                if (tipo == TypePosition.START) {
                    start = square;
                }
                if (tipo == TypePosition.GOAL) {
                    goal = square;
                }

            });
            map.push(rowMap);
        }

        start.updateSprite(PositionSquareSprites.START);
        return new Labyrinth(rowCount, colCount, horCost, verCost, map, start, goal);
    }

    var opts = {
        distance: 50,
        lineWidth: 0.2,
        gridColor: "#000000",
        caption: false,
        horizontalLines: true,
        verticalLines: true
    };

    grid = new Grid(opts);

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
        "assets/start.gif",
        "assets/erase.png"
    ]);
    resources.onReady(iniciar);

};

