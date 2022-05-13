(function () {
    var canvas = document.getElementById("Canvas");
    var chart = document.getElementById("Chart");

    canvas.width = Math.min(window.innerWidth - 50, window.innerHeight - 50);
    if (canvas.width < 300) canvas.width = 300;
    else if (canvas.width > 800) canvas.width = 800;
    canvas.height = canvas.width;

    chart.width = canvas.width;
    chart.height = chart.width / 3;

    var ctx = canvas.getContext("2d");
    var canvasText = document.getElementById("canvasText");

    var ctxChart = chart.getContext("2d");
    ctxChart.strokeStyle = "#FF0000";
    ctxChart.lineWidth = 4;

    var people = [];

    // some parameters
    var nrPeople = 500;
    var speed = canvas.width / 50;
    var radius = canvas.width / 100;
    var deltat = 0.01;
    var cureTime = 5.;
    var deathProb = 0.05;
    var infectProb = 1.;

    var chartPosX = 0;
    var chartValY = 0;
    var chartXScale = 0.1;
    var chartYScale = chart.height / nrPeople;

    // statistics
    var deaths = 0;
    var infections = 1;
    var cures = 0;

    function Init() {
        deaths = 0;
        infections = 1;
        cures = 0;
        people = [];
        chartPosX = 0;
        chartValY = 0;

        for (i = 0; i < nrPeople; ++i) {
            var person =
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
                    var len = Math.sqrt(this.velX * this.velX + this.velY * this.velY);
                    this.velX /= len;
                    this.velY /= len;
                },

                Distance: function (other) {
                    var distX = this.posX - other.posX;
                    var distY = this.posY - other.posY;

                    return Math.sqrt(distX * distX + distY * distY);
                },

                Collision: function (other) {
                    var dist = this.Distance(other);

                    return dist <= 2. * radius;
                },

                Collide: function (other) {
                    var velXdif = this.velX - other.velX;
                    var velYdif = this.velY - other.velY;

                    var posXdif = this.posX - other.posX;
                    var posYdif = this.posY - other.posY;

                    var dist2 = posXdif * posXdif + posYdif * posYdif;
                    var dotProd = velXdif * posXdif + velYdif * posYdif;
                    dotProd /= dist2;

                    this.velX -= dotProd * posXdif;
                    this.velY -= dotProd * posYdif;

                    other.velX += dotProd * posXdif;
                    other.velY += dotProd * posYdif;
                }
            };

            for (; ;) {
                var X = Math.floor(Math.random() * (canvas.width - 2. * radius)) + radius;
                var Y = Math.floor(Math.random() * (canvas.height - 2 * radius)) + radius;

                person.posX = X;
                person.posY = Y;

                overlap = false;
                for (j = 0; j < i; ++j) {
                    var person2 = people[j];
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

            if (i == 0) person.infected = true;

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
        for (j = 0; j < i; ++j) {
            var person2 = people[j];
            if (person2.dead) continue;

            if (person.Collision(person2)) {
                person.Collide(person2);

                if (person.infected && !person2.infected && !person2.cured) {
                    if (Math.random() < infectProb)
                    {
                       person2.infected = true;
                       ++infections;
                    }
                }
                else if (person2.infected && !person.infected && !person.cured) {
                    if (Math.random() < infectProb)
                    {
                       person.infected = true;
                       ++infections;
                    }
                }
            }
        }		
	}

    function Advance() {
        // for each from the population
        for (i = 0; i < nrPeople; ++i) {
            var person = people[i];
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
            if (person.infected && person.infectedTime > cureTime / 3.) {
                if (Math.random() < deathProb * deltat / (cureTime * 2. / 3.)) {
                    person.dead = true;
                    ++deaths;
                }
            }
        }

		DisplayPopulation();
    }
	
	function DisplayPopulation() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        for (i = 0; i < nrPeople; ++i) {
            var person = people[i];
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
