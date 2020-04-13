console.log('hello world');
import GuitarString from './GuitarString.js';
import { parseTab, tabNumToHz, textarea } from './tab.js';
const AudioContext = window.AudioContext || window.webkitAudioContext;

const sampleRate = 44100;
const hz = 440;
const duration = 10;

const bufferSize = sampleRate * duration;

const audioCtx = new AudioContext({sampleRate});
const buffer = audioCtx.createBuffer(1, bufferSize, sampleRate);

playTab2();
function playTab2() {
  const blocks = parseTab(textarea.innerHTML);
  console.log('blocks: ', blocks);
  blocks.forEach(b => {playBlock(b)});
}

function playBlock(tab) {
  const textarea2 = document.querySelector('#parsed-tab');
  console.log('play Block:');
  console.log(tab);
  const guitar = [[], [], [], [], [], [], []];
  const guitar2 = ['', '', '', '', '', ''];
  console.log('tab[0].length: ', tab[0].length);
  for (let i=0; i<tab[0].length; i++) {
    for (let s=0; s<6; s++) {
      const tabEntry = tab[s][i];
      const isTabNote = /[0-9]/.test(tabEntry);
      if (isTabNote) {
        console.log('isTabNote');
        const tabNote = parseInt(tabEntry);
        guitar[s][i] = tabNote;
        guitar2[s] += tabNote;
      } else {
        const previousValue = '-';
        guitar[s][i] = previousValue;
        guitar2[s] += previousValue;
      }
    }
  }

  console.log('guitar: ', guitar);
  console.log('guitar2: ', guitar2);

  textarea2.innerHTML = textarea2.innerHTML + '\n\n' + guitar2.join('\n');
}

function playTab() {
  console.log('playTab');
  const tab = parseTab();
  console.log('tab: ', tab);

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
    if (tab[i] == '|' && tab[i+1] == '-' && tab[i-1] !== '-') {
      tabPieceLength = 0;
      inStringIndex = 0;
      onAString = true;
    }
    if (tab[i] == '|' && tab[i-1] == '-' && tab[i+1] !== '-' && tab[i-2] !== 'M') {
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

    const guitarStringSoundDuration = 1;
    let noteBuffer = new Float32Array(sampleRate * guitarStringSoundDuration);
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
      const hz = tabNumToHz(num, stringNum); 
      const string = new GuitarString(hz);
      string.pluck();

      let j = 0;
      while (j < sampleRate * guitarStringSoundDuration) {
        const offset = (mergedTabIndex + inStringIndex) * sampleRate * noteDuration;
        stringBuffers[stringNum][j + offset] = string.sample();
        string.tic();
        j++;
      }
    }
    

    const notePlayTime = (inStringIndex + mergedTabIndex) * noteDuration * 1000;

    if (stringNum % 5 === 0) {
      noteHighlights.push(() => {
        setTimeout(() => {
          textarea.innerHTML = tab.substring(0, i) + `<span style="color: red">*</span>` + tab.substring(i + 1);
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

  const source = audioCtx.createBufferSource();
  source.connect(audioCtx.destination);
  source.buffer = audioBuffer;
  
  audioCtx.onstatechange = function() {
    if (audioCtx.state === 'running') {
      console.log('context state:' , audioCtx.state);
      noteHighlights.map(f => f());
    }
  }

  source.addEventListener('ended', () => { 
    textarea.innerHTML = tab;
  });

  textarea.focus();
  source.start();
}

document.querySelector('[data-action="playTab"]').addEventListener('click', playTab);
document.querySelector('[data-action="playTab2"]').addEventListener('click', playTab2);
