
//import fbFunction from '.fruitBowl.js';
//import {fruitBowl as fb} from './fruitBowl.js'; 
//const fruitBowl = require('./fruitBowl.js');

const svg = d3.select('svg');

const width = +svg.attr('width');
const height = +svg.attr('height');

const render = (selection, props) => {
    const circles = selection.selectAll('circle')
        .data(props, d => d.id);
    console.log(selection);
    circles
        .enter().append('circle')
            .attr('cx', (d,i) => i*100 + 70)
            .attr('cy', height/2)
            .attr('r', 0)
        .merge(circles)
            .attr('fill', d => colorScale(d.type))
        .transition().duration(500)
            .attr("r", d => radiusScale(d.type))
            .attr('cx', (d,i) => i*100 + 70);

    circles
        .exit()
            .transition().duration(500)
                .attr("r", 0)
            .remove();
};


const colorScale = d3.scaleOrdinal()
    .domain(['apple','lemon'])
    .range(['#c11d1d', '#fcbe03']);

const radiusScale = d3.scaleOrdinal()
    .domain(['apple','lemon'])
    .range([45,30]);

const makeFruit = type => ({
    type,
    id: Math.random()
});

let fruits = d3.range(5).map(() => makeFruit('apple'));


render(svg, fruits);

setTimeout(() => {
    fruits.pop();
    render(svg,fruits);
},1000)

setTimeout(() => {
    fruits[2].type = 'lemon';
    render(svg,fruits);
},2000)

// Eat the second Apple

setTimeout (() => {
    fruits = fruits.filter((d,i) => i !== 1);
    render(svg,fruits);
},3000) 