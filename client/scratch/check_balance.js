import fs from 'fs';

const content = fs.readFileSync('c:\\Users\\Vansh\\Desktop\\EV Pulse\\client\\src\\pages\\EmergencySOS.jsx', 'utf8');

let curlyCount = 0;
let parenCount = 0;
let angleCount = 0;

for (let i = 0; i < content.length; i++) {
    if (content[i] === '{') curlyCount++;
    if (content[i] === '}') curlyCount--;
    if (content[i] === '(') parenCount++;
    if (content[i] === ')') parenCount--;
}

console.log('Curly Balance:', curlyCount);
console.log('Paren Balance:', parenCount);

// Simple tag balancer
const tags = content.match(/<\/?([a-zA-Z0-9]+)/g) || [];
let stack = [];
tags.forEach(tag => {
    if (tag.startsWith('</')) {
        const name = tag.substring(2);
        if (stack.length > 0 && stack[stack.length - 1] === name) {
            stack.pop();
        } else {
            console.log('Mismatched close tag:', tag);
        }
    } else {
        const name = tag.substring(1);
        // Ignore self-closing logic for now, just check pairs
        if (!['img', 'br', 'hr', 'input', 'link', 'meta'].includes(name.toLowerCase())) {
            stack.push(name);
        }
    }
});
console.log('Remaining Stack:', stack);
