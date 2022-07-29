(function() {
 var piText = document.getElementById("piText");
 var canvas = document.getElementById("piCanvas");
 var ctx = canvas.getContext("2d");

 var radius = canvas.height / 2.0;
 ctx.translate(radius, radius);

 var totalPoints = 0;
 var insidePoints = 0;

 function randomPoint() {
    var x = 2.*Math.random()-1; 
    var y = 2.*Math.random()-1;

    var p = x*x + y*y;
    if (p < 1) {
        ctx.fillStyle = "#FF0000";
        ++insidePoints;
    }
    else ctx.fillStyle = "#444444";
  
    ++totalPoints;
    ctx.fillRect(radius*x-1,radius*y-1,2,2);

    if (totalPoints % 100 === 0)
    {
       var piApprox = insidePoints / totalPoints * 4;
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
