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
