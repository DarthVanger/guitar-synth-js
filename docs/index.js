console.log('hello world');
import Synth from './Synth.js';
import tab from './tab.js';
  console.log('tab: ', tab);
const AudioContext = window.AudioContext || window.webkitAudioContext;

const sampleRate = 44100;
const hz = 440;
const duration = 10;

const bufferSize = sampleRate * duration;

const audioCtx = new AudioContext({sampleRate});
const buffer = audioCtx.createBuffer(1, bufferSize, sampleRate);

let data = buffer.getChannelData(0);
for (let i = 0; i <= bufferSize; i++) {
  data[i] = Math.sin(2 * Math.PI * i * hz / sampleRate);
}

let sound = audioCtx.createBufferSource();
sound.buffer = buffer;

sound.connect(audioCtx.destination);

const noise = createNoise();

function play440() {
  sound.start();
}

function playNoise() {
  noise.start();
}

function createNoise() {
  const noiseLength = 5;

  const bufferSize = audioCtx.sampleRate * noiseLength;
  const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);

  let data = buffer.getChannelData(0);

  // fill the buffer with noise
  for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
  }

  let noise = audioCtx.createBufferSource();
  noise.buffer = buffer;

  noise.connect(audioCtx.destination);

  return noise;
}

function playWithHarmonics() {
  console.log('playWithHarmonics');
  console.log('tab: ', tab);
  const allNotesBufferSize = bufferSize * tab.length;

  const audioBuffer = audioCtx.createBuffer(1, allNotesBufferSize, sampleRate);

  const synth = new Synth();

  const noteDuration = 2;
  const notesNum = 4;

  const totalDuration = 8;

  const stringBuffers = [];

  tab.forEach(string => {
    const buffer = new Float32Array(bufferSize * totalDuration);
    let i = 0;
    string.forEach((note) => {
      const noteBuffer = synth.note(parseInt(note), noteDuration);
      for (let j = 0; j < bufferSize; j++) {
        buffer[i + j] = noteBuffer[j];
        i++;
      }
    });
    stringBuffers.push(buffer);
  });
  console.log('stringBuffers: ', stringBuffers);

  const bufferLength = bufferSize * totalDuration;
  const buffer = new Float32Array(bufferLength);

  for (let i = 0; i < bufferLength; i++) {
    buffer[i] = stringBuffers[4][i];
  }

  console.log('buffer: ', buffer);

  audioBuffer.copyToChannel(buffer, 0);

  const source = audioCtx.createBufferSource();
  source.connect(audioCtx.destination)
  source.buffer = audioBuffer;

  source.start();
}

document.querySelector('[data-action="play440"').addEventListener('click', play440);
document.querySelector('[data-action="playNoise"').addEventListener('click', playNoise);
document.querySelector('[data-action="playWithHarmonics"').addEventListener('click', playWithHarmonics);
playWithHarmonics();
