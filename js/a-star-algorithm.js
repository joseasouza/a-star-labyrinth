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

    var open =  new PriorityQueue({ comparator: function(a, b) {
        return a.priority - b.priority; }
    });
    var cameFrom = [];


    var start = config.start;
    var goal = config.goal;
    var map = config.map;
    var costs = config.costs;


    this.next = function() {
       return cameFrom.pop();
    };

    function algorithm() {
        var initialMove = new Move(start, 0);
        var cost_so_far = {};

        open.queue(initialMove);
        cost_so_far[start.generateIdentifier()] = 0;

        while(open.length > 0) {
            var current = open.dequeue();

            if (current.square.equals(goal)) {
                break;
            }

            $.each(findNeighbors(current.square), function(index, next) {
                var newCost = cost_so_far[current.square.generateIdentifier()] + findCost(current.square, next);
                if (cost_so_far[next.generateIdentifier()] == null || newCost < cost_so_far[next.generateIdentifier()]) {
                    cost_so_far[next.generateIdentifier()] = newCost;

                    open.queue(new Move(next, newCost + calculateDistanceToGoal(next)));
                    cameFrom.push(current.square);
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
            if (i >= 0 && i < map.length) {
                for (var j = square.index[1] - 1; j <= square.index[1] + 1; j++) {
                    if (j >= 0 && j < map[0].length
                        && map[i][j].type != TypePosition.BLOCKED
                        && !square.equals(map[i][j])) {
                        neighbors.push(map[i][j]);
                    }
                }
            }
        }
        return neighbors;

    }

    var Move = function(square, priority) {
        this.square = square;
        this.priority = priority;
    };

    cameFrom = [new PositionSquare(4, 2, TypePosition.ALLOWED), new PositionSquare(3, 1, TypePosition.ALLOWED),
        new PositionSquare(2, 1, TypePosition.ALLOWED)]

};