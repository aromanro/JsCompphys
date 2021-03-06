(function () {
    let canvas = document.getElementById("Canvas");
    let chart = document.getElementById("Chart");

    canvas.width = Math.min(window.innerWidth - 50, window.innerHeight - 50);
    if (canvas.width < 300) canvas.width = 300;
    else if (canvas.width > 800) canvas.width = 800;
    canvas.height = canvas.width;

    chart.width = canvas.width;
    chart.height = chart.width / 3;

    let ctx = canvas.getContext("2d");
    let canvasText = document.getElementById("canvasText");

    let ctxChart = chart.getContext("2d");
    ctxChart.strokeStyle = "#FF0000";
    ctxChart.lineWidth = 4;

    let people = [];

    // some parameters
    const nrPeople = 500;
    const speed = canvas.width / 50;
    const radius = canvas.width / 100;
    const deltat = 0.01;
    let cureTime = 5.0;
    const deathProb = 0.05;
    const infectProb = 1.0;

    let chartPosX = 0;
    let chartValY = 0;
    const chartXScale = 0.1;
    const chartYScale = chart.height / nrPeople;

    // statistics
    let deaths = 0;
    let infections = 1;
    let cures = 0;

    function Init() {
        deaths = 0;
        infections = 1;
        cures = 0;
        people = [];
        chartPosX = 0;
        chartValY = 0;

        for (let i = 0; i < nrPeople; ++i) {
            let person =
            {
                posX: 0,
                posY: 0,
                velX: 0,
                velY: 0,
                dead: false,
                infected: false,
                cured: false,
                infectedTime: 0.0,

                NormalizeVelocity: function () {
                    const len = Math.sqrt(this.velX * this.velX + this.velY * this.velY);
                    this.velX /= len;
                    this.velY /= len;
                },

                Distance: function (other) {
                    const distX = this.posX - other.posX;
                    const distY = this.posY - other.posY;

                    return Math.sqrt(distX * distX + distY * distY);
                },

                Collision: function (other) {
                    const dist = this.Distance(other);

                    return dist <= 2 * radius;
                },

                Collide: function (other) {
                    let velXdif = this.velX - other.velX;
                    let velYdif = this.velY - other.velY;

                    let posXdif = this.posX - other.posX;
                    let posYdif = this.posY - other.posY;

                    const dist2 = posXdif * posXdif + posYdif * posYdif;
                    let dotProd = velXdif * posXdif + velYdif * posYdif;
                    dotProd /= dist2;

                    this.velX -= dotProd * posXdif;
                    this.velY -= dotProd * posYdif;

                    other.velX += dotProd * posXdif;
                    other.velY += dotProd * posYdif;
                }
            };

            for (; ;) {
                const X = Math.floor(Math.random() * (canvas.width - 2 * radius)) + radius;
                const Y = Math.floor(Math.random() * (canvas.height - 2 * radius)) + radius;

                person.posX = X;
                person.posY = Y;

                let overlap = false;
                for (let j = 0; j < i; ++j) {
                    let person2 = people[j];
                    if (person2.Collision(person)) {
                        overlap = true;
                        break;
                    }
                }
                if (!overlap) break;
            }

            person.velX = Math.random() - 0.5;
            person.velY = Math.random() - 0.5;
            person.NormalizeVelocity();
            person.velX *= speed;
            person.velY *= speed;

            if (i === 0) person.infected = true;

            people.push(person);
        }
    }

    Init();

    function CollideWithWalls(person) {
        if (person.posX <= radius) {
            person.velX *= -1;
            person.posX = radius;
        }
        else if (person.posX >= canvas.width - radius) {
            person.velX *= -1;
            person.posX = canvas.width - radius;
        }

        if (person.posY <= radius) {
            person.velY *= -1;
            person.posY = radius;
        }
        else if (person.posY >= canvas.height - radius) {
            person.velY *= -1;
            person.posY = canvas.height - radius;
        }
    }

    function CollideWithOthers(person, i) {
        for (let j = 0; j < i; ++j) {
            let person2 = people[j];
            if (person2.dead) continue;

            if (person.Collision(person2)) {
                person.Collide(person2);

                if (person.infected && !person2.infected && !person2.cured) {
                    if (Math.random() < infectProb) {
                        person2.infected = true;
                        ++infections;
                    }
                }
                else if (person2.infected && !person.infected && !person.cured) {
                    if (Math.random() < infectProb) {
                        person.infected = true;
                        ++infections;
                    }
                }
            }
        }
    }

    function Advance() {
        // for each from the population
        for (let i = 0; i < nrPeople; ++i) {
            let person = people[i];
            if (person.dead) continue;

            // move

            person.posX += person.velX * deltat;
            person.posY += person.velY * deltat;

            // collide / infect / cure

            CollideWithWalls(person);

            // keep track of how long the infection lasts
            if (person.infected)
                person.infectedTime += deltat;

            // collisions and infections between them
            CollideWithOthers(person, i);

            // cure
            if (person.infected && person.infectedTime > cureTime) {
                person.infected = false;
                person.cured = true;
                ++cures;
            }

            // kill
            if (person.infected && person.infectedTime > cureTime / 3.0) {
                if (Math.random() < deathProb * deltat / (cureTime * 2.0 / 3.0)) {
                    person.dead = true;
                    ++deaths;
                }
            }
        }

        DisplayPopulation();
    }

    function DisplayPopulation() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        for (let i = 0; i < nrPeople; ++i) {
            const person = people[i];
            if (person.dead) continue;
            ctx.beginPath();
            ctx.arc(person.posX, person.posY, radius, 0, 2 * Math.PI, false);
            ctx.fillStyle = person.infected ? 'red' : (person.cured ? 'green' : 'blue');
            ctx.fill();
            ctx.stroke();
        }

        canvasText.innerHTML = "Total: " + nrPeople + " Infected: " + infections + " Deaths: " + deaths + " Cured: " + cures + " Sick: " + (infections - cures - deaths);

        ctxChart.beginPath();
        ctxChart.moveTo(chartPosX * chartXScale, chart.height - chartValY * chartYScale);
        ++chartPosX;
        chartValY = infections;
        ctxChart.lineTo(chartPosX * chartXScale, chart.height - chartValY * chartYScale);
        ctxChart.stroke();

        if (infections - deaths == cures) // there is no more left to cure
        {
            ctxChart.clearRect(0, 0, chart.width, chart.height);
            Init();
        }
    }

    setInterval(Advance, 10);
})();
