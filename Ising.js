let monteCarlo = (function () {
    let canvas = document.getElementById("monteCarloCanvas");
    let ctx = canvas.getContext("2d");

    let isingSpins = {
        Size: 64,
        Temperature: 2.26918531421 / 0.95,
        spins: [],
        displaySize: canvas.width / 64,
        Spin: function (row, col) { return this.spins[this.Size * row + col]; },
        Index: function (index) { return index < 0 ? index + this.Size : index % this.Size; },
        Neighbor: function (row, col) { return this.Spin(this.Index(row), this.Index(col)); },
        NeighborContribution: function (row, col) { return this.Neighbor(row - 1, col) + this.Neighbor(row + 1, col) + this.Neighbor(row, col - 1) + this.Neighbor(row, col + 1); },
        ExpMinusBetaE: function (E) { return Math.exp(-1.0 / this.Temperature * E); },
        EnergyDifForFlip: function (row, col) { return 2 * this.Spin(row, col) * this.NeighborContribution(row, col); },
        Init: function () {
            let nr = this.Size * this.Size;
            for (let i = 0; i < nr; ++i) this.spins.push(Math.random() < 0.5 ? -1 : 1);
        },
        Sweep: function () {
            let nr = this.Size * this.Size;

            for (let i = 0; i < nr; ++i) {
                let row = Math.floor(Math.random() * this.Size);
                let col = Math.floor(Math.random() * this.Size);

                let energyDif = this.EnergyDifForFlip(row, col);
                if (energyDif < 0) this.spins[this.Size * row + col] *= -1;
                else {
                    if (Math.random() < this.ExpMinusBetaE(energyDif))
                        this.spins[this.Size * row + col] *= -1;
                }
            }
        },
        Display: function (ctx) {
            for (let i = 0; i < this.Size; ++i)
                for (let j = 0; j < this.Size; ++j) {
                    if (this.Spin(i, j) < 0) ctx.fillStyle = "#FF0000";
                    else ctx.fillStyle = "#0000FF";

                    ctx.fillRect(i * this.displaySize, j * this.displaySize, this.displaySize, this.displaySize);
                }
        }
    };

    isingSpins.Init();

    return function () {
        isingSpins.Sweep();
        isingSpins.Display(ctx);
    }
})();

setInterval(monteCarlo, 100);
