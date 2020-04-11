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

function playTab() {
  console.log('playTab');
  const tab = parseTab();
  console.log('tab: ', tab);

  const synth = new Synth();

  const notesNum = Math.floor(tab.length / 6);
  const noteDuration = 0.05;
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

document.querySelector('[data-action="playTab"').addEventListener('click', playTab);
