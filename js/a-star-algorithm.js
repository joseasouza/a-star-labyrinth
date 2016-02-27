/*
 * The MIT License (MIT)
 * Copyright© fev/2016 - José Victor Alves de Souza - https://github.com/dudevictor
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this
 * software and associated documentation files (the "Software"), to deal in the Software
 * without restriction, including without limitation the rights to use, copy, modify, merge,
 *  publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to
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

var AStarAlgorithm = function(config) {

    var open =  new PriorityQueue({ comparator: function(a, b) { return b.cost - a.cost; }});
    var cameFrom = {};


    var start = config.start;
    var goal = config.goal;
    var map = config.map;
    var costs = config.costs;

    var nextRequest = start;

    this.next = function() {
        var next = null;
        $.each(cameFrom, function(key, value) {
           if (value.equals(nextRequest))  {
               next = key;
           }
        });
        nextRequest = next;
        return next;
    };

    function algorithm() {
        var initialMove = new Move(start, null, 0);
        var cost_so_far = {};

        open.queue(initialMove);
        cost_so_far[start] = 0;
        cameFrom[start] = null;

        while(open.length > 0) {
            var current = open.dequeue();

            if (current.square.equals(goal)) {
                break;
            }

            $.each(findNeighbors(current.square), function(index, next) {
                var newCost = current.cost + findCost(current.square, next);
                if (cost_so_far[next] == null || newCost < cost_so_far[next]) {
                    cost_so_far[next] = newCost + calculateDistanceToGoal(next);
                    open.queue(new Move(next, cost_so_far[next]));
                    cameFrom[next] = current.square;
                }
            });

        }

        return cameFrom;

    }

    function calculateDistanceToGoal(square) {
        var x = Math.pow(square.index[0] - goal.index[0], 2);
        var y = Math.pow(square.index[1] - goal.index[1], 2);
        return Math.sqrt(x + y);
    }

    function findCost(squareFrom, squareTo) {
        return costs[TypeMovement.identifyDirection(squareFrom, squareTo)];
    }


    function findNeighbors(square) {
        var neighbors = [];
        for (var i = square.index[0] - 1; i <= square.index[0] + 1; i++) {
            if (i >= 0 && i < map[0].length) {
                for (var j = square.index[1] - 1; j <= square.index[1] + 1; j++) {
                    if (j >= 0 && j < map.length
                        && square.type != TypePosition.BLOCKED
                        && !square.equals(map[i][j])) {
                        neighbors.push(map[i][j]);
                    }
                }
            }
        }
        return neighbors;

    }

    var Move = function(square, cost) {
        this.square = square;
        this.cost = cost;
    };

    cameFrom = algorithm();

};