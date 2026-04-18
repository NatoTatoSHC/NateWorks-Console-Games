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
            player: "@",
            air: " ",
            bullet: {
                x: "-",
                y: "|"
            },
            ampersand: "&"
        }
        var game = {
            width: term.cols(),
            height: term.rows() - 2,
            fps: 60
        }
        const shootCooldown = 30;
        const maxAmpersands = 5;
        const ampersandMovementPause = 10;

        //SETUP
        var player = {
            x:0,
            y: 0,
            velocity: {
                x: 0,
                y: 0
            },
            bullets: [],
            shootTimeout: 0
        };
        var grid = generateGrid();
        var ampersands = [];
        var iteration = 0;

        //FUNCTIONS
        function generateGrid() {
            let ret = [];
            for (let i = 0; i < game.height; i++) {
                let str = characters.air.repeat(game.width);
                player.bullets.forEach(bullet => {
                    if (i == bullet.y) {
                        str = str.slice(0, bullet.x) + bullet.character + str.slice(bullet.x + 1);
                    }
                });
                for (a in ampersands) {
                    let ampersand = ampersands[a];
                    if (i == ampersand.y) {
                        str = str.slice(0, ampersand.x) + characters.ampersand + str.slice(ampersand.x + 1);
                    }
                }
                if (i == player.y) {
                    str = str.slice(0, player.x) + characters.player + str.slice(player.x + 1);
                }
                ret.push(str);
            }
            return ret;
        }
        function exit() {
            clearInterval(timer);
            term.off("keydown");
            term.off("keyup");
            setTimeout(() => {term.reset();}, 500)
        }


        //EVENTS
        term.on("keydown", (e) => {
            switch(e.key) {
                case 'e':
                    if (player.velocity.x != 0 && player.velocity.y == 0 && player.shootTimeout <= 0) {
                        let newBullet = {
                            character: characters.bullet.x,
                            x: player.x,
                            y: player.y,
                            velocity: {
                                x: player.velocity.x * 2,
                                y: 0
                            }
                        };
                        player.bullets.push(newBullet);
                        player.shootTimeout  = shootCooldown;
                    } else if (player.velocity.y != 0 && player.velocity.x == 0 && player.shootTimeout <= 0) {
                        let newBullet = {
                            character: characters.bullet.y,
                            x: player.x,
                            y: player.y,
                            velocity: {
                                x: 0,
                                y: player.velocity.y * 2
                            }
                        };
                        player.bullets.push(newBullet);
                        player.shootTimeout  = shootCooldown;
                    }
                    break;
                case 'x':
                    exit();
                    break;
                case 's':
                    player.velocity.y = 1;
                    break;
                case 'w':
                    player.velocity.y = -1;
                    break;
                case 'a':
                    player.velocity.x = -1;
                    break;
                case 'd':
                    player.velocity.x = 1;
                    break;

            }
        });
        term.on("keyup", (e) => {
            if (['w', 's'].includes(e.key)) {
                player.velocity.y = 0;
            }
            if (['a', 'd'].includes(e.key)) {
                player.velocity.x = 0;
            }
            if (e.key == "e") {
                player.shooting = false;
            }
        });

        //LOOP
        function loop() {
            iteration += 1;
            update();
            draw();
        }
        var timer = setInterval(loop, 1000/game.fps);

        //UPDATE
        function update() {
            //Player Movement
            //Up Down
            let letYMove = (player.velocity.y > 0 && player.y < game.height - 1) || (player.velocity.y < 0 && player.y > 0);
            if (letYMove) {
                player.y += player.velocity.y;
            }
            //Left Right
            let letXMove = (player.velocity.x > 0 && player.x < game.width - 1) || (player.velocity.x < 0 && player.x > 0);
            if (letXMove) {
                player.x += player.velocity.x;
            }
            
            //Shooting
            player.shootTimeout -= 1;            

            //Bullet Movement
            for (b in player.bullets) {
                let bullet = player.bullets[b];
                bullet.x += bullet.velocity.x;
                bullet.y += bullet.velocity.y;
                if (bullet.velocity.x && (bullet.x <= 0 || bullet.x >= game.width - 1)) {
                    player.bullets.splice(b, 1);
                } else if (bullet.velocity.y && (bullet.y <= 0 || bullet.y >= game.height - 1)) {
                    player.bullets.slice(b, 1);
                }
            }

            //Ampersand Spawner
            if (ampersands.length < maxAmpersands) {
                //Choose Wall
                let bitX = Math.round(Math.random());
                let bitY = 0;
                if (bitX == 0) {bitY = 1;} else {bitY = 0;}
                //Create Ampersand
                let newAmpersand = {
                    x: bitX * Math.round(Math.random()*game.width - 1),
                    y: bitY * Math.round(Math.random()*game.height - 1)
                };
                if (newAmpersand.x != 0 || newAmpersand.y != 0) {
                    ampersands.push(newAmpersand);
                }
            }

            //Ampersand Update
            for (a in ampersands) {
                let ampersand = ampersands[a];
                //Ampersand AI
                if ((iteration % ampersandMovementPause) === 0) {
                    let xRel = ampersand.x - player.x;
                    let yRel = ampersand.y - player.y;
                    let xDis = Math.abs(xRel);
                    let yDis = Math.abs(yRel);
                    if (xDis > yDis && xRel) {
                        ampersand.x -= (xRel / Math.abs(xRel));
                    } else if (yRel) {
                        ampersand.y -= (yRel / Math.abs(yRel));
                    }
                    
                }

                //Ampersand Death
                for (b in player.bullets) {
                    let bullet = player.bullets[b];
                    if (bullet.velocity.x && (bullet.x == ampersand.x || bullet.x + 1 == ampersand.x) && bullet.y == ampersand.y) {
                        player.bullets.splice(b, 1);
                        ampersands.splice(a, 1);
                    }
                    if (bullet.velocity.y && bullet.x == ampersand.x && (bullet.y == ampersand.y || bullet.y + 1 == ampersand.y)) {
                        player.bullets.splice(b, 1);
                        ampersands.splice(a, 1);
                    }
                }

                //Player Killing
                if (player.x == ampersand.x && player.y == ampersand.y) {
                    exit();
                }
            }

        }

        //DRAW
        function draw() {
            grid = generateGrid();
            term.clear();
            term.set_command("");
            for (l in grid) {
                term.echo(grid[l]);
            }

        }

    }
}
var superNateJumper = {
    "play": function (term, id){
        //CONSTS
        const game = {
            width: term.cols(),
            height: term.rows() - 3,
            fps: 60
        };
        const characters = {
            air: " "
        }
        //SETUP
        var grid = generateGrid();
        var iteration = 0;
        //FUNCTIONS
        function addRenderer(str, index, character) {
            return str.slice(0, index) + character + str.slice(index + 1);
        }
        function generateGrid() {
            let ret = [];
            for (let i = 0; i < game.height; i++) {
                let str = characters.air.repeat(game.width);
                // -- Add Renderers Here --
                ret.push(str);
            }
            return ret;
        }
        function exit() {
            clearInterval(timer);
            term.off("keydown");
            term.off("keyup");
            setTimeout(() => {
                term.reset();
            }, 500);
        }
        //EVENTS
        term.on("keydown", (e) => {
            switch(e.key) {
                case 'x':
                    exit();
                    break;
                // -- Add key down events here --
            }
        });
        term.on("keyup", (e) => {
            switch(e.key) {
                // -- Add key up events here --
            }
        });
        //LOOP
        function loop() {
            iteration++;
            update();
            draw();
        }
        var timer = setInterval(loop, 1000/game.fps);
        //UPDATE
        function update() {
            // -- Add Any Updates --
        }
        //DRAW
        function draw() {
            term.set_command("");
            term.clear();
            term.echo("Press x to exit");
            for (line in grid) {
                term.echo(grid[line]);
            }
        }
    }
}

