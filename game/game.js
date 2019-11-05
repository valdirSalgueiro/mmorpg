
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
		/* 0 */ new Point(w * 3, w * 2),
		/* 1 */ new Point(w * 3, w * 2), //null,
		/* 2 */ new Point(w1, w0),
		/* 3 */ new Point(w0, w0),
		/* 4 */ new Point(w2, w1),
		/* 5 */ new Point(w * 3, w * 2), //null,
		/* 6 */ new Point(w2, w0),
		/* 7 */ new Point(w1, w0),
		/* 8 */ new Point(w1, w2),
		/* 9 */ new Point(w0, w2),
		/* 10 */ new Point(w * 3, w * 2), //null,
		/* 11 */ new Point(w0, w1),
		/* 12 */ new Point(w2, w2),
		/* 13 */ new Point(w1, w2),
		/* 14 */ new Point(w2, w1),
		/* 15 */ new Point(w1, w1),
		/* DR */ new Point(w * 3, w0),
		/* DL */ new Point(w * 3, w1),
		/* UR */ new Point(w * 3, w * 3),
		/* UL */ new Point(w * 4, w * 3)
	];
	let endRow = map.length - 1;
	let endCol = map[0].length - 1;
	for (let c = 0; c <= endCol; c++) {
		for (let r = 0; r <= endRow; r++) {
			let mask = 0;
			let tile = map[r][c];
			if (tile !== 0) { // 0 => empty tile
				let down = r + 1 < endRow ? map[r + 1][c] : true;
				let left = c - 1 > 0 ? map[r][c - 1] : true;
				let up = r - 1 > 0 ? map[r - 1][c] : true;
				let right = c + 1 < endCol ? map[r][c + 1] : true;
				mask = right | (down << 1) | (left << 2) | (up << 3);

				// diagonals
				let downright = c + 1 < endCol && r + 1 < endRow ? map[r + 1][c + 1] : true;
				let downleft = c - 1 > 0 && r + 1 < endRow ? map[r + 1][c - 1] : true;
				let upright = c + 1 < endCol && r - 1 > 0 ? map[r - 1][c + 1] : true;
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
		return this.layers[layer][row][col];
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
	// clamp values
	// this.x = Math.max(0, Math.min(this.x, this.maxX));
	// this.y = Math.max(0, Math.min(this.y, this.maxY));

	// // in map corners, the sprite cannot be placed in the center of the screen
	// // and we have to change its screen coordinates

	// // left and right sides
	// if (this.following.x < this.width / 2 ||
	// 	this.following.x > this.maxX + this.width / 2) {
	// 	this.following.screenX = this.following.x - this.x;
	// }
	// // top and bottom sides
	// if (this.following.y < this.height / 2 ||
	// 	this.following.y > this.maxY + this.height / 2) {
	// 	this.following.screenY = this.following.y - this.y;
	// }
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

	// check if we walked into a non-walkable tile
	this._collide(dirx, diry);
	currentMapX = Math.floor(this.x / mapPixelWidth);
	currentMapY = Math.floor(this.y / mapPixelHeight);

	let left = currentMapX < oldMapX;
	let right = currentMapX > oldMapX;
	let up = currentMapY < oldMapY;
	let down = currentMapY > oldMapY;
	if (left || right || up || down) {
		console.log(currentMapX);
		console.log(currentMapY);
		for (let xx = currentMapX - 2; xx < currentMapX + 2; xx++) {
			for (let yy = currentMapY - 2; yy < currentMapY + 2; yy++) {
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
		[Keyboard.LEFT, Keyboard.RIGHT, Keyboard.UP, Keyboard.DOWN]);
	this.tileAtlas = Loader.getImage('tiles');

	var maps = Create2DArray(3);
	for (let i = 0; i < 3; i++) {
		for (let j = 0; j < 3; j++) {
			maps[j][i] = mapGenerator(i, j, RIGHT | DOWN | UP | LEFT);
		}
	}

	map.collision = Create2DArray(mapHeight * 3);
	for (let i = 0; i < mapWidth * 3; i++) {
		for (let j = 0; j < mapHeight * 3; j++) {
			const row = Math.floor(j / mapHeight);
			const col = Math.floor(i / mapWidth);
			var currentMap = maps[row][col];
			map.collision[j][i] = currentMap[j % mapHeight][i % mapWidth];
		}
	}

	map.layers = [treatMap(map.collision)];
	//console.log(map.layers[0]);
	//this.hero = new Hero(map, 2 * 16, 23 * 16);
	this.hero = new Hero(map, 100 * 16, 50 * 16);
	currentMapX = oldMapX = Math.floor(this.hero.x / mapPixelWidth);
	currentMapY = oldMapY = Math.floor(this.hero.y / mapPixelHeight);

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

	for (var c = startCol; c <= endCol; c++) {
		for (var r = startRow; r <= endRow; r++) {
			var tile = map.getTile(layer, c, r);
			var x = (c - startCol) * map.tsize + offsetX;
			var y = (r - startRow) * map.tsize + offsetY;
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
