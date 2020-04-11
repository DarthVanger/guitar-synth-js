
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
  if (nums) {
    nums = nums.map(x => parseInt(x));
    
  }

  tab.push(nums);
});

console.log('tab: ', tab);


export default tab;
