class Grid{
    constructor(json){
        this.body = json.body || document.body;
        this.width = json.width || 240;
        this.height = json.height || 171;
        this.create = json.createElementFunction;
        this.cardsList = [];
        this.mousePressed = false;
        this.lastMouseCoordinate = {x: false, y: false};
        this.mouseCoordinate = {x: false, y: false};

        this.animation = json.animation || false;
        this.interval = false;

        this.mouse = json.mouse || false;

        this.velocityInterval = false;

        this.setUpGrid();
    }

    async moov(){
        for(var list of this.cardsList){
            for(var element of list){
                element.newCoordinate(this.lastMouseCoordinate, this.mouseCoordinate);
            }
        }
        await this.colision();
        this.lastMouseCoordinate = {x: this.mouseCoordinate.x, y: this.mouseCoordinate.y};
    }


    async colision(){
        for(var col=0; col<this.cardsList.length; col++){
            for(var lin=0; lin<this.cardsList[col].length; lin++){
                let element = this.cardsList[col][lin];



                if(element.x>this.body.offsetWidth+this.width){
                    let cache = col+1;
                    cache = cache>this.cardsList.length-1 ? 0 : cache;
                    let calc = this.cardsList[cache][0].x - this.width;
                    element.x = calc;
                    element.update(await this.create());
                }

                if(element.x<-this.width*2){
                    let cache = col-1;
                    cache = cache<0 ? this.cardsList.length-1 : cache;
                    let calc = this.cardsList[cache][0].x + this.width;
                    element.x = calc;
                    element.update(await this.create());
                }

                if(element.y>this.body.offsetHeight+this.height){
                    let cache = lin+1;
                    cache = cache>this.cardsList[0].length-1 ? 0 : cache;
                    let calc = this.cardsList[0][cache].y - this.height;
                    element.y = calc;
                    element.update(await this.create());
                }
                
                
                if(element.y<-this.height*2){
                    let cache = lin-1;
                    cache = cache<0 ? this.cardsList[0].length-1 : cache;
                    let calc = this.cardsList[0][cache].y + this.height;
                    element.y = calc;
                    element.update(await this.create());
                }
            }
        }
    }

    async setCards(){
        for(var x= -this.width; x<(this.body.offsetWidth+this.width); x+=this.width){
            this.cardsList.push([])
            for(var y= -this.height; y<(this.body.offsetHeight+this.height); y+=this.height){
                let c = new CardGrid(x, y, await this.create());
                c.display();
                c.element.style.width = this.width+"px";
                c.element.style.height = this.height+"px";
                this.body.appendChild(c.element);
                this.cardsList[this.cardsList.length-1].push(c);
            }
        }
    }

    updateZoom(delta){
        //Comming soon
    }

    setUpGrid(){
        let grid = this;
        if(this.mouse){
            grid.body.style.cursor = "grabbing";
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

            //phone
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
        }
        this.body.addEventListener('wheel', function(e){
            let delta = e.deltaY > 0 ? -1 : +1;
            grid.updateZoom(delta);
        });
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
                for(var list of grid.cardsList){
                    for(var element of list){
                        element.newCoordinate({x: 0, y: 0}, fakeMouse);
                    }
                }
                for(var list of grid.cardsList){
                    for(var element of list){
                        grid.colision();
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
        this.element.appendChild(body);
    }

    update(body){
        this.element.innerHTML = "";
        this.element.appendChild(body);
    }

    display(){
        this.element.style.position = "absolute";
        this.element.style.transform = `translate(${this.x}px, ${this.y}px)`;
    }

    newCoordinate(last, mouse){
        let xx = mouse.x-last.x;
        let yy = mouse.y-last.y;
        
        this.x += xx;
        this.y += yy;
        
        this.element.style.transform = `translate(${this.x}px, ${this.y}px)`;
    }
}