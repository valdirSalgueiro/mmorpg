function mapGenerator(seed, direction) {
    let width = 80;
    let height = 45;
    let smooth = 4;
    //let width = 120;
    //let height = 68;
    //var rng = new Math.seedrandom(seed);
    var rng = Math.random;

    let randomFillPercent = 44;

    let map = Create2DArray(height);

    function Start() {
        GenerateMap();
    }

    function GenerateMap() {
        RandomFillMap();

        let halfHeight = Math.round(height / 2);
        let halfWidth = Math.round(width / 2);
        let entranceThickness = smooth - 2;
        if (direction & LEFT) {
            let x = 0;
            let scavated;
            do {
                scavated = true;
                for (let y = halfHeight - entranceThickness; y <= halfHeight + entranceThickness; y++) {
                    scavated &= map[y][x + 1] == 0
                    map[y][x] = 0;
                }
                x++;
            } while (!scavated && x < width - 1);
        }
        if (direction & RIGHT) {
            let x = width - 1;
            let scavated;
            do {
                scavated = true;
                for (let y = halfHeight - entranceThickness; y <= halfHeight + entranceThickness; y++) {
                    scavated &= map[y][x - 1] == 0
                    map[y][x] = 0;
                }
                x--;
            } while (!scavated && x > 0);
        }
        if (direction & UP) {
            let y = 0;
            let scavated;
            do {
                scavated = true;
                for (let x = halfWidth - entranceThickness; x <= halfWidth + entranceThickness; x++) {
                    scavated &= map[y + 1][x] == 0
                    map[y][x] = 0;
                }
                y++;
            } while (!scavated && y < height - 1);
        }
        if (direction & DOWN) {
            let y = height - 1;
            let scavated;
            do {
                scavated = true;
                for (let x = halfWidth - entranceThickness; x <= halfWidth + entranceThickness; x++) {
                    scavated &= map[y - 1][x] == 0
                    map[y][x] = 0;
                }
                y--;
            } while (!scavated && y > 0);
        }

        for (let i = 0; i < 10; i++) {
            SmoothMap();
        }

    }

    function getRandomInt(min, max) {
        min = Math.ceil(min);
        max = Math.floor(max);
        return Math.floor(rng() * (max - min)) + min; //The maximum is exclusive and the minimum is inclusive
    }

    function RandomFillMap() {
        for (let x = 0; x < width; x++) {
            for (let y = 0; y < height; y++) {
                if (x == 0 || x == width - 1 || y == 0 || y == height - 1) {
                    map[y][x] = 1;
                }
                else {
                    map[y][x] = (getRandomInt(0, 100) < randomFillPercent) ? 1 : 0;
                }
            }
        }
    }

    function SmoothMap() {
        for (let x = 0; x < width; x++) {
            for (let y = 0; y < height; y++) {
                let neighbourWallTiles = GetSurroundingWallCount(x, y);
                if (neighbourWallTiles > smooth)
                    map[y][x] = 1;
                else if (neighbourWallTiles < smooth)
                    map[y][x] = 0;

            }
        }
    }

    function GetSurroundingWallCount(gridX, gridY) {
        let wallCount = 0;
        for (let neighbourX = gridX - 1; neighbourX <= gridX + 1; neighbourX++) {
            for (let neighbourY = gridY - 1; neighbourY <= gridY + 1; neighbourY++) {
                if (neighbourX >= 0 && neighbourX < width && neighbourY >= 0 && neighbourY < height) {
                    if (neighbourX != gridX || neighbourY != gridY) {
                        wallCount += map[neighbourY][neighbourX];
                    }
                }
                else {
                    wallCount++;
                }
            }
        }

        return wallCount;
    }

    Start();
    return map;
}
