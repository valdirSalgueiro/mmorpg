const mapCache = [];
let mapWall = [];

function mapGenerator(mapX, mapY, direction) {
    if (mapCache[mapY] && mapCache[mapY][mapX]) {
        console.log('cached ' + mapX + ',' + mapY);
        return false;
    }
    else {
        console.log('new map ' + mapX + ',' + mapY);
    }

    let smooth = 4;
    var rng = new Math.seedrandom(`${mapX, mapY}`);
    //var rng = Math.random;

    let randomFillPercent = 44;

    let map = Create2DArray(mapHeight);

    function Start() {
        GenerateMap();
    }

    function GenerateMap() {
        RandomFillMap();

        let halfHeight = Math.round(mapHeight / 2);
        let halfWidth = Math.round(mapWidth / 2);
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
            } while (!scavated && x < mapWidth - 1);
        }
        if (direction & RIGHT) {
            let x = mapWidth - 1;
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
            } while (!scavated && y < mapHeight - 1);
        }
        if (direction & DOWN) {
            let y = mapHeight - 1;
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
        for (let x = 0; x < mapWidth; x++) {
            for (let y = 0; y < mapHeight; y++) {
                if (x == 0 || x == mapWidth - 1 || y == 0 || y == mapHeight - 1) {
                    map[y][x] = 1;
                }
                else {
                    map[y][x] = (getRandomInt(0, 100) < randomFillPercent) ? 1 : 0;
                }
            }
        }
    }

    function SmoothMap() {
        for (let x = 1; x < mapWidth - 1; x++) {
            for (let y = 1; y < mapHeight - 1; y++) {
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
                if (neighbourX >= 0 && neighbourX < mapWidth && neighbourY >= 0 && neighbourY < mapHeight) {
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

    if (!mapCache[mapY]) {
        mapCache[mapY] = [];
    }
    //mapCache[mapY][mapX] = mapWall;
    mapCache[mapY][mapX] = map;
    return map;
}
