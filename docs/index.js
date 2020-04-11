console.log('hello world');
import Synth from './Synth.js';
import { parseTab, tabNumToPitch, textarea } from './tab.js';
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
  const tab = parseTab();
  console.log('tab: ', tab);

  const synth = new Synth();

  const notesNum = Math.floor(tab.length / 6);
  const noteDuration = 0.1;
  const totalDuration = noteDuration * notesNum;
  const bufferLength = sampleRate * totalDuration;

  const stringBuffers = [];
  const mergedTab = [];
  for (let i = 0; i < 6; i++) {
    stringBuffers[i] = new Float32Array(bufferLength);
    mergedTab[i] = [];
  }

  let onAString = false;
  let stringNum = 0;
  let noteNum = 0;
  let tabPieceLength;
  let noteLineNum = 0;
  let mergedTabIndex = 0;
  let inStringIndex = 0;
  let noteHighlights = [];
  for (let i = 0; i < tab.length; i++) {
    if (tab[i] == '|' && tab[i+1] == '-') {
      tabPieceLength = 0;
      inStringIndex = 0;
      onAString = true;
    }
    if (tab[i] == '|' && tab[i-1] == '-') {
      onAString = false;
      stringNum = ( stringNum + 1 ) % 6;
      noteLineNum++;
      if (stringNum % 5 === 0) {
        mergedTabIndex += tabPieceLength;
        noteNum += tabPieceLength;
      }
    }

    if (stringNum % 5 === 0 && onAString) tabPieceLength++;

    if (onAString) inStringIndex++;

    if (!onAString) continue;

    let noteBuffer = new Float32Array(sampleRate * noteDuration);
    const tabEntry = tab[i];
    const isTabEntryANumber = /[0-9]/.test(tabEntry);
    const isPreviousTabEntryANumber = /[0-9]/.test(tab[i - 1]);
    const isNextTabEntryANumber = /[0-9]/.test(tab[i + 1]);

    let num;
    if (isNextTabEntryANumber) {
      num = parseInt(tabEntry + tab[i+i]);
    } else {
      num = parseInt(tabEntry);
    }

    mergedTab[stringNum][mergedTabIndex + inStringIndex] = (isTabEntryANumber ? num : '-');
    
    // if multidigint number -xx- play silence for second digit
    if (isTabEntryANumber && !isPreviousTabEntryANumber) {
      const pitch = tabNumToPitch(num, stringNum); 
      noteBuffer = synth.note(pitch, noteDuration);
    }
    
    // write the note to the string buffer
    for (let j = 0; j < noteBuffer.length; j++) {
      const offset = (mergedTabIndex + inStringIndex) * sampleRate * noteDuration;
      stringBuffers[stringNum][j + offset] = noteBuffer[j];
    }

    const notePlayTime = (inStringIndex + mergedTabIndex) * noteDuration * 1000;

    if (stringNum % 5 === 0) {
      noteHighlights.push(() => {
        setTimeout(() => {
          textarea.innerHTML = tab.substring(0, i) + `<span style="background: red">${tab[i]}</span>` + tab.substring(i + 1);
        }, notePlayTime);
      });
    }
  }

  console.log('stringBuffers: ', stringBuffers);
  console.log('mergedTab: ', mergedTab.map(s => s.join('')));

  const audioBuffer = audioCtx.createBuffer(1, bufferLength, sampleRate);

  const buffer = new Float32Array(bufferLength);

  for (let i = 0; i < bufferLength; i++) {
    let sum = 0;
    for (let s = 0; s < 6; s++) {
      sum += stringBuffers[s][i];
    }
    const avg = sum / 6;

    buffer[i] = avg;
  }

  console.log('buffer: ', buffer);

  audioBuffer.copyToChannel(buffer, 0);


  const analyser =  audioCtx.createAnalyser();
  analyser.fftSize = 2048;

  const source = audioCtx.createBufferSource();
  source.connect(analyser);
  analyser.connect(audioCtx.destination);
  source.buffer = audioBuffer;
  
  //const bufferLength = analyser.frequencyBinCount;
  const dataArray = new Uint8Array(bufferLength);

  textarea.focus();
  
  audioCtx.onstatechange = function() {
    if (audioCtx.state === 'running') {
      console.log('context state:' , audioCtx.state);
      noteHighlights.map(f => f());
    }
  }
  source.start();

  setTimeout(() => {
    analyser.getByteTimeDomainData(dataArray);
    console.log('dataArray: ', dataArray);
  }, 2000);

}

document.querySelector('[data-action="play440"').addEventListener('click', play440);
document.querySelector('[data-action="playNoise"').addEventListener('click', playNoise);
document.querySelector('[data-action="playWithHarmonics"').addEventListener('click', playWithHarmonics);
