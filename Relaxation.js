(function() {

 function SquareModel(Size)
 {
    this.Size = Size;
    this.field = [];

    this.IndexForSize = function(row, col, size) { return size*row+col; };
    this.Index = function(row, col) { return this.IndexForSize(row, col, this.Size); };
    this.Value = function(matrix, row, col) { return matrix[this.Index(row, col)]; };
    this.Boundary = function(row, col) { return row === 0 || col === 0 || row === this.Size - 1 || col === this.Size - 1; };
    this.Field = function(row, col) { return this.field[this.Index(row, col)]; };

    this.SetBoundary = function() {
        for (i = 1; i < this.Size - 1; ++i)
        {        
            // two borders to -1, two 1           
            this.field[this.Index(0, i)] = -1;
            this.field[this.Index(this.Size - 1, i)] = -1;
            this.field[this.Index(i, this.Size - 1)] = 1;
            this.field[this.Index(i, 0)] = 1;
        }
    };

    this.Init = function() {
        for (i = 0; i < this.Size; ++i)
           for (j = 0; j < this.Size; ++j)
               this.field[this.Index(i, j)] = 0;
        this.SetBoundary();        
    }

    this.Init();
 }

 function Relaxation(relaxationModel) 
 {
    this.StartSize = relaxationModel.Size;
    this.iteration = 1;
    this.newField = [];
    this.model = relaxationModel;    

    this.SwapFields = function() {
         tmp = this.model.field;
         this.model.field = this.newField;
         this.newField = tmp; 
    };

    this.MakeGridSmaller = function() {
        // make a smaller grid by interpolating the values from the source
        for (i = 0 ; i < this.model.Size; ++i)
           for (j = 0 ; j < this.model.Size; ++j)
           {
              this.newField[this.model.IndexForSize(2*i, 2*j, this.model.Size*2)] = this.model.Field(i, j);

              this.newField[this.model.IndexForSize(2*i+1, 2*j, this.model.Size*2)] = (this.model.Field(i, j) + (i<this.model.Size - 1 ? this.model.Field(i+1, j) : this.model.Field(i, j)))/2;
              this.newField[this.model.IndexForSize(2*i, 2*j+1, this.model.Size*2)] = (this.model.Field(i, j) + (j<this.model.Size - 1 ? this.model.Field(i, j+1) : this.model.Field(i, j)))/2;


              this.newField[this.model.IndexForSize(2*i+1, 2*j+1, this.model.Size*2)] = (this.model.Field(i, j) + (i<this.model.Size - 1 ? this.model.Field(i+1, j) : this.model.Field(i, j)) +
                                      (j<this.model.Size - 1 ? this.model.Field(i, j+1) : this.model.Field(i, j)) + 
                                      (i<this.model.Size - 1 && j<this.model.Size - 1 ? this.model.Field(i+1, j+1) : this.model.Field(i, j)))/4;

              // the above is not quite correct for the rightmost column and last row, but it doesn't matter, SetBoundary should set them to the correct values, anyway
           }

       this.SwapFields();
       this.model.Size *= 2;
       this.model.SetBoundary();  
    };
   
    this.Reset = function() {
        this.model.Size = this.StartSize;
        this.model.Init();
        this.iteration = 1;
    };

    this.Relax = function() {
        change = 0;
        for (i = 0 ; i < this.model.Size; ++i)
           for (j = 0 ; j < this.model.Size; ++j)
               if (!this.model.Boundary(i, j)) 
               {
                  oldVal = this.model.Field(i, j);
                  newVal = (this.model.Field(i - 1, j) + this.model.Field(i, j - 1) + this.model.Field(i, j + 1) + this.model.Field(i + 1, j))/4.0;
                  this.model.field[this.model.Index(i, j)] = newVal;
                  dif = oldVal - newVal;
                  change += dif * dif;
               }

        ++this.iteration;
        
        return Math.sqrt(change);
    };
 }

  function DisplayModel(canvas, model) {
        function Color(val) {
          r = 0;
          g = 0;
          b = 0;
          if (val > 0)
          {
              r = Math.ceil(255.0 * val);
              g = Math.floor(255.0 * (1.0 - val));
          }
          else
          {
             val *= -1;
             g = Math.floor(255.0 * (1.0 - val));
             b = Math.ceil(255.0 * val);
          }
 
          return "rgb(" + r.toString() + "," + g.toString() + "," + b.toString() + ")";
        }
  
        ctx = canvas.getContext("2d");
        displaySize = canvas.width / model.Size;
        rectSize = Math.ceil(displaySize);
        
        for (i = 0 ; i < model.Size; ++i)
           for (j = 0 ; j < model.Size; ++j)
           {
               ctx.fillStyle = Color(model.Field(i, j));               
               ctx.fillRect(j * displaySize, i * displaySize, rectSize, rectSize);               
           }
 }


 ParticularModel1 = new SquareModel(8);
 Relaxation1 = new Relaxation(ParticularModel1);
 canvas = document.getElementById("relaxationCanvas");
 
 function Tick() {    
    DisplayModel(canvas, Relaxation1.model);
    error = Relaxation1.Relax();

    if (error / (Relaxation1.model.Size * Relaxation1.model.Size) < 1.0e-7)
    {
       Relaxation1.MakeGridSmaller();
       if (Relaxation1.model.Size === 256) Relaxation1.Reset();
    }
 }

 setInterval(Tick, 10);
})();
