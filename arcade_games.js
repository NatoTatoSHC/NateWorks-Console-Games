var hashtagEater = {
    "play": async function (term, id) {
        let game = {
            width: term.cols(),
            height: term.rows()-1,
        }
        term.on("keypress", (e) => {
            switch(e.key) {
                case 'w':
                    if (player.y > 0) {
                        player.y -= 1;
                    }
                    break;
                case 's':
                    if (player.y < game.height-1) {
                        player.y += 1;
                    }
                    break;
                case 'a':
                    if (player.x > 0) {
                        player.x -= 1;
                    }
                    break;
                case 'd':
                    if (player.x < game.width-1) {
                        player.x += 1;
                    }
                    break;
                case 'x':
                    clearInterval(loop);
                    term.off("keypress");
                    term.reset();

            }
        });
        function generateGrid(player, hash) {
            let retGrid = [];
            for (let i = 0; i < game.height; i++) {
                let str = " ".repeat(game.width);
                hash.forEach(hashi => {
                    if (hashi.y == i) {
                        str = str.slice(0, hashi.x)+"#"+str.slice(hashi.x+1);
                    }
                });
                if (player.y == i) {
                    str = str.slice(0, player.x)+"@"+str.slice(player.x+1);
                }
                retGrid.push(str);
            }
            return retGrid;
        }
        function addHash() {
            if (hash.length < 5) {
                let newHash = {};
                newHash.x = Math.round(Math.random()*game.width);
                newHash.y = Math.round(Math.random()*game.height);
                hash.push(newHash);
            }
        }
        var player = {
            x: 4,
            y: 8
        }
        var hash = [];
        var grid = generateGrid(player, hash);
        function draw() {
            addHash();
            grid = generateGrid(player, hash);
            term.clear();
            term.set_command("");
            term.echo("Press x to exit.")
            grid.forEach(y => {
                term.echo(y);
            });
        }
        let loop = setInterval(draw, 10);
        
    }
}
var bombDodger = {
    "play": async function (term, id) {
        term.on("keydown", (e) => {
            switch(e.key) {
                case 'd':
                    if (player.x < game.width - 1) {
                        player.xVel = 1;
                    }
                    break;
                case 'a':
                    if (player.x > 0) {
                        player.xVel = -1;
                    }
                    break;
                case 'w':
                    if (grid[player.y+1][player.x] == "I") {
                        player.accel = -3;
                        player.y -= 1;
                    }
                    break;
                case 'x':
                    clearInterval(loop);
                    term.off("keydown");
                    term.off("keyup");
                    term.reset();
                    break;
            }
        });
        term.on("keyup", (e) => {
            switch(e.key) {
                case 'd':
                    player.xVel = 0;
                    break;
                case 'a':
                    player.xVel = 0;
                    break;
            }
        })
        var game = {
            width: term.cols(),
            height: term.rows()
        }
        var player = {
            x: 0,
            y: 0,
            accel: 1,
            xVel: 0
        };
        var ground = {
            height: 10,
            pos: {
                x: 0,
                y: game.height-1-10
            },
            grid:[]
        };
        var bombs = [{x: 10, y: 0}];
        ground.grid = generateGround(ground)
        var grid = [];
        function generateGround(ground) {
            let retGrid = [];
            for (let i = 0; i < ground.height; i++) {
                let str = "I".repeat(game.width);
                retGrid.push(str);
            }
            return retGrid;
        }
        function generateGrid(player, ground, bombs) {
            let retGrid = [];
            for (let i = 0; i < game.height; i++) {
                let str = " ".repeat(game.width);
                if (ground.pos.y <= i && i <= ground.pos.y + ground.height) {
                    str = ground.grid[i-ground.pos.y];
                }
                if (player.y == i) {
                    str = str.slice(0, player.x)+"@"+str.slice(player.x+1);
                }
                bombs.forEach(bomb => {
                    if (i == bomb.y) {
                        str = str.slice(0, bomb.x)+"*"+str.slice(bomb.x+1);
                    }
                })
                retGrid.push(str);
            }
            return retGrid;
        }
grid = generateGrid(player, ground, bombs);

        function update() {
            //Hit Top
            if (player.y < 0) {
                player.y = 0;
                player.accel = 1;
                grid = generateGrid(player, ground, bombs);
            }

            //Player Fall
            if (grid[player.y+1][player.x] == " ") {
                player.y += player.accel;
            }
            if (player.accel < 1) {
                player.accel += 1;
            }

            //Player MOve
            if (((player.x > 0 && player.xVel == -1) || (player.x < game.width - 1 && player.xVel == 1))) {
                if ((player.x > 0 && player.xVel == -1 && grid[player.y][player.x-1] == " ") || (player.x < game.width - 1 && player.xVel == 1 && grid[player.y][player.x+1] == " "))
                player.x += player.xVel;
            }

            //Bomb drop
            bombs.forEach(bomb => {
                bomb.y += 1;
                if (grid[bomb.y+1][bomb.x] == "I") {
                    ground.grid[bomb.y+1-ground.pos.y] = ground.grid[bomb.y+1-ground.pos.y].slice(0, bomb.x-2) + "     "+ground.grid[bomb.y+1-ground.pos.y].slice(bomb.x+3);
                    delete bombs[bombs.indexOf(bomb)];
                }
            });

            grid = generateGrid(player, ground, bombs);
            draw();
        }
        function draw() {
            term.clear();
            term.set_command("");
            term.echo("Press x to exit.")
            grid.forEach(y => {
                term.echo(y);
            });
        }
        var loop = setInterval(update, 10);
    }
        
}
