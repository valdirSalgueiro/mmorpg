
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
			if (tile !== 0) { // 0 => empty tile
				mask = calculateMask(map, r, c, endCol, endRow);
				//mask = 1;
			}
			newMap[r][c] = tileTextures[mask];
		}
	}
	return newMap;
}

var map = {
	cols: mapWidth,
	rows: mapHeight,
	tsize: 16,
	layers: [],
	getTile: function (layer, col, row) {
		return this.layers[layer][row] && this.layers[layer][row][col];
	},
	isSolidTileAtXY: function (x, y) {
		// var col = Math.floor(x / this.tsize);
		// var row = Math.floor(y / this.tsize);
		// return this.collision[row][col];
		return false;
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

function Camera(map, width, height) {
	this.x = 0;
	this.y = 0;
	this.width = width;
	this.height = height;
	//this.maxX = map.cols * map.tsize - width;
	//this.maxY = map.rows * map.tsize - height;
}

Camera.prototype.follow = function (sprite) {
	this.following = sprite;
	sprite.screenX = 0;
	sprite.screenY = 0;
};

Camera.prototype.update = function () {
	// assume followed sprite should be placed at the center of the screen
	// whenever possible
	this.following.screenX = this.width / 2;
	this.following.screenY = this.height / 2;

	// make the camera follow the sprite
	this.x = this.following.x - this.width / 2;
	this.y = this.following.y - this.height / 2;
};

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
	// move hero
	this.x += dirx * Hero.SPEED * delta;
	this.y += diry * Hero.SPEED * delta;
	//this.x += dirx;
	//this.y += diry;

	// check if we walked into a non-walkable tile
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
							if (!this.map.layers[0][mapTileY + j])
								this.map.layers[0][mapTileY + j] = [];
							this.map.layers[0][mapTileY + j][mapTileX + i] = newMap[j][i];
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

Game.load = function () {
	return [
		Loader.loadImage('tiles', './assets/autotile.png'),
		Loader.loadImage('hero', './assets/char/Idle/Char_idle_left.png')
	];
};

Game.init = function () {
	Keyboard.listenForEvents(
		[Keyboard.LEFT, Keyboard.RIGHT, Keyboard.UP, Keyboard.DOWN, Keyboard.D, Keyboard.E]);

	this.ctx.font = "9px Arial";
	this.ctx.textAlign = "left";
	this.ctx.textBaseline = "top";
	this.ctx.fillStyle = "black";
	this.tileAtlas = Loader.getImage('tiles');
	this.hero = new Hero(map, 2 * 16, 21 * 16);

	map.layers = [];
	map.layers[0] = [];
	this.camera = new Camera(map, cameraWidth, cameraHeight);
	this.camera.follow(this.hero);
	this.ctx.imageSmoothingEnabled = false;

};

Game.update = function (delta) {
	// handle hero movement with arrow keys
	var dirx = 0;
	var diry = 0;
	if (Keyboard.isDown(Keyboard.LEFT)) { dirx = -1; }
	else if (Keyboard.isDown(Keyboard.RIGHT)) { dirx = 1; }
	else if (Keyboard.isDown(Keyboard.UP)) { diry = -1; }
	else if (Keyboard.isDown(Keyboard.DOWN)) { diry = 1; }

	if (Keyboard.isDown(Keyboard.D)) { debug = true; }
	if (Keyboard.isDown(Keyboard.E)) { debug = false; }

	this.hero.move(delta, dirx, diry);
	this.camera.update();
};

Game._drawLayer = function (layer) {
	var startCol = Math.floor(this.camera.x / map.tsize);
	var endCol = startCol + (this.camera.width / map.tsize);
	var startRow = Math.floor(this.camera.y / map.tsize);
	var endRow = startRow + (this.camera.height / map.tsize);
	var offsetX = -this.camera.x + startCol * map.tsize;
	var offsetY = -this.camera.y + startRow * map.tsize;

	var xx, yy;
	for (var c = startCol; c <= endCol; c++) {
		if (debug) {
			xx = c * 16 - this.camera.x;
			yy = 0;
			this.ctx.beginPath();
			this.ctx.moveTo(xx, yy);
			this.ctx.lineTo(xx, (endRow + 1) * 16 - this.camera.y);
			this.ctx.stroke();
		}

		for (var r = startRow; r <= endRow; r++) {
			if (debug) {
				xx = 0;
				yy = r * 16 - this.camera.y;
				this.ctx.beginPath();
				this.ctx.moveTo(xx, yy);
				this.ctx.lineTo((endCol + 1) * 16 - this.camera.x, yy);
				this.ctx.stroke();
			}

			var tile = map.getTile(layer, c, r);
			if (tile) {
				var x = (c - startCol) * map.tsize + offsetX;
				var y = (r - startRow) * map.tsize + offsetY;
				if (tile.t) {
					this.ctx.drawImage(
						this.tileAtlas, // image
						48, // source x
						32, // source y
						map.tsize, // source width
						map.tsize, // source height
						Math.round(x),  // target x
						Math.round(y), // target y
						map.tsize, // target width
						map.tsize // target height
					);
				}

				this.ctx.drawImage(
					this.tileAtlas, // image
					tile.x, // source x
					tile.y, // source y
					map.tsize, // source width
					map.tsize, // source height
					Math.round(x),  // target x
					Math.round(y), // target y
					map.tsize, // target width
					map.tsize // target height
				);

				if (debug) {
					//this.ctx.fillText(c, Math.round(x), Math.round(y));
					//this.ctx.fillText(r, Math.round(x), Math.round(y + 8));
					this.ctx.fillText(tile.t, Math.round(x), Math.round(y + 8));
				}
			}
		}

	}
};

Game.render = function () {
	// draw map background layer
	this._drawLayer(0);

	// draw main character
	this.ctx.drawImage(
		this.hero.image,
		0, // source x
		0, // source y
		map.tsize, // source width
		map.tsize, // source height
		this.hero.screenX - this.hero.width / 2,
		this.hero.screenY - this.hero.height / 2,
		map.tsize, // target width
		map.tsize// target height
	);

	// draw map top layer
	//this._drawLayer(1);
};
