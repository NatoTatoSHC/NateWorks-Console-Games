var trivia = {
    "play": function (term, id) {
        const games = {
            "animal_groups":{
                "template":"What is a group of <1> called?",
                "title":"Animal Groups",
                "questions":{
                    "parrots":{
                        "possible":[
                            "Flock",
                            "Rainbow",
                            "Pandemonium",
                            "Jungle"
                        ],
                        "answer":2
                    },
                    "gorrillas":{
                        "possible":[
                            "Assembly",
                            "Band",
                            "Explosion",
                            "Hammer"
                        ],
                        "answer":1,
                    },
                    "racoons": {
                        "possible": [
                            "Gaze",
                            "Rustle",
                            "Garbage",
                            "Herd"
                        ],
                        "answer":0
                    },
                    "hyenas": {
                        "possible": [
                            "Gang",
                            "Laugh",
                            "Jump",
                            "Cackle"
                        ],
                        "answer":3
                    }
                }
            }
        }
        function commandGenerator() {
            var int = {};
            Object.keys(games).forEach(game => {
                int[game] = async function () {
                    this.echo("Trivia: "+games[game].title);
                    this.echo();
                    let questions = games[game].questions;
                    const testLength = Object.keys(questions).length;
                    var correct = 0;
                    let questionNumber = 1;
                    while (Object.keys(questions).length > 0) {
                        this.echo("Question "+questionNumber.toString()+".");
                        let randomQ = Math.round(Math.random()*(Object.keys(questions).length - 1));
                        let str = "";
                        if (games[game].template) {
                            str = games[game].template.replace("<1>", Object.keys(questions)[randomQ]);
                        } else {
                            str = Object.keys(questions)[randomQ];
                        }
                        this.echo(str);
                        questions[Object.keys(questions)[randomQ]].possible.forEach(ans => {
                            this.echo((questions[Object.keys(questions)[randomQ]].possible.indexOf(ans)+1)+". "+ans);
                        });
                        await this.read("Enter a number 1-4: ").then(ans => {
                        if (Number(ans)-1 == questions[Object.keys(questions)[randomQ]].answer) {
                            correct += 1;
                            this.echo("Correct");
                        } else {
                            this.echo("Incorrect");
                        }
                        });
                        delete questions[Object.keys(questions)[randomQ]];
                        questionNumber += 1;
                        this.echo()
                    }
                    this.echo("Score: "+correct+"/"+testLength);
                    await this.read("Press Enter To Continue...");
                    this.pop();
                    this.reset();
                }
            });
            int.games = function () {
                Object.keys(games).forEach(game => this.echo(game));
                this.echo();
            }
            return int;
        }
        term.push(commandGenerator());
        term.set_prompt(id+"> ");
    }
}