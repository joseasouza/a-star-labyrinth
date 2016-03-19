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

    var start = config.start;
    var goal = config.goal;
    var map = config.map;
    var costs = config.costs;
    var way = [];
    var openned = [];
    var closed = [];
    var wayBack = {};
    this.next = function() {
        return way.pop();
    };
    this.way = function() {
        return way;
    };
    this.openned = function() {
        return openned;
    };

    this.closed = function() {
        return closed;
    };
    this.findWayBack = function(square) {
        var back = [];
        var actual = square;
        back.push(actual);
        while(!actual.equals(start)) {
            actual = wayBack[actual.generateIdentifier()];
            back.push(actual);
        }
        return back;
    };

    function algorithm() {
        var open =  new PriorityQueue({ comparator: function(a, b) {
            return a.priority - b.priority; }
        });
        var initialMove = new Move(start, 0, calculateDistanceToGoal(start));
        var cost_so_far = {};
        open.queue(initialMove);
        cost_so_far[start.generateIdentifier()] = 0;
        var previousSquare = null;
        while(open.length > 0) {
            var current = open.dequeue();
            pushClosed(current);
            if (current.square.equals(goal)) {
                break;
            }

            $.each(findNeighbors(current.square), function(index, next) {
                var newCost = cost_so_far[current.square.generateIdentifier()] + findCost(current.square, next);
                if ((cost_so_far[next.generateIdentifier()] == null || newCost < cost_so_far[next.generateIdentifier()])) {
                    cost_so_far[next.generateIdentifier()] = newCost;
                    var distanceToGoal = calculateDistanceToGoal(next);
                    wayBack[next.generateIdentifier()] = current.square;
                    open.queue(new Move(next, newCost, distanceToGoal));
                }
            });
            previousSquare = current.square;
        }

        buildWay(wayBack);
        buildOpenned(open);

    }

    function pushClosed(current) {
        if (!closedAlreadyContains(current.square)) {
            closed.push(current);
        }
    }

    function buildWay(wayBack) {
        var initiSearch = goal;
        way.push(initiSearch);
        while(initiSearch != null && !initiSearch.equals(start)) {
            initiSearch = wayBack[initiSearch.generateIdentifier()];
            if (initiSearch != null) {
                way.push(initiSearch);
            }
        }
        if (way.length <= 1) {
            way = [];
        }
    }

    function buildOpenned(open) {
        while(open.length > 0) {
            var current = open.dequeue();
            if (!closedAlreadyContains(current.square)
                && !openAlreadyContains(current.square)) {
                openned.push(current);
            }
        }
    }

    function closedAlreadyContains(square) {
        var has = false;
        $.each(closed, function(key, closedSquare) {
            if (closedSquare.square.equals(square)) {
                has = true;
                return false;
            }
        });
       return has;
    }

    function openAlreadyContains(square) {
        var shouldAdd = false;
        $.each(openned, function(key, opennedMove) {
            if (opennedMove.square.equals(square)) {
                shouldAdd = true;
                return false;
            }
        });
        return shouldAdd;
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

    var Move = function(square, cost, distance) {
        this.square = square;
        this.distance = distance;
        this.cost = cost;
        this.priority = distance + cost;
    };

    algorithm();





};