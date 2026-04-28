const fs = require('fs');
const path = require('path');

function getFiles(dir, files = []) {
  const list = fs.readdirSync(dir);
  for (const file of list) {
    const name = dir + '/' + file;
    if (fs.statSync(name).isDirectory()) {
      getFiles(name, files);
    } else if (name.endsWith('.jsx')) {
      files.push(name);
    }
  }
  return files;
}

const files = getFiles('src');

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');

  // Replace primary cards
  content = content.replace(/className="bg-\[var\(--card-bg\)\].*?(?:overflow-hidden|duration-300|group|h-\d+|h-\[\d+px\]|flex-col)"/g, match => {
    let extra = [];
    if (match.includes('p-6')) extra.push('p-6');
    if (match.includes('p-5')) extra.push('p-5');
    if (match.includes('mt-6')) extra.push('mt-6');
    if (match.includes('mb-6')) extra.push('mb-6');
    if (match.includes('mb-8')) extra.push('mb-8');
    if (match.includes('flex flex-col')) extra.push('flex flex-col');
    if (match.includes('h-80')) extra.push('h-80');
    if (match.includes('h-[400px]')) extra.push('h-[400px]');
    if (match.includes('h-[500px]')) extra.push('h-[500px]');
    if (match.includes('flex-1')) extra.push('flex-1');
    if (match.includes('min-h-0')) extra.push('min-h-0');
    if (match.includes('justify-center')) extra.push('justify-center');
    if (match.includes('items-center')) extra.push('items-center');
    if (match.includes('text-gray-400')) extra.push('text-gray-400');
    if (match.includes('group')) extra.push('group');

    return `className="card-premium ${extra.join(' ')}"`.trim();
  });

  // Replace primary buttons (Dashboard link and AddExpense submit)
  content = content.replace(/className="[^"]*bg-emerald-500 hover:bg-emerald-600 text-white[^"]+"/g, match => {
    let extra = [];
    if (match.includes('w-full')) extra.push('w-full');
    return `className="btn-primary ${extra.join(' ')}"`.trim();
  });

  // Replace secondary buttons (Goals New, History Filter/Export)
  content = content.replace(/className="[^"]*bg-\[var\(--card-bg\)\] border border-\[var\(--border-color\)\][^"]+"/g, match => {
    return `className="btn-secondary"`;
  });

  fs.writeFileSync(file, content, 'utf8');
});
console.log('Design system applied!');
