const textarea = document.querySelector('textarea');
textarea.value = `
D#|-------------------------------------------------------------------------|
A#|------1-----------0------------1------------0----------------------------|
F#|----2---2-------2---2--------0---0--------1---1--------------------------|
C#|--2-------0---0-------0----2-------2----0-------0------------------------|
G#|0------------------------3-----------------------------------------------|
C#|------------3-------------------------2----------------------------------|
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

  const tabText = textarea.value;

  const strings = tabText.match(/[|].+|$/g)
    .slice(0, -1) // remove last empty row (don't know why is it there)
    .map(s => s.slice(1, s.length - 1)); // remove vertical bars in the beginning and end

  console.log('strings: ', strings);
  const tab = strings;

  return tab;

  console.log('tab: ', tab);
}

export { parseTab };
