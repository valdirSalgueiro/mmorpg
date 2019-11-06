Game.load = function () {
	return [
		Loader.loadImage('tiles', './assets/autotile.png'),
		Loader.loadImage('hero_idle_left', './assets/char/Idle/Char_idle_left.png'),
		Loader.loadImage('hero_idle_right', './assets/char/Idle/Char_idle_right.png'),
		Loader.loadImage('hero_idle_up', './assets/char/Idle/Char_idle_up.png'),
		Loader.loadImage('hero_idle_down', './assets/char/Idle/Char_idle_down.png')
	];
};

Game.resize = function (width, height) {
	if (!this.camera)
		this.camera = new Camera(width, height);
	this.camera.width = width;
	this.camera.height = height;
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
	var endRow = startRow + (this.camera.height / map.tsize) + 1;
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
