# InfinityGrid
Create an infinity grid in html wich can display random elements
## See 3 example
https://yoannchb-pro.github.io/InfinityGrid/.
## Basic image
<img src='./img/basic.png' alt='Basic image'></img>
## How to use ?
```js
const simple = new Grid({
  width: 200, //width of one block
  height: 120, //height of one block
  mouse: true, /:disable or enable the mouse
  animation: { //set up an animation
    velocityX: 1, velocity y for each block
    velocityY: 0, //velocity x for each block
    time: 10 //interval refresh
  },
  body: document.querySelector('#simple'), //wich element you want to transform in infinity grid ?
  createElementFunction: createElement //each new element wich be create
});
```
## Example
```js
const createElement = async () => {
  let r = Math.round(Math.random()*255));
  let g = Math.round(Math.random()*255));
  let b = Math.round(Math.random()*255));
  let c = document.createElement('div');
  c.style.backgroundColor = `rgb(${r}, ${g}, ${b})`;
  c.style.width = "100%";
  c.style.height = "100%";
  return c;
}
                    
const animate_with_mouse = new Grid({
  width: 200,
  height: 120,
  mouse: true,
  animation: {
    velocityX: 0.5,
    velocityY: 0.5,
    time: 10
  },
  body: document.querySelector('#animate_with_mouse'),
  createElementFunction: createElement
});
```
