
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

const strings = tabText.match(/.+|$/g)

console.log('strings: ', strings);
const tab = [];
strings.forEach(s => {
  tab.push(s.match(/[0-9]+/g) || []);
});
console.log('tab: ', tab);


export default tab;
