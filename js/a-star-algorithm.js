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

    var start = config.start;
    var goal = config.goal;
    var map = config.map;
    var costs = config.costs;
    var way = [];
    this.next = function() {
        return way.pop();
    };

    function algorithm() {
        var initialMove = new Move(start, 0);
        var cost_so_far = {};
        var wayBack = {};
        open.queue(initialMove);
        cost_so_far[start.generateIdentifier()] = 0;
        var previousSquare = null;
        while(open.length > 0) {
            var current = open.dequeue();
            //backIfCurrentIsNotNeighbor(previousSquare, current.square);
            //cameFrom.push(current.square);
            if (current.square.equals(goal)) {
                break;
            }

            $.each(findNeighbors(current.square), function(index, next) {
                var newCost = cost_so_far[current.square.generateIdentifier()] + findCost(current.square, next);
                if ((cost_so_far[next.generateIdentifier()] == null || newCost < cost_so_far[next.generateIdentifier()])) {
                    cost_so_far[next.generateIdentifier()] = newCost;
                    open.queue(new Move(next, newCost + calculateDistanceToGoal(next)));
                    wayBack[next.generateIdentifier()] = current.square;
                }
            });
            previousSquare = current.square;
        }

        buildWay(wayBack);

    }

    function buildWay(wayBack) {
        var initiSearch = goal;
        way.push(initiSearch);
        while (!initiSearch.equals(start)) {
            initiSearch = wayBack[initiSearch.generateIdentifier()];
            way.push(initiSearch);
        }
    }

    /*function backIfCurrentIsNotNeighbor(previous, current) {
        if (previous != null && !isNeighbor(previous, current)) {
            for (var i = cameFrom.length -2; i >= 0; i--) {
                var square = cameFrom[i];
                cameFrom.push(square);
                if (isNeighbor(square, current)) {
                    break;
                }
            }
        }
    }*/

    /*function isNeighbor(previous, current) {
        var isNeighbor = false;
        if (previous != null) {
            for (var i = previous.index[0] - 1; i <= previous.index[0] + 1; i++) {
                for (var j = previous.index[1] - 1; j <= previous.index[1] + 1; j++) {
                    if (i == current.index[0] && j == current.index[1]) {
                        isNeighbor = true;
                    }
                }
            }
        }
        return isNeighbor;
    }*/

    function calculateDistanceToGoal(square) {
        var x = Math.pow(square.center[0] - goal.center[0], 2);
        var y = Math.pow(square.center[1] - goal.center[1], 2);
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

    algorithm();





};