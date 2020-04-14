console.log('hello world');
import GuitarString from './GuitarString.js';
import { parseTab, tabNumToHz, textarea } from './tab.js';
const AudioContext = window.AudioContext || window.webkitAudioContext;

const sampleRate = 44100;
const hz = 440;
const duration = 10;

const bufferSize = sampleRate * duration;

const audioCtx = new AudioContext({sampleRate});

function playBuffer(buffer, callback) {
  const audioBuffer = audioCtx.createBuffer(1, buffer.length, sampleRate);
  audioBuffer.copyToChannel(buffer, 0);
  const source = audioCtx.createBufferSource();
  source.connect(audioCtx.destination);
  source.buffer = audioBuffer;
  source.onended = callback;
  source.start();
}

let blocks;
let tabTextOriginal;
function playTab2() {
  tabTextOriginal = textarea.innerHTML;
  blocks = parseTab(textarea.innerHTML);
  console.log('blocks: ', blocks);
  playBlock(blocks[0]);
}

function playBlock(tab) {
  const textarea2 = document.querySelector('#parsed-tab');
  console.log('playting tab piece: ');
  console.log(tab);
  const guitar = [[], [], [], [], [], [], []];
  const buffers = [];
  const guitar2 = ['', '', '', '', '', ''];

  let noteNum = 0;
  nextNote();
  function nextNote() {
    if (noteNum > tab[0].length) {
      playBlock(blocks[1]);
      return;
    }

    // create a copy of tab block for each note we are playing
    // in this copy we replace currently played notes with '*'
    let tab2 = [];
    tab.forEach((s, i) => {
      tab2[i] = [];
      for (let j=0; j<s.length; j++) {
        tab2[i][j] = s[j];
      }
    });

    // play the notes for all strings
    const sliceDuration = 0.1; // one dash or number on a tab is 0.1 sec
    const bufferLength = sampleRate * sliceDuration;
    const buffer = new Float32Array(bufferLength);

    let stringSounds = [];
    for (let s=0; s<6; s++) {
      const tabEntry = tab[s][noteNum];
      const isTabNote = /[0-9]/.test(tabEntry);
      const stringSound = new Float32Array(bufferLength);

      if (isTabNote) {
        const tabNoteNum = parseInt(tabEntry);
        const hz = tabNumToHz(tabNoteNum, s); 
        const string = new GuitarString(hz);

        string.pluck();
        let j = 0;
        while (j < bufferLength) {
          stringSound[j] = string.sample();
          string.tic();
          j++;
        }
      } 

      stringSounds[s] = stringSound;

      tab2[s][noteNum] = `<span style="color:red; font-weight:bold;">*</span>`.split();
    }

    let soundSum = new Float32Array(bufferLength);
    for (let i=0; i<bufferLength; i++) {
      let sum = 0;
      stringSounds.forEach(s => {
        sum += s[i];
      });
      const avg = sum / 6;
      soundSum[i] = avg;
    }

    playBuffer(soundSum, nextNote);

    const tab2Array = tab2.map(s => s.join(''));
    let newTabText = '';
    for (let s=0; s<6; s++) {
      const str = newTabText ? newTabText : tabTextOriginal;
      const foundLine = str.match(tab[s]);
      newTabText = str.replace(tab[s], tab2Array[s]);
    }
    textarea.innerHTML = newTabText;

    noteNum++;
  }
}

document.querySelector('[data-action="playTab2"]').addEventListener('click', playTab2);
