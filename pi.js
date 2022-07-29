(function() {
 let piText = document.getElementById("piText");
 let canvas = document.getElementById("piCanvas");
 let ctx = canvas.getContext("2d");

 const radius = canvas.height / 2.0;
 ctx.translate(radius, radius);

 let totalPoints = 0;
 let insidePoints = 0;

 function randomPoint() {
    const x = 2.0*Math.random()-1; 
    const y = 2.0*Math.random()-1;

    const p = x*x + y*y;
    if (p < 1) {
        ctx.fillStyle = "#FF0000";
        ++insidePoints;
    }
    else ctx.fillStyle = "#444444";
  
    ++totalPoints;
    ctx.fillRect(radius*x-1,radius*y-1,2,2);

    if (totalPoints % 100 === 0)
    {
       const piApprox = insidePoints / totalPoints * 4;
       piText.innerHTML = piApprox.toPrecision(3);
       if (piText.innerHTML == "3.14")
       {
           totalPoints = 0;
           insidePoints = 0;

           ctx.clearRect(-radius, -radius, canvas.width, canvas.height);
       }
    }
 }

 setInterval(randomPoint, 10);
})();
