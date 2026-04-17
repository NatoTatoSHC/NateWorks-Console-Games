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
        //CONSTS
        const game = {
            width: term.cols(),
            height: term.rows() - 3
        };
        const groundHeight = 10;
        const fps = 60;
        const characters = {
            ground: "I",
            player: "@",
            bomb: "*",
            air: " "
        };
        const explosionSize = 5;
        const accelaration = 1;

        //SETUP
        if (!localStorage.getItem(id+".config")) {
            localStorage.setItem(id+".config", JSON.stringify({
                drill: false,
                startScore: 0
            }));
        } else {
            let locData = JSON.parse(localStorage.getItem(id+".config"));
            let notContainsAllInfo = (!Object.keys(locData).includes("drill") || !Object.keys(locData).includes("startScore"))
            if (notContainsAllInfo) {
                console.log("Missing Something")
                localStorage.setItem(id+".config", JSON.stringify({
                    drill: false,
                    startScore: 0
                }));
            }
        }
        let locData = JSON.parse(localStorage.getItem(id+".config"));
        var drill = locData.drill;
        var score = locData.startScore;
        var iteration = 0;
        var player = {
            x: 0,
            y: 0,
            yVelo: 1,
            xVelo: 0
        };
        var ground = generateGround();
        var bombs = [];
        var grid = generateGrid();

        //FUNCTION
        function replaceAt(str, index, replacement) {
            return str.slice(0, index) + replacement + str.slice(index + replacement.length);
        }
        function replaceGround(bomb, i) {
            ground[bomb.y - (game.height - 1 - groundHeight)] = replaceAt(ground[bomb.y - (game.height - 1 - groundHeight)], bomb.x + i, characters.air);
        }
        function exit() {
            clearInterval(timer);
            term.off("keydown");
            setTimeout(() => {term.reset();term.echo("Score: "+score)}, 500);
        }
        function generateGrid() {
            let ret = [];
            for (let i = 0; i < game.height; i++) {
                let str = characters.air.repeat(game.width);
                if (i >= game.height - 1 - groundHeight) {
                    str = ground[i - (game.height - 1 - groundHeight)];
                }
                for (b in bombs) {
                    if (i == bombs[b].y) {
                        str = str.slice(0, bombs[b].x) + characters.bomb + str.slice(bombs[b].x + 1);
                    }
                }
                if (i == player.y) {
                    str = str.slice(0, player.x) + characters.player + str.slice(player.x + 1);
                }
                //Score
                if (i == 0) {
                    str = str.slice(0, 1) + score + str.slice(1 + score.toString().length)
                }
                ret.push(str);
            }
            return ret;
        }
        function generateGround() {
            let ret = [];
            for (let i = 0; i < groundHeight; i++) {
                ret.push(characters.ground.repeat(game.width));
            }
            return ret;
        }

        //EVENTS
        term.on("keydown", (e) => {
            switch(e.key) {
                case 'a':
                    player.xVelo = -1;
                    break;
                case 'd':
                    player.xVelo = 1;
                    break;
                case 'w':
                    if (player.y + 1 >= game.height - 1 - groundHeight && ground[player.y + 1 - (game.height - 1 - groundHeight)][player.x] != characters.air) {
                        player.y -= 1;
                        player.yVelo = -2;
                    }
                    break;
                case 'x':
                    exit();
                    break;
            }
        });
        term.on("keyup", (e) => {
            switch(e.key) {
                case 'a':
                    player.xVelo = 0;
                    break;
                case 'd':
                    player.xVelo = 0;
                    break;
            }
        });

        //LOOP
        function loop() {
            iteration += 1;
            update();
            draw();
        }
        var timer = setInterval(loop, 1000/fps)

        //UPDATE
        function update() {
            if ((iteration % 60) === 0) {
                score += 1;
            }
            //Player Movement
            //Move Right
            if (player.xVelo > 0 && player.x < game.width - 1) {
                if (player.y >= game.height - 1 - groundHeight) {
                    if (ground[player.y - (game.height - 1 - groundHeight)][player.x + 1] == characters.air) {
                        player.x += player.xVelo;
                    }
                } else {
                    player.x += player.xVelo;
                }
            }
            //Move Left
            if (player.xVelo < 0 && player.x > 0) {
                if (player.y >= game.height - 1 - groundHeight) {
                    if (ground[player.y - (game.height - 1 - groundHeight)][player.x - 1] == characters.air) {
                        player.x += player.xVelo;
                    }
                } else {
                    player.x += player.xVelo;
                }
            }
            //Gravity
            if (player.y + 1 >= game.height - 1 - groundHeight) {
                if (player.y >= game.height - 2) {
                    exit();
                } else if (ground[player.y + 1 - (game.height - 1 - groundHeight)][player.x] == characters.air) {
                    player.y += player.yVelo;
                }
            } else {
                player.y += player.yVelo;
            }
            if (player.yVelo < 1) {
                player.yVelo += accelaration;
            }

            //Make Bombs
            if (bombs.length < 10) {
                bombs.push({
                    x: Math.round(Math.random() * (game.width - 1)),
                    y: Math.round(Math.random() * (game.height / 4))
                });
            }
            //Bombs' Gravity & Explosion
            for (b in bombs) {
                let bomb = bombs[b];
                bomb.y += 1;
                if (bomb.y >= game.height - 1) {
                    bombs.splice(b, 1);
                } else if (bomb.y >= (game.height - 1 - groundHeight) && ground[bomb.y - (game.height - 1 - groundHeight)][bomb.x] == characters.ground) {
                    replaceGround(bomb, 0);
                    if (player.y == bomb.y - 1 && player.x == bomb.x) {
                        explode.play();
                        exit();
                    }
                    if (!drill) {
                        bombs.splice(b, 1);
                    }

                }
            }
        }

        //DRAW
        function draw() {
            grid = generateGrid();
            term.clear();
            term.echo("Press x to exit");
            term.set_command("");
            for (i in grid) {
                if (grid[i] && grid[i].length > game.width) {
                    console.log("Too Long");
                }
                term.echo(grid[i]);
            }
        }
    }
}
var pingloushay = {};
var amperShoot = {
    "play": function (term, id) {
        //CONSTS
        const characters = {
            player: "@"
        }
        var game = {
            width: term.cols(),
            height: term.rows() - 2,
            fps: 60
        }

        //SETUP
        var player = {
            x:0,
            y: 0
        };

        //FUNCTIONS

        //EVENTS

        //LOOP
        function loop() {
            update();
            draw();
        }
        var timer = setInterval(loop, 1000/fps);

        //UPDATE
        function update() {

        }

        //DRAW
        function draw() {
            
        }

    }
}