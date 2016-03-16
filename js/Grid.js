/*
 * Copyright (c) 2016 - José Victor Alves de Souza - https://github.com/dudevictor/
 */

/**
 * It draws a grid on canvas element
 * @author victor
 */

var Grid = function(canvas, ctx, rowCount, colCount) {

    this.rows = rowCount;
    this.cols = colCount;
    this.lineWidth = 0.2;

    this.drawingPosition = {
        x : Padding.left,
        y: Padding.top
    }

    this.updateGridSize = function(rowCount, colCount) {
        this.rows = rowCount;
        this.cols = colCount;
    };

    this.drawGrid = function() {
        ctx.lineWidth = "0.3";
        ctx.strokeStyle = "black";
        for(var i = 0; i <= this.cols; i++) {
            ctx.beginPath();
            ctx.moveTo(0.5 + this.drawingPosition.x + i*DimensionSquare,
                this.drawingPosition.y);
            ctx.lineTo(0.5 + this.drawingPosition.x + i*DimensionSquare,
                this.drawingPosition.y + this.rows*DimensionSquare)
            ctx.closePath();
            ctx.stroke();

        }

        for(var i = 0; i <= this.rows; i++) {
            ctx.beginPath();
            ctx.moveTo(this.drawingPosition.x,
                0.5 + this.drawingPosition.y + i*DimensionSquare);
            ctx.lineTo(this.drawingPosition.x + this.cols*DimensionSquare,
                0.5 + this.drawingPosition.y + i*DimensionSquare);
            ctx.closePath();
            ctx.stroke();
        }



    };

};
