const w = 1280;
const h = 720;
let seed = 0;


const app = new PIXI.Application({
	width: w / 2,
	height: h / 2
	//width: w,
	//height: h
});

const container = document.querySelector(".container");
container.appendChild(app.view);
let shots = [];

app.loader.baseUrl = "./assets";
app.loader.add("autotile", "autotile.png").load(initLevel);

function createTilemap() {
	let obj = new Tilemap(app.loader.resources, w, h);
	obj.position.set(0, 0);
	app.stage.addChild(obj);
	return obj;
}

function initLevel() {
	let tilemap = createTilemap();

	app.ticker.add(updateLevel);

	function updateLevel(delta) {
		tilemap.updateView();
	}
}

class Tilemap extends PIXI.Container {
	constructor(resources, width, height) {
		super();
		this.initTiles(resources);
		this.inner = new PIXI.Graphics();
		this.viewRect = new PIXI.Rectangle(0, 0, width, height);
		this.filledRect = new PIXI.Rectangle();
		this.padding = 0;
		this.offset = new PIXI.Point();
		this.addChild(this.inner);

		let direction = LEFT | RIGHT | UP | DOWN;
		do {
			//console.log('seed ' + seed);
			this.field = mapGenerator(seed++, direction);
			console.log('try');
		}
		while (this.fill());
	}

	initTiles(resources) {
		const w = 16;
		const w2 = w << 1;
		const w1 = w;
		const w0 = 0;
		const auto = resources["autotile"].texture.baseTexture;
		this.tileTextures = [
            /* U L D R DIRECTION */
            // NONE
			/* 0 */ new PIXI.Texture(auto, new PIXI.Rectangle(w * 3, w * 2, w, w)),
            /* 1 */ null,
			/* 2 */ new PIXI.Texture(auto, new PIXI.Rectangle(w1, w0, w, w)),
            /* 3 */ new PIXI.Texture(auto, new PIXI.Rectangle(w0, w0, w, w)),
            /* 4 */ new PIXI.Texture(auto, new PIXI.Rectangle(w2, w1, w, w)),
			/* 5 */ null,
            /* 6 */ new PIXI.Texture(auto, new PIXI.Rectangle(w2, w0, w, w)),
            /* 7 */ new PIXI.Texture(auto, new PIXI.Rectangle(w1, w0, w, w)),
			/* 8 */ new PIXI.Texture(auto, new PIXI.Rectangle(w1, w2, w, w)),
			/* 9 */ new PIXI.Texture(auto, new PIXI.Rectangle(w0, w2, w, w)),
			/* 10 */ null,
            /* 11 */ new PIXI.Texture(auto, new PIXI.Rectangle(w0, w1, w, w)),
            /* 12 */ new PIXI.Texture(auto, new PIXI.Rectangle(w2, w2, w, w)),
            /* 13 */ new PIXI.Texture(auto, new PIXI.Rectangle(w1, w2, w, w)),
            /* 14 */ new PIXI.Texture(auto, new PIXI.Rectangle(w2, w1, w, w)),
			/* 15 */ new PIXI.Texture(auto, new PIXI.Rectangle(w1, w1, w, w)),
			/* DR */ new PIXI.Texture(auto, new PIXI.Rectangle(w * 3, w0, w, w)),
			/* DL */ new PIXI.Texture(auto, new PIXI.Rectangle(w * 3, w1, w, w)),
			/* UR */ new PIXI.Texture(auto, new PIXI.Rectangle(w * 3, w * 3, w, w)),
			/* UL */ new PIXI.Texture(auto, new PIXI.Rectangle(w * 4, w * 3, w, w))
		];
	}

	fill() {
		const tileSize = 16;
		const viewRect = this.viewRect;
		const offset = this.offset;
		const inner = this.inner;
		const padding = this.padding;

		let i1 = Math.floor((offset.x + viewRect.x - padding) / tileSize);
		let j1 = Math.floor((offset.y + viewRect.y - padding) / tileSize);
		let i2 = Math.ceil((offset.x + viewRect.x + viewRect.width + padding) / tileSize);
		let j2 = Math.ceil((offset.y + viewRect.y + viewRect.height + padding) / tileSize);

		inner.position.set(i1 * tileSize, j1 * tileSize);
		inner.roundPixels = true;
		inner.clear();

		const field = this.field;

		const rows = field.length, cols = field[0].length;
		let error = false;

		for (let i = i1; i <= i2; i++) {
			for (let j = j1; j <= j2; j++) {
				let xx = (i - i1) * tileSize, yy = (j - j1) * tileSize;

				let tileX = i - Math.floor(i / cols) * cols;
				let tileY = j - Math.floor(j / rows) * rows;
				let tile = field[tileY][tileX];
				let mask = 0;
				if (tile) {
					let right = field[tileY][(tileX + 1) % cols];
					let down = field[(tileY + 1) % rows][tileX];
					let left = field[tileY][(tileX + cols - 1) % cols];
					let up = field[(tileY + rows - 1) % rows][tileX];
					mask = right | (down << 1) | (left << 2) | (up << 3);

					// diagonals
					let downright = field[(tileY + 1) % rows][(tileX + 1) % cols];
					let downleft = tileX == 0 ? true : field[(tileY + 1) % rows][(tileX - 1) % cols];
					let upright = tileY == 0 ? true : field[(tileY - 1) % rows][(tileX + 1) % cols];
					let upleft = tileX == 0 || tileY == 0 ? true : field[(tileY - 1) % rows][(tileX - 1) % cols];
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

					inner.beginTextureFill(this.tileTextures[0]);
					inner.drawRect(xx, yy, tileSize, tileSize);
					inner.endFill();
				}
				var drawTexture = this.tileTextures[mask];
				if (this.tileTextures[mask] != null) {
					inner.beginTextureFill(drawTexture);
					inner.drawRect(xx, yy, tileSize, tileSize);
					inner.endFill();
				}
				else {
					var buttonText = new PIXI.Text(mask,
						{
							fontFamily: 'Arial',
							fontSize: 12,
							fill: "white"
						});
					buttonText.anchor.set(0, 0);
					buttonText.position.set(xx, yy);
					inner.addChild(buttonText);
				}
			}
		}

		this.filledRect.x = i1 * tileSize;
		this.filledRect.y = j1 * tileSize;
		this.filledRect.width = (i2 - i1 + 1) * tileSize;
		this.filledRect.height = (j2 - j1 + 1) * tileSize;
		//console.log(error);
		return error;
	}


	updateView() {
		if (!isInside(this.viewRect, this.filledRect, this.offset)) {
			this.fill();
		}
	}
}

let tempRect = new PIXI.Rectangle();

function isInside(rect1, rect2, offset) {
	tempRect.copyFrom(rect1);
	tempRect.x += offset.x;
	tempRect.y += offset.y;
	tempRect.enlarge(rect2);
	return tempRect.width === rect2.width && tempRect.height === rect2.height;
}
