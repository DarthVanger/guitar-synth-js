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

let blockNum = 0;
let blocks;
function playTab2() {
  blocks = parseTab(textarea.innerHTML);
  console.log('blocks: ', blocks);
  //blocks.forEach(b => {playBlock(b)});
  playBlock(blocks[0]);
}

function playBlock(tab) {
  const textarea2 = document.querySelector('#parsed-tab');
  console.log('play Block:');
  console.log(tab);
  const guitar = [[], [], [], [], [], [], []];
  const buffers = [];
  const guitar2 = ['', '', '', '', '', ''];
  console.log('tab[0].length: ', tab[0].length);
  let i = 0;
  nextNote();
  function nextNote() {
    if (i > tab[0].length) {
      blockNum++;
      if (blocks.length < i) {
        playBlock(blocks[blockNum]);
      }
    }

    // analyze notes to play for each string
    //let numberOfNotesToPlay = 0;
    //for (let s=0; s<6; s++) {
    //  const tabEntry = tab[s][i];
    //  console.log('for char: ', tabEntry);
    //  const isTabNote = /[0-9]/.test(tabEntry);
    //  let tabNoteNum;
    //  if (isTabNote) {
    //    console.log('isTabNote');
    //    tabNoteNum = parseInt(tabEntry);
    //    guitar[s][i] = tabNoteNum;
    //    guitar2[s] += tabNoteNum;
    //    numberOfNotesToPlay++;
    //  } else {
    //    const previousValue = '-';
    //    guitar[s][i] = previousValue;
    //    guitar2[s] += previousValue;
    //  }
    //}

    // play the notes for all strings
    const sliceDuration = 0.1; // one dash or number on a tab is 0.1 sec
    const bufferLength = sampleRate * sliceDuration;
    const buffer = new Float32Array(bufferLength);
   
    let stringSounds = [];
    for (let s=0; s<6; s++) {
      const tabEntry = tab[s][i];
      const isTabNote = /[0-9]/.test(tabEntry);
      const stringSound = new Float32Array(bufferLength);

      if (isTabNote) {
        console.log(`tabEntry ${tabEntry} for string ${s} is a note`);
        const tabNoteNum = parseInt(tabEntry);
        const hz = tabNumToHz(tabNoteNum, s); 
        console.log('hz: ', hz);
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

    // decide which notes to play
    //if (numberOfNotesToPlay > 1) {
    //  // silence all sounding notes because we have to play a chord
    //  for (let s=0; s<6; s++) {
    //    for (let j=0; j<sliceBufferLength; j++) {
    //      const stringBuffer = buffer[s];
    //      const offset = i * sliceBufferLength;
    //      stringBuffer[offset + j] = 0;
    //    }
    //  }
    //} else {
      // let all sounding notes continue ringing
    //  for (let s=0; s<6; s++) {
    //    // copy previous noteBuffer of each strnig to current noteBuffer
    //    for (let j=0; j<sliceBufferLength; j++) {
    //      const stringBuffer = buffer[s];
    //      const offset = i * sliceBufferLength;
    //      stringBuffer[offset + j] = stringBuffer[-offset + j];
    //    }
    //  }
    //}
    i++;
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
