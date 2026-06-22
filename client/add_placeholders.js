import fs from 'fs';
import path from 'path';

const pagesDir = './src/pages';
const files = fs.readdirSync(pagesDir).filter(f => f.endsWith('.jsx'));

for (const file of files) {
  const filePath = path.join(pagesDir, file);
  let content = fs.readFileSync(filePath, 'utf8');

  const parts = content.split('<label className="form-label">');
  for (let i = 1; i < parts.length; i++) {
    const endLabelIdx = parts[i].indexOf('</label>');
    if (endLabelIdx === -1) continue;
    
    const labelContent = parts[i].substring(0, endLabelIdx);
    const cleanLabel = labelContent.replace('*', '').trim();
    
    const afterLabel = parts[i].substring(endLabelIdx + '</label>'.length);
    const inputIdx = afterLabel.indexOf('<input');
    const textareaIdx = afterLabel.indexOf('<textarea');
    
    let tag = '';
    let tagIdx = -1;
    if (inputIdx !== -1 && textareaIdx !== -1) {
       if (inputIdx < textareaIdx) { tag = '<input'; tagIdx = inputIdx; }
       else { tag = '<textarea'; tagIdx = textareaIdx; }
    } else if (inputIdx !== -1) {
       tag = '<input'; tagIdx = inputIdx;
    } else if (textareaIdx !== -1) {
       tag = '<textarea'; tagIdx = textareaIdx;
    }
    
    if (tagIdx !== -1 && tagIdx < 150) {
       const tagContentSnippet = afterLabel.substring(tagIdx, tagIdx + 200);
       
       // Exclude checkboxes, radios, dates etc which might not need standard text placeholders
       // Or let's just avoid if type="date" or type="datetime-local"
       if (!tagContentSnippet.includes('placeholder=') && 
           !tagContentSnippet.includes('type="date"') &&
           !tagContentSnippet.includes('type="datetime-local"')) {
          
          const insertPos = tagIdx + tag.length;
          const newAfterLabel = afterLabel.substring(0, insertPos) + ` placeholder="Enter ${cleanLabel}"` + afterLabel.substring(insertPos);
          parts[i] = parts[i].substring(0, endLabelIdx) + '</label>' + newAfterLabel;
       }
    }
  }
  
  content = parts.join('<label className="form-label">');
  fs.writeFileSync(filePath, content, 'utf8');
}
console.log('Placeholders added successfully.');
