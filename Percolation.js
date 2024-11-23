var perc = (function () {
    var canvas = document.getElementById("percolationCanvas");
    var ctx = canvas.getContext("2d");
    var percolationText = document.getElementById("percolationText");

    var percolation = {
        Size: 64,
        grid: [],
        probability: 0.5,
        clusters: [],
        displaySize: canvas.width / 64,

        Init: function () {
            var nr = this.Size * this.Size;
            this.probability = Math.random() / 8 + 0.5;
            this.grid = new Array(nr);
            for (var i = 0; i < nr; ++i) this.grid[i] = Math.random() < this.probability;
        },

        Find: function (parents, c) {
            while (parents[c] != c) {
                parents[c] = parents[parents[c]];
                c = parents[c];
            }
            return c;
        },

        Union: function (parents, ranks, i1, j1, i2, j2, c) {
            var ind1 = i1 * this.Size + j1;
            var ind2 = i2 * this.Size + j2;
            if (i2 < 0 || i2 >= this.Size || j2 < 0 || j2 >= this.Size || !this.grid[ind1] || !this.grid[ind2])
                return c;

            var c1 = this.clusters[ind1];
            var c2 = this.clusters[ind2];
            if (c1 == 0 && c2 == 0) {
                this.clusters[ind1] = c;
                this.clusters[ind2] = c;
                parents[c] = c;
                ++c;
            }
            else if (c1 == 0 && c2 != 0)
                this.clusters[ind1] = c2;
            else if (c1 != 0 && c2 == 0)
                this.clusters[ind2] = c1;
            else {
                c1 = this.Find(parents, c1);
                c2 = this.Find(parents, c2);
                if (c1 != c2) {
                    if (ranks[c1] < ranks[c2])
						[c1, c2] = [c2, c1];
                    parents[c2] = c1;
                    if (ranks[c1] == ranks[c2])
                        ++ranks[c1];
                }
            }

            return c;
        },

        Compute: function () {
            var nr = this.Size * this.Size;

            this.clusters = new Array(nr).fill(0);
            var parents = new Array(nr).fill(0);
            var ranks = new Array(nr).fill(0);
            var c = 1;

            for (let i = 0; i < this.Size; ++i) {
                for (let j = 0; j < this.Size; ++j) {
                    if (this.grid[i * this.Size + j]) {
                        c = this.Union(parents, ranks, i, j, i, j + 1, c);
                        c = this.Union(parents, ranks, i, j, i + 1, j, c);
                    }
                }
            }

            for (let i = 0; i < this.Size; ++i) {
                for (let j = 0; j < this.Size; ++j) {
                    let ind = i * this.Size + j;
                    if (this.clusters[ind] != 0) this.clusters[ind] = this.Find(parents, this.clusters[ind]);
                    else if (this.grid[ind]) this.clusters[ind] = c++; // this is only for visual purposes, marks as clusters even clusters with a single site... does not exist in the fortran code
                }
            }
        },

        Percolates: function () {
            let offset = this.Size * (this.Size - 1);
            for (let i = 0; i < this.Size; ++i)
                for (let j = 0; j < this.Size; ++j)
                    if (this.clusters[i] != 0 && this.clusters[i] == this.clusters[offset + j])
                        return true;
            return false;
        },

        HSVtoRGB: function (h, s, v) {
            const C = v * s;
            const Hp = h / 60;
            const X = C * (1 - Math.abs(Hp % 2 - 1));
            let r = 0;
            let g = 0;
            let b = 0;

            if (Hp < 1) {
                r = C;
                g = X;
                b = 0;
            } else if (Hp < 2) {
                r = X;
                g = C;
                b = 0;
            } else if (Hp < 3) {
                r = 0;
                g = C;
                b = X;
            } else if (Hp < 4) {
                r = 0;
                g = X;
                b = C;
            } else if (Hp < 5) {
                r = X;
                g = 0;
                b = C;
            } else {
                r = C;
                g = 0;
                b = X;
            }

            const m = v - C;
            r += m;
            g += m;
            b += m;

            r = Math.floor(256 * r);
            g = Math.floor(256 * g);
            b = Math.floor(256 * b);

            return ((r << 16) | (g << 8) | b);
        },

        GetHue: function (r, g, b) {
            const V = Math.max(r, g, b);
            const C = V - Math.min(r, g, b);
            let h = 0;
            if (C != 0) {
                if (V == r) h = ((g - b) / C) % 6;
                else if (V == g) h = (b - r) / C + 2;
                else h = (r - g) / C + 4;
            }

            return 60 * h;
        },

        Display: function (ctx) {
            const clustersSet = new Set();
            for (let i = 0; i < this.Size; ++i)
                for (let j = 0; j < this.Size; ++j)
                    clustersSet.add(this.clusters[i * this.Size + j]);

            const colorsClusters = new Map();
            colorsClusters.set(0, '#FFFFFF');
            for (const cluster of clustersSet) {
                if (cluster == 0) continue;
                var unique = false;
                let cnt = 0;
                do {
                    unique = true;
                    const hue = 360 * Math.random();
                    const s = 0.5 + Math.random() / 2;
                    const v = 0.8 + Math.random() / 5;
                    let c = this.HSVtoRGB(hue, s, v);

                    colorsClusters.set(cluster, '#' + ('000000' + c.toString(16)).slice(-6));

                    for (const otherCluster of colorsClusters.keys()) {
                        if (otherCluster == cluster || otherCluster == 0) continue;
                        const ocolor = parseInt(colorsClusters.get(otherCluster).substr(1), 16);
                        const or = (ocolor >> 16);
                        const og = ((ocolor >> 8) & 0xFF);
                        const ob = (ocolor & 0xFF);
                        const ohue = this.GetHue(or, og, ob);
                        if (Math.abs(ohue - hue) < 1) {
                            unique = false;
                            break;
                        }
                    }

                    if (++cnt > 1000) break;
                } while (!unique);
            }

            let sz = this.displaySize * this.Size;
            ctx.clearRect(0, 0, sz, sz);
            for (let i = 0; i < this.Size; ++i)
                for (let j = 0; j < this.Size; ++j) {
                    let ind = j * this.Size + i;
                    ctx.fillStyle = colorsClusters.get(this.clusters[ind]);
                    ctx.fillRect(i * this.displaySize, j * this.displaySize, this.displaySize, this.displaySize);
                }

            // compute the value for 'probability' of what is actually in the grid
            let cnt = 0;
            for (let i = 0; i < this.Size; ++i)
                for (let j = 0; j < this.Size; ++j)
                    if (this.grid[i * this.Size + j]) ++cnt;

            let displayProb = cnt / (this.Size * this.Size);

            percolationText.innerHTML = 'Probability: ' + (displayProb * 100).toPrecision(3) + '%&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;' + 'Percolates: ' + (this.Percolates() ? 'yes' : 'no');
        }
    };

    return function () {
        percolation.Init();
        percolation.Compute();
        percolation.Display(ctx);
    }
})();

perc();
setInterval(perc, 5000);
