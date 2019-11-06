function Hero(map, x, y) {
    this.map = map;
    this.x = x;
    this.y = y;
    this.width = map.tsize;
    this.height = map.tsize;

    this.image = Loader.getImage('hero');
}

Hero.SPEED = 96 * 2; // pixels per second

Hero.prototype.move = function (delta, dirx, diry) {
    this.x += dirx * Hero.SPEED * delta;
    this.y += diry * Hero.SPEED * delta;

    this._collide(dirx, diry);
    currentMapX = Math.floor(this.x / mapPixelWidth);
    currentMapY = Math.floor(this.y / mapPixelHeight);
    var surrounding = 0;

    if (currentMapX != oldMapX || currentMapY != oldMapY) {
        for (let xx = currentMapX - surrounding; xx <= currentMapX + surrounding; xx++) {
            for (let yy = currentMapY - surrounding; yy <= currentMapY + surrounding; yy++) {
                const result = mapGenerator(xx, yy, RIGHT | DOWN | UP | LEFT);
                if (result) {
                    let mapTileX = xx * mapWidth;
                    let mapTileY = yy * mapHeight;
                    let newMap = treatMap(result);
                    for (let i = 0; i < mapWidth; i++) {
                        for (let j = 0; j < mapHeight; j++) {
                            if (!this.map.layers[0][mapTileY + j]) {
                                this.map.layers[0][mapTileY + j] = [];
                            }
                            if (!this.map.collision[mapTileY + j]) {
                                this.map.collision[mapTileY + j] = [];
                            }
                            this.map.layers[0][mapTileY + j][mapTileX + i] = newMap[j][i];
                            this.map.collision[mapTileY + j][mapTileX + i] = result[j][i];
                        }
                    }
                }
            }
        }
        currentMapX = oldMapX = Math.floor(this.x / mapPixelWidth);
        currentMapY = oldMapY = Math.floor(this.y / mapPixelHeight);
    }
    //console.log(`${Math.floor(this.x / 16)},${Math.floor(this.y / 16)}`)
};

Hero.prototype._collide = function (dirx, diry) {
    var row, col;
    // -1 in right and bottom is because image ranges from 0..63
    // and not up to 64
    var left = this.x - this.width / 2;
    var right = this.x + this.width / 2 - 1;
    var top = this.y - this.height / 2;
    var bottom = this.y + this.height / 2 - 1;

    // check for collisions on sprite sides
    var collision =
        this.map.isSolidTileAtXY(left, top) ||
        this.map.isSolidTileAtXY(right, top) ||
        this.map.isSolidTileAtXY(right, bottom) ||
        this.map.isSolidTileAtXY(left, bottom);
    if (!collision) { return; }

    if (diry > 0) {
        row = this.map.getRow(bottom);
        this.y = -this.height / 2 + this.map.getY(row);
    }
    else if (diry < 0) {
        row = this.map.getRow(top);
        this.y = this.height / 2 + this.map.getY(row + 1);
    }
    else if (dirx > 0) {
        col = this.map.getCol(right);
        this.x = -this.width / 2 + this.map.getX(col);
    }
    else if (dirx < 0) {
        col = this.map.getCol(left);
        this.x = this.width / 2 + this.map.getX(col + 1);
    }
};