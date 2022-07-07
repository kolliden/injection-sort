'use strict';

let canvas = document.getElementById('cv');
let ctx = canvas.getContext('2d');
let startButton = document.getElementById('bsstart');

canvas.width = 0;
canvas.height = 0;

ctx.fillStyle = '#C0C0C0';
// ctx.lineWidth = 8;

let condition = true;
let allInOrder = true;

let AM_width = 20;
let arr = []

let ticks = 0;
const speed = 5;

const arrSize = 50;
const ACTIONS = { /* An object that contains the actions that the algorithm does. */
  SORT: "SORT",
  COMPARE: "COMPARE",
  CONTINUE:"CONTINUE",
  SWAP: "SWAP",
};

let randomArr;
let arrayMembers;


let audioContext;
let mooSound;
let gainNode;
let reverbNode;
let impulseResponse;
let pannerNode;

const AudioContext = window.AudioContext || window.webkitAudioContext;
const audioCtx = new AudioContext();

const playSound = async (type, rate) => {    //https://stackoverflow.com/questions/6343450/generating-sound-on-the-fly-with-javascript-html5
  var oscillator = audioCtx.createOscillator();
  var gainNode = audioCtx.createGain();

  gainNode.gain.exponentialRampToValueAtTime(
    0.00001, audioCtx.currentTime + 0.04
  )

  oscillator.connect(gainNode);
  gainNode.connect(audioCtx.destination);


  gainNode.gain.value = 1;
  oscillator.frequency.value = rate*8.5;
  oscillator.type = type;

  oscillator.start();

  setTimeout(
    function() {
      oscillator.stop();
    },
    100
  );
}

/**
 * This function takes an array as an argument, and then pushes the numbers 1 through arrSize into the
 * array, and then shuffles the array, and then returns the array.
 * @param arr - the array to be initialised
 * @returns The array is being returned.
 */
const initRandomArr = (arr) => {
  for (let i = 1; i <= arrSize; i++) {
    arr.push(i);
  }
  arr = shuffle(arr);
  return arr;
}

function clear(){
  ctx.clearRect(0, 0, canvas.width, canvas.height);
}

/**
 * The function initCanvas() is called when the window is resized, and it sets the canvas width and
 * height to the window's width and height, and then calls the clear() function.
 */
function initCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  clear();
}

/**
 * While the current index is not zero, set the current index to the random index, then subtract one
 * from the current index, and swap the current index with the random index.
 * @param array - the array to shuffle
 * @returns The array gets returned.
 */
function shuffle(array) {
  let currentIndex = array.length,  randomIndex;
  while (currentIndex != 0) {

    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;

    [array[currentIndex], array[randomIndex]] = [
      array[randomIndex], array[currentIndex]];
  }

  return array;
}

/**
 * It creates a rectangle with a value, a color, and a few methods to manipulate it
 * @param x - x-coordinate of the rectangle
 * @param y - The y position of the array member
 * @param width - The width of the canvas
 * @param height - the height of the bar
 * @param [color=gray] - The color of the bar.
 */
function ArrayMember(x, y, width, height, color = "gray") {
  this.x = x;
  this.y = y;
  this.width = width;
  this.height = height;
  this.color = color;

  this.draw = () => {
    ctx.fillStyle = this.color;
    ctx.fillRect(this.x, this.y, this.width, this.height);
  };

  this.resetColor = () => this.setColor("gray");

  this.setColor = (color) => {
    if (!this.isSorted()) {
      this.color = color;
    }
  };

  this.isSorted = () => this.color === "green";

  this.sorted = () => (this.color = "green");

  this.setValue = (v, color) => {
    if (!this.isSorted()) {
      this.height = v;
      this.setColor(color);
    }
  };
  this.getValue = () => {
    return this.height
  };
}

/* A map of functions that are called when the bubbleSort function is called. */
const actionsMap = {
  [ACTIONS.SORT]: (action, members) => {
    members[action.data].sorted();
    playSound('sawtooth', members[action.data].getValue());
  },
  [ACTIONS.SWAP]: (action, members) => {
    const [i, j] = action.data;
    let tmp = members[i].getValue();
    members[i].setValue(members[j].getValue(), "red");
    members[j].setValue(tmp, "yellow");
  },
  [ACTIONS.COMPARE]: (action, members) => {
    const [i, j] = action.data;
    members[i].setColor("blue");
    members[j].setColor("blue");
    playSound('sine', members[i].getValue());
  },
  [ACTIONS.CONTINUE]: (action, members) => {
    const i = action.data;
    members[i].setColor("pink");
  },
};

const drawAll = () => arrayMembers.forEach((m) => m.draw());

const check = (array, onAction) => {
  for (let i = 0; i < array.length; i++) {
    if(array[i] < array[i+1]){
      onAction({ type: ACTIONS.SORT, data: i });
      onAction({ type: ACTIONS.SORT, data: array.length-1 });
    }else if (array[i] > array[i+1]){
      return false;
    }
  }
  return true;
}

/**
 * "While the array is not sorted, compare each element to the next element, and if the first element
 * is greater than the second element, swap them, and if not, continue to the next element."
 * 
 * The function takes two parameters: an array and a function. The array is the array to be sorted, and
 * the function is a callback function that is called every time the algorithm does something. The
 * callback function takes an object as a parameter, and the object has two properties: type and data.
 * The type property is a string that tells the callback function what the algorithm did, and the data
 * property is an array that contains the data that the callback function needs to do its job.
 * 
 * The callback function is called every time the algorithm does something. The algorithm does three
 * things: it compares two elements, it swaps two elements, and it continues to the next element. The
 * callback function is called with an object that has a type property of
 * @param array - The array to be sorted
 * @param onAction - a function that takes an object with two properties: type and data.
 */
function bubbleSort(array, onAction) {
  //Sorting things go here
}

const start = () => {
  initCanvas();
  startButton.remove();

  randomArr = initRandomArr(arr);
  arrayMembers = randomArr.map((v, i) => {
    return new ArrayMember((AM_width * i + i)+(canvas.width/4), canvas.height/2+arrSize*5, AM_width, v * canvas.height/100 * -1);
  });

  drawAll();

  /* Calling the bubbleSort function, and passing in the randomArr array and a callback function. */
  bubbleSort(randomArr ,(action) => {
    ticks++;
    setTimeout(() => {
      actionsMap[action.type](action, arrayMembers);
      clear();
      drawAll(arrayMembers);
      arrayMembers.forEach((m) => m.resetColor());
    }, ticks * speed);
  });
}