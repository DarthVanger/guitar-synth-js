Js guitar synthesizer based on [Karplus–Strong algorithm](https://www.cs.princeton.edu/courses/archive/fall18/cos126/assignments/guitar-hero/).

## Demo
https://darthvanger.github.io/guitar-synth-js/

## Usage
```js
import { GuitarString } from 'guitar-synth-js';

// Create a new `GuitarString`, passsing the sound frequency to the constructor
// (e.g. `440` for concert A note)
const hz = 440;
const string = new GuitarString(hz);

// Create an empty buffer to store string soundd
const sampleRate = 44100;
const soundDurationSec = 5;
const soundBufferSize = sampleRate * soundDurationSec;
const soundBuffer = new Float32Array(soundBufferSize);

// Pluck the string and get values by calling `string.sample()` and `string.tic()` in a loop
string.pluck();
let i = 0;
while (i < soundBufferSize) {
  soundBuffer[i] = string.sample();
  string.tic();
  i++;
}

// Play the generated sound buffer in browser
const AudioContext = window.AudioContext || window.webkitAudioContext;
const audioCtx = new AudioContext({sampleRate});
const audioBuffer = audioCtx.createBuffer(1, soundBuffer.length, sampleRate);

audioBuffer.copyToChannel(soundBuffer, 0);
const source = audioCtx.createBufferSource();
source.connect(audioCtx.destination);
source.buffer = audioBuffer;
source.start();
```
