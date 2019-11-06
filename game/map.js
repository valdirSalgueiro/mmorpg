function calculateMask(map, r, c, endCol, endRow) {
    let down = r + 1 <= endRow ? map[r + 1][c] : true;
    let left = c - 1 > 0 ? map[r][c - 1] : true;
    let up = r - 1 > 0 ? map[r - 1][c] : true;
    let right = c + 1 <= endCol ? map[r][c + 1] : true;
    mask = right | (down << 1) | (left << 2) | (up << 3);

    // diagonals
    let downright = c + 1 <= endCol && r + 1 <= endRow ? map[r + 1][c + 1] : true;
    let downleft = c - 1 > 0 && r + 1 <= endRow ? map[r + 1][c - 1] : true;
    let upright = c + 1 <= endCol && r - 1 > 0 ? map[r - 1][c + 1] : true;
    let upleft = c - 1 > 0 && r - 1 > 0 ? map[r - 1][c - 1] : true;
    if (down && right && !downright) {
        mask = 16;
    }
    else if (down && left && !downleft) {
        mask = 17;
    }
    else if (up && right && !upright) {
        mask = 19;
    }
    else if (up && left && !upleft) {
        mask = 18;
    }
    return mask;
}

function treatMap(map) {
    if (!map)
        return false;

    const w = 16;
    const w2 = w << 1;
    const w1 = w;
    const w0 = 0;
    let newMap = Create2DArray(map.length);
    this.tileTextures = [
		/* U L D R DIRECTION */
		// NONE
		/* 0 */ new PointTexture(w * 3, w * 2, 0),
		/* 1 */ new PointTexture(w2, w2, 1), //null,
		/* 2 */ new PointTexture(w1, w0, 2),
		/* 3 */ new PointTexture(w0, w0, 3),
		/* 4 */ new PointTexture(w2, w1, 4),
		/* 5 */ new PointTexture(w * 3, w * 2, 5), //null,
		/* 6 */ new PointTexture(w2, w0, 6),
		/* 7 */ new PointTexture(w1, w0, 7),
		/* 8 */ new PointTexture(w1, w2, 8),
		/* 9 */ new PointTexture(w0, w2, 9),
		/* 10 */ new PointTexture(w * 3, w * 2, 10), //null,
		/* 11 */ new PointTexture(w0, w1, 11),
		/* 12 */ new PointTexture(w2, w2, 12),
		/* 13 */ new PointTexture(w1, w2, 13),
		/* 14 */ new PointTexture(w2, w1, 14),
		/* 15 */ new PointTexture(w1, w1, 15),
		/* DR */ new PointTexture(w * 3, w0, 16),
		/* DL */ new PointTexture(w * 3, w1, 17),
		/* UR */ new PointTexture(w * 3, w * 3, 18),
		/* UL */ new PointTexture(w * 4, w * 3, 19)
    ];
    let endRow = map.length - 1;
    let endCol = map[0].length - 1;
    for (let c = 0; c <= endCol; c++) {
        for (let r = 0; r <= endRow; r++) {
            let mask = 0;
            let tile = map[r][c];
            if (tile !== 0) {
                mask = calculateMask(map, r, c, endCol, endRow);
            }
            newMap[r][c] = tileTextures[mask];
        }
    }
    return newMap;
}

function generateMap(map, x, y) {
    var surrounding = 1;
    for (let xx = currentMapX - surrounding; xx <= currentMapX + surrounding; xx++) {
        for (let yy = currentMapY - surrounding; yy <= currentMapY + surrounding; yy++) {
            const result = mapGenerator(xx, yy, RIGHT | DOWN | UP | LEFT);
            if (result) {
                let mapTileX = xx * mapWidth;
                let mapTileY = yy * mapHeight;
                let newMap = treatMap(result);
                for (let i = 0; i < mapWidth; i++) {
                    for (let j = 0; j < mapHeight; j++) {
                        if (!map.layers[0][mapTileY + j]) {
                            map.layers[0][mapTileY + j] = [];
                        }
                        if (!map.collision[mapTileY + j]) {
                            map.collision[mapTileY + j] = [];
                        }
                        map.layers[0][mapTileY + j][mapTileX + i] = newMap[j][i];
                        map.collision[mapTileY + j][mapTileX + i] = result[j][i];
                    }
                }
            }
        }
    }
    currentMapX = oldMapX = Math.floor(x / mapPixelWidth);
    currentMapY = oldMapY = Math.floor(y / mapPixelHeight);
}

var map = {
    cols: mapWidth,
    rows: mapHeight,
    tsize: 16,
    layers: [],
    collision: [],
    getTile: function (layer, col, row) {
        return this.layers[layer][row] && this.layers[layer][row][col];
    },
    isSolidTileAtXY: function (x, y) {
        var col = Math.floor(x / this.tsize);
        var row = Math.floor(y / this.tsize);
        return this.collision[row] && this.collision[row][col];
    },
    getCol: function (x) {
        return Math.floor(x / this.tsize);
    },
    getRow: function (y) {
        return Math.floor(y / this.tsize);
    },
    getX: function (col) {
        return col * this.tsize;
    },
    getY: function (row) {
        return row * this.tsize;
    }
};