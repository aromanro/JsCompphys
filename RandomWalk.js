(function () {
    let canvas = document.getElementById("randomWalkCanvas");
    let ctx = canvas.getContext("2d");
    ctx.strokeStyle = "#000088";

    const dist = canvas.height / 2.0;
    ctx.translate(dist, dist);

    let posX = 0;
    let posY = 0;

    function randomWalk() {
        const dir = Math.floor(Math.random() * 2);
        const sense = Math.floor(Math.random() * 2);

        ctx.beginPath();
        ctx.moveTo(posX, posY);

        if (dir === 0)
            posX += (sense ? 1 : -1) * 4;
        else
            posY += (sense ? 1 : -1) * 4;

        ctx.lineTo(posX, posY);
        ctx.stroke();

        if (Math.abs(posX) > dist || Math.abs(posY) > dist) {
            posX = 0;
            posY = 0;
            ctx.clearRect(-dist, -dist, canvas.width, canvas.height);
        }
    }

    setInterval(randomWalk, 50);
})();
