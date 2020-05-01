import GuitarString from './GuitarString.js';

window.playGuitarString = (pitch) => {
  const hz = 440.0 * Math.pow(2, pitch / 12.0);
  const sampleRate = 44100;
  const soundDurationSec = 5;
  const soundBufferSize = sampleRate * soundDurationSec;;
  const soundBuffer = new Float32Array(soundBufferSize);
  const string = new GuitarString(hz);
  string.pluck();
  let i = 0;
  while (i < soundBufferSize) {
    soundBuffer[i] = string.sample();
    string.tic();
    i++;
  }
  playBuffer({ buffer: soundBuffer, sampleRate });
}


function playBuffer({ buffer, sampleRate }) {
  const AudioContext = window.AudioContext || window.webkitAudioContext;
  const audioCtx = new AudioContext({sampleRate});
  const audioBuffer = audioCtx.createBuffer(1, buffer.length, sampleRate);

  audioBuffer.copyToChannel(buffer, 0);
  const source = audioCtx.createBufferSource();
  source.connect(audioCtx.destination);
  source.buffer = audioBuffer;
  source.start();
}

document.querySelectorAll('button').forEach(b => {
  b.addEventListener('click', e => {
    e.target.classList.add('playing');
    setTimeout(() => {
      e.target.classList.remove('playing');
    }, 5000);
  });
});
