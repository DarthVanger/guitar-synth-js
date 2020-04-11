const textarea = document.querySelector('textarea');
textarea.value = `
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
`.trim();

export const tabNumToPitch = (tabNum, stringNum) => {
    console.log(`tabNumToPitch(${tabNum}, ${stringNum})`);
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

   return stringPitch + tabNum;
};

const parseTab = () => {
  const tab = [];
  for (let i = 0; i < 6; i++) {
    tab[i] = [];
  }

  const tabText = textarea.value;

  const stringLines = tabText.match(/[|].+[|]/g)
    .map(s => s.slice(1, s.length - 1)); // remove vertical bars in the beginning and end

  let i = 0;
  let tabJ = 0;
  while (i < stringLines.length) {
    const stringNum = i % 6;
    for (let j = 0; j < stringLines[i].length; j++) {
      tab[stringNum][j + tabJ] = stringLines[i][j];
    }

    if (stringNum === 5) {
       tabJ += stringLines[i].length;
    }

    i++;
  }

  console.log('tab: ', tab);

  return tabText;

  console.log('tab: ', tab);
}

export { parseTab };
