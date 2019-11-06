function Hero(map, x, y) {
    this.map = map;
    this.x = x;
    this.y = y;
    this.width = map.tsize;
    this.height = map.tsize;
    this.frame = 0;
    this.direction = RIGHT;

    this.image = Loader.getImage('hero_idle_right');
}

Hero.SPEED = 96 * 2; // pixels per second

Hero.prototype.move = function (delta, dirx, diry) {
    this.x += dirx * Hero.SPEED * delta;
    this.y += diry * Hero.SPEED * delta;
    var idle = false;
    if (dirx < 0) {
        this.direction = LEFT;
    }
    else if (dirx > 0) {
        this.direction = RIGHT;
    }
    else if (diry < 0) {
        this.direction = UP;
    }
    else if (diry > 0) {
        this.direction = DOWN;
    }
    else {
        idle = true;
    }

    switch (this.direction) {
        case LEFT:
            this.image = idle ? Loader.getImage('hero_idle_left') : Loader.getImage('hero_idle_left');
            break;
        case RIGHT:
            this.image = idle ? Loader.getImage('hero_idle_right') : Loader.getImage('hero_idle_right');
            break;
        case UP:
            break;
        case DOWN:
            break;
    }

    this._collide(dirx, diry);
    currentMapX = Math.floor(this.x / mapPixelWidth);
    currentMapY = Math.floor(this.y / mapPixelHeight);

    if (currentMapX != oldMapX || currentMapY != oldMapY) {
        generateMap(this.map, this.x, this.y);
    }
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