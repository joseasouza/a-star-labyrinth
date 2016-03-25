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