const RIGHT = 1 << 0;
const DOWN = 1 << 1;
const LEFT = 1 << 2;
const UP = 1 << 3;
const mapWidth = 80;
const mapHeight = 45;
const mapPixelWidth = mapWidth * 16;
const mapPixelHeight = mapHeight * 16;

let debug = false;
let debuggable = true;

let currentMapX = 0;
let currentMapY = 0;
let oldMapX = 999;
let oldMapY = 999;

function Create2DArray(rows) {
    var arr = [];

    for (var i = 0; i < rows; i++) {
        arr[i] = [];
    }

    return arr;
}

function Rectangle(x, y, width, height) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
}

function PointTexture(x, y, t) {
    this.x = x;
    this.y = y;
    this.t = t;
}

window.onload = function () {
    var canvas = document.getElementById('canvas');
    var context = canvas.getContext('2d');
    onResize();
    Game.run(context);
};

function onResize() {
    var canvas = document.getElementById('canvas');
    canvas.setAttribute('width', window.innerWidth / 3);
    canvas.setAttribute('height', window.innerHeight / 3);
    Game.resize(window.innerWidth / 3, window.innerHeight / 3);
}

window.onresize = onResize;