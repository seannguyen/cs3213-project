'use strict';
/*global Grid:false, Kinetic:false, Assets:false, Player:false, DEBUG:false*/

function Tile() {
    Grid.call(this, {}, new Kinetic.Rect({
        stroke: '#000000',
        strokeWidth: 1,
        fill: '#009966',
        //fillPatternImage: Assets.grass
    }));
}
Tile.prototype = Object.create(Grid.prototype);


function Game(game, canvasSize) {
    this.size = game.mapSize;
    this.canvasSize = canvasSize;
    this.gridSize = canvasSize / this.size;
    this.game = game;

    this._backgroundLayer = new Kinetic.Layer();
    this._objectLayer = new Kinetic.Layer();

    this.objects = {};

    this.eventCounter = 0;
    Grid.prototype.size = this.gridSize;
}

Game.prototype.createObjects = function(objs) {
    var objects = {};

    objs.forEach(function(obj) {
        var object;
        if (obj.type === 'player') {
            object = new Player(obj.model);
        }

        if (object) {
            object.setGrid(obj.xy.x, obj.xy.y);
            objects[obj.id] = objects;
        }
    });

    return objects;
};

Game.prototype.getLayers = function() {
    var layers = [];
    layers.push(this.getBackgroundLayer());
    layers.push(this.getObjectLayer());

    return layers;
};

Game.prototype.getBackgroundLayer = function() {
    for (var i=0;i<this.size;i++) {
        for (var j=0;j<this.size;j++) {
            var tile = new Tile();
            tile.setGrid(i, j);

            this._backgroundLayer.add(tile.repr);
        }
    }
    return this._backgroundLayer;
};

Game.prototype.getObjectLayer = function() {
    this.game.objects.forEach(function(obj) {
        var object;
        if (obj.type === 'player') {
            object = new Player(obj.model);
        }

        if (object) {
            object.setGrid(obj.xy.x, obj.xy.y);
            this.objects[obj.id] = object;
            this._objectLayer.add(object.repr);
        }
    }.bind(this));

    return this._objectLayer;
};

Game.prototype.executeNextEvent = function(callback) {
    // We have run out of events to execute
    if (this.eventCounter >= this.game.events.length) {
        if (callback) {
            callback(true);
        }
        return;
    }
    var nextEvent = this.game.events[this.eventCounter++];

    var updateModelAndCallback = function() {
        object.updateModel(nextEvent.update);
        if (callback) {
            callback(false);
        }
    };

    if (nextEvent.type === 'move') {
        var object = this.objects[nextEvent.id];
        if (!object) {
            DEBUG('Invalid id for objects in event');
            return;
        }

        object.animateTo(nextEvent.xy.x, nextEvent.xy.y, updateModelAndCallback);
    }
};

Game.prototype.executeEvents = function() {
    this.executeNextEvent(function(done) {
        if (!done) {
            this.executeEvents();
        }
    }.bind(this));;
}
