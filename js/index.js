/**
 * Created by victor on 23/02/16.
 */
$(document).ready(function() {
    var canvas = document.getElementById("canvas");
    var context = canvas.getContext("2d");
    var opts = {
        distance : 50,
        lineWidth : 0.08,
        gridColor : "#000000",
        caption : false,
        horizontalLines : true,
        verticalLines : true
    };
    new Grid(opts).draw(context);



});

