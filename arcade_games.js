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
        var game = {
            width: term.cols(),
            height: term.rows()
        }
        var player = {
            x: 0,
            y: 0
        };
        var ground = {
            height: 10,
            pos: {
                x: 0,
                y: game.height-1-10
            },
            grid:[]
        };
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
        function generateGrid(player, ground) {
            let retGrid = [];
            for (let i = 0; i < game.height; i++) {
                let str = " ".repeat(game.width);
                if (ground.pos.y <= i && i <= ground.pos.y + ground.height) {
                    str = ground.grid[i-ground.pos.y];
                }
                if (player.y == i) {
                    str = str.slice(0, player.x)+"@"+str.slice(player.x+1);
                }
                retGrid.push(str);
            }
            return retGrid;
        }

        function update() {
            //Player Fall
            if (grid[player.y+1][player.x] == " ") {
                player.y += 1;
            }

            grid = generateGrid(player, ground);
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
