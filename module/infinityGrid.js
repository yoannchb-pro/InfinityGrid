class Grid{
    constructor(json){
        this.body = json.body || document.body;
        this.width = json.width || 240;
        this.height = json.height || 171;
        this.create = json.createElementFunction;
        this.zoom = json.zoom || false;

        this.cardsList = [];
        this.mousePressed = false;
        this.lastMouseCoordinate = {x: false, y: false};
        this.mouseCoordinate = {x: false, y: false};

        //eviter la surcharge lors du redimensionnage
        this.bodyWidth = this.body.offsetWidth;
        this.bodyHeight = this.body.offsetHeight;

        //partie zoom
        this.basicWidth = this.width;
        this.basicHeight = this.height;
        this.isZooming = false;

        this.animation = json.animation || false;
        this.interval = false;

        this.mouse = json.mouse || false;

        this.velocityInterval = false;

        this.setUpGrid();
    }

    async moov(){
        for(var col=0; col<this.cardsList.length; col++){
            for(var lin=0; lin<this.cardsList[col].length; lin++){
                //selection element
                let element = this.cardsList[col][lin];

                let mouseX = this.mouseCoordinate.x-this.lastMouseCoordinate.x;
                let mouseY = this.mouseCoordinate.y-this.lastMouseCoordinate.y;

                //Change coodonée block
                element.newCoordinate(mouseX, mouseY);

                await this.colision(element,col,lin,mouseX,mouseY);
            }
        }
        this.lastMouseCoordinate = {x: this.mouseCoordinate.x, y: this.mouseCoordinate.y};
    }


    async colision(element,col,lin,mouseX,mouseY){

        /*Sortie X par la droite*/
        if(element.x>this.bodyWidth+this.width){
            let cache = col+1;
            cache = cache>this.cardsList.length-1 ? 0 : cache;
            let calc = this.cardsList[cache][0].x - this.width;
            if(col>cache){ //si sa colonne superieur à celle de sa nouvelle position alors le new Coordinate deja effectué
                element.x = calc;
            } else {
                element.x = calc + mouseX;
            }
            element.update(await this.create());
        }

        /*Sortie X par la gauche*/
        if(element.x<-this.width*2){
            let cache = col-1;
            cache = cache<0 ? this.cardsList.length-1 : cache;
            let calc = this.cardsList[cache][0].x + this.width;
            if(col>cache){ //si sa colonne superieur à celle de sa nouvelle position alors le new Coordinate deja effectué
                element.x = calc;
            } else {
                element.x = calc + mouseX;
            }
            element.update(await this.create());
        }

        /*Sortie Y par le bas*/
        if(element.y>this.bodyHeight+this.height){
            let cache = lin+1;
            cache = cache>this.cardsList[col].length-1 ? 0 : cache;
            let calc = this.cardsList[col][cache].y - this.height;
            if(lin>cache){ //si sa ligne superieur à celle de sa nouvelle position alors le new Coordinate deja effectué
                element.y = calc;
            } else {
                element.y = calc + mouseY;
            }
            element.update(await this.create());
        }
        
        /*Sortie Y par le haut*/
        if(element.y<-this.height*2){
            let cache = lin-1;
            cache = cache<0 ? this.cardsList[col].length-1 : cache;
            let calc = this.cardsList[col][cache].y + this.height;
            if(lin>cache){ //si sa ligne superieur à celle de sa nouvelle position alors le new Coordinate deja effectué
                element.y = calc;
            } else {
                element.y = calc + mouseY;
            }
            element.update(await this.create());
        }
    }

    async setCards(reset=false){
        /*
            Crée une liste de liste [[ligne,ligne], colonne]
        */
        if(reset){
            var cache = this.cardsList;
            this.cardsList = [];
        }
        for(var x= -this.width; x<(this.body.offsetWidth+this.width); x+=this.width){
            this.cardsList.push([])
            for(var y= -this.height; y<(this.body.offsetHeight+this.height); y+=this.height){
                let col = (x/this.width)+1;
                let lin = (y/this.height)+1;
                
                //reset
                if(reset){
                    let test = cache[col] && cache[col][lin];
                    var create = test ? cache[col][lin].element.innerHTML : await this.create();
                    if(test) cache[col][lin].element.remove();
                } else {
                    var create = await this.create();
                }

                let c = new CardGrid(x, y, create);
                c.display();
                c.element.style.width = this.width+"px";
                c.element.style.height = this.height+"px";
                this.body.appendChild(c.element);
                this.cardsList[this.cardsList.length-1].push(c);
            }
        }
    }

    async updateZoom(delta){
        if(this.isZooming) return;

        let cw = this.width+delta*5;
        let ch = this.height+delta*5;

        if(cw<=this.basicWidth/2 || cw>=this.basicWidth*2 || ch>=this.basicHeight*2 || ch<=this.basicHeight/2){
            //ne peut plus zoomer
        } else {
            this.isZooming = true;
            this.width = cw;
            this.height = ch;
            await this.setCards(true);
            this.isZooming = false;
        }
    }

    setUpGrid(){
        let grid = this;
        if(this.mouse){
            grid.body.style.cursor = "grabbing";

            /*SOURIS*/
            grid.body.addEventListener('mousedown', (event) => {
                grid.mousePressed = true;
                grid.lastMouseCoordinate = {x: event.clientX, y: event.clientY};
                if(grid.interval) {
                    clearInterval(grid.interval);
                    grid.interval = false;
                }
            });
            document.addEventListener('mouseup', () => {
                grid.mousePressed = false;
                grid.lastMouseCoordinate = {x: false, y: false};
                grid.setAnimation();
            });

            this.body.addEventListener('mouseleave', () => {
                grid.mousePressed = false;
                grid.lastMouseCoordinate = {x: false, y: false};
                grid.setAnimation();
            });

            this.body.addEventListener('mousemove', (event) => {
                grid.mouseCoordinate = {x: event.clientX, y: event.clientY};
                if(grid.mousePressed && grid.mouse){
                    grid.moov();
                }
            });
            /*END*/

            /*PHONE*/
            grid.body.addEventListener('touchstart', (event) => {
                grid.mousePressed = true;
                grid.lastMouseCoordinate = {x: event.touches[0].clientX, y: event.touches[0].clientY};
                if(grid.interval) {
                    clearInterval(grid.interval);
                    grid.interval = false;
                }
            }, false);
            document.addEventListener('touchend', () => {
                grid.mousePressed = false;
                grid.lastMouseCoordinate = {x: false, y: false};
                grid.setAnimation();
            }, false);

            this.body.addEventListener('touchmove', (event) => {
                grid.mouseCoordinate = {x: event.touches[0].clientX, y: event.touches[0].clientY};
                if(grid.mousePressed && grid.mouse){
                    grid.moov();
                }
            }, false);

            /*END*/
        }

        //ZOOM
        if(this.zoom){
            this.body.addEventListener('wheel', function(e){
                e.preventDefault();
                let delta = e.deltaY > 0 ? -1 : +1;
                grid.updateZoom(delta);
            }, {passive: false});
        }

        this.body.style.touchAction = "none";
        this.body.style.overflow = "hidden";
        this.body.style.position = "relative"
        this.setAnimation();
        this.setCards();
    }

    setAnimation(){
        let grid = this;
        if(this.animation && !this.interval){
            this.interval = setInterval(async () => {
                let fakeMouse = {
                    x: grid.animation.velocityX || 0,
                    y: grid.animation.velocityY || 0
                }
                for(var col=0; col<this.cardsList.length; col++){
                    for(var lin=0; lin<this.cardsList[col].length; lin++){
                        //selection element
                        let element = this.cardsList[col][lin];

                        element.newCoordinate(fakeMouse.x, fakeMouse.y);
                        await grid.colision(element, col, lin, fakeMouse.x, fakeMouse.y);
                    }
                }
            }, this.animation.time || 100);
        }
    }
}


class CardGrid{
    constructor(x, y, body){
        this.body = body;
        this.x = x;
        this.y = y;

        this.element = document.createElement('div');
        this.element.overflow = "hidden";

        if(typeof body=="string"){
            this.element.innerHTML = body;
        } else {
            this.element.appendChild(body);
        }
    }

    update(body){
        this.element.innerHTML = "";
        this.element.appendChild(body);
    }

    display(){
        this.element.style.position = "absolute";
        this.element.style.transform = `translate(${this.x}px, ${this.y}px)`;
    }

    newCoordinate(x, y){
        this.x += x;
        this.y += y;
        
        this.element.style.transform = `translate(${this.x}px, ${this.y}px)`;
    }
}


exports.Grid = (json) => {
    return new Grid(json);
};