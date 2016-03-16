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
    var minCanvasWidth = 1240;
    var minCanvasHeight =  535;
    var game;
    var aStar;
    var labBuilder;
    var isBuildingLab;

    function iniciar(oldLabyrinth) {
        isBuildingLab = true;
        if (oldLabyrinth == null) {
            var newLab =  emptyLabyrinth();
            setCanvasSize(newLab.rowCount, newLab.colCount);
            labBuilder = new LabyrinthBuilder(newLab);
        } else {
            labBuilder = new LabyrinthBuilder(oldLabyrinth);
        }

        $(labBuilder).on("finishSelection", function() {
            deactivateControls();
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
        return new Labyrinth(linhas, colunas, horCost, verCost, diaCost, map, null, null);
    }

    $('#fileUpload').change(function(e) {
        if (game != null) {
            $("#stop").trigger("click");
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
        var canvasWidth = colCount * DimensionSquare + Padding.right + Padding.left ;
        var canvasHeight = rowCount * DimensionSquare + Padding.top + Padding.bottom;

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
        if(!labBuilder.isLabyrinthOk()) {
            $("#modal-erro div[name='modal-message']").html("Você ainda não montou o labirinto corretamente! Verifique" +
                " se você marcou as posições iniciais e finais!");
            $("#modal-erro").modal('show');
            return false;
        }

        labBuilder.stop();
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
        deactivateControls();
       disableLabyrinthBuildButtons();
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
            deactivateControls();
            labBuilder.noControlSelected();
        } else {
            deactivateControls();
            $(this).addClass("active");
            labBuilder.startPositionSelected();
        }

    });

    $("#controlGoalPosition").on("click", function(){
        if ($(this).hasClass("active")) {
            deactivateControls();
            labBuilder.noControlSelected();
        } else {
            deactivateControls();
            $(this).addClass("active");
            labBuilder.goalPositionSelected();
        }

    });

    $("#controlBlock").on("click", function() {
        if ($(this).hasClass("active")) {
            deactivateControls();
            labBuilder.noControlSelected();
        } else {
            deactivateControls();
            $(this).addClass("active");
            labBuilder.controlBlockSelected();
        }
    });

    $("#controlErase").on("click", function() {
        if ($(this).hasClass("active")) {
            deactivateControls();
            labBuilder.noControlSelected();
        } else {
            deactivateControls();
            $(this).addClass("active");
            labBuilder.controlEraseSelected();
        }
    });

    $("#stop").on("click", function() {
        gameStop();
        iniciar(labBuilder.buildLabyrinth());
        enableControls();
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

    $("#linhas, #colunas").on("change", function() {
       //@TODO Refatorar nao utilizar game == null e sim verificar se o labirinto builder nao esta parado
        if (game == null) {
            var row = Number($("#linhas").val());
            var col = Number($("#colunas").val());
           labBuilder.updateRowColCount( row,  col, true);
            setCanvasSize(row, col);
       }
    });

    function updateSettingsLabyrinthOnView(lab) {
        $("#linhas").val(lab.rowCount);
        $("#colunas").val(lab.colCount);
        $("#pesoHorizontal").val(lab.horCost);
        $("#pesoVertical").val(lab.verCost);
        $("#pesoDiagonal").val(lab.diaCost);
    }

    function deactivateControls() {
        $("div.control-labyrinth a.active").removeClass("active");
    }

    function disableLabyrinthBuildButtons() {
        $("#control-labyrinth").removeClass("slideInUp").addClass("slideOutDown");
        setTimeout(function () {
            $("div.div-absolute-control-labyrinth").css("z-index", -1)
        }, 500);
        $("#control-game").toggleClass("slideOutUp").toggleClass("slideInDown").removeClass("hide");
        $("#linhas, #colunas, #pesoHorizontal, #pesoVertical, #pesoDiagonal").prop("disabled", true);
    }

    function enableControls() {
        $("#linhas, #colunas, #pesoHorizontal, #pesoVertical, #pesoDiagonal").prop("disabled", false);
        $("#continue i").removeClass("fa-play").addClass("fa-pause");
        $("#control-labyrinth").removeClass("slideOutDown").addClass("slideInUp");
        $("div.div-absolute-control-labyrinth").css("z-index", 0);
        $("#control-game").toggleClass("slideOutUp").toggleClass("slideInDown");

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

        var row, iRow, rowMap;
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
        return new Labyrinth(rowCount, colCount, horCost, verCost, null, map, start, goal);
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
        "assets/start.gif",
        "assets/erase.png"
    ]);
    resources.onReady(iniciar);

};

