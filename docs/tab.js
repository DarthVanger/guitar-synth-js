
const textarea = document.querySelector('textarea');
textarea.value = `
e|--------------------------------|
B|--------------------------------|
G|--------------------------------|
D|-2-------12--11--10-------------|
A|-2-------12--11--10-------------|
E|-0-------10---9---8-------------|
`.trim();

const tabText = textarea.value;

const strings = tabText.match(/.+|$/g).slice(0, -1);

console.log('strings: ', strings);
const tab = [];
strings.forEach((s, i) => {
  let nums = s.match(/[0-9]+/g);
  let stringPitch;
  if (nums) {
    switch(i) {
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

    nums = nums.map(x => parseInt(x)).map(x => stringPitch + x);
  }

  tab.push(nums);
});

console.log('tab: ', tab);


export default tab;