var def = {
    "play": function (term, id){
        //CONSTS
        const game = {
            width: term.cols(),
            height: term.rows() - 3,
            fps: 60
        };
        const characters = {
            air: " "
        }
        //SETUP
        var grid = generateGrid();
        var iteration = 0;
        //FUNCTIONS
        function generateGrid() {
            let ret = [];
            for (let i = 0; i < game.height; i++) {
                let str = characters.air.repeat(game.width);
                // -- Add Renderers Here --
                ret.push(str);
            }
            return ret;
        }
        function exit() {
            clearInterval(timer);
            term.off("keydown");
            term.off("keyup");
            setTimeout(() => {
                term.reset();
            }, 500);
        }
        //EVENTS
        term.on("keydown", (e) => {
            switch(e.key) {
                case 'x':
                    exit();
                    break;
                // -- Add key down events here --
            }
        });
        term.on("keyup", (e) => {
            switch(e.key) {
                // -- Add key up events here --
            }
        });
        //LOOP
        function loop() {
            iteration++;
            update();
            draw();
        }
        var timer = setInterval(loop, 1000/game.fps);
        //UPDATE
        function update() {
            // -- Add Any Updates --
        }
        //DRAW
        function draw() {
            term.set_command("");
            term.clear();
            term.echo("Press x to exit");
            for (line in grid) {
                term.echo(grid[line]);
            }
        }
    }
}