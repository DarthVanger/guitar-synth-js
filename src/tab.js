export const textarea = document.querySelector('#tab-editor');
textarea.addEventListener('paste', (e) => {
  e.preventDefault();
  const data = e.clipboardData.getData('text/plain');
  textarea.innerHTML = data;//.trim().split('\n').map(s => s + '<br>').join('');
});
textarea.innerHTML = `
D#|-------------------------------------------------------------------------|
A#|------1-----------0------------1------------0----------------------------|
F#|----2---2-------2---2--------0---0--------1---1--------------------------|
C#|--2-------0---0-------0----2-------2----0-------0------------------------|
G#|0------------------------3-----------------------------------------------|
C#|------------3-------------------------2----------------------------------|
 
 
[Chorus]
 
D#|-------------------------------------------------------------------------|
A#|-------------------------------------------------------------------------|
F#|-2--2-2-2--------------5--5-5-5------------------------------------------|
C#|-2--2-2-2---3--3-3-3---5--5-5-5---2--2-2-2-------------------------------|
G#|-0--0-0-0---3--3-3-3---3--3-3-3---2--2-2-2-------------------------------|
C#|------------3--3-3-3--------------2--2-2-2-------------------------------|
`.trim().split('\n').map(s => s + '<br>').join('');

export const tabNumToHz = (tabNum, stringNum) => {
    console.log(`tabNumToHz(${tabNum}, ${stringNum})`);
    let stringPitch;
    switch(stringNum) {
      case 0:
        stringPitch = -5;
      case 1:
        stringPitch = -10;
        break;
      case 2:
        stringPitch = -14;
        break;
      case 3:
        stringPitch = -19;
        break;
      case 4:
        stringPitch = -24;
        break;
      case 5:
        stringPitch = -29;
        break;
    }

  const pitch = stringPitch + tabNum;
  const hz = 440.0 * Math.pow(2, pitch / 12.0);
  return hz;
};

const parseTab = () => {
  const tabText = textarea.innerHTML;

  return tabText;
}

export { parseTab };
