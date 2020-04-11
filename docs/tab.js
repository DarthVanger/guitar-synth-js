
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

const numbers = tabText.match(/[0-9]/g);
console.log('numbers: ', numbers);

const tab = numbers;

export default tab;
