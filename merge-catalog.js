const fs = require('fs');
let content = fs.readFileSync('frontend/src/app/catalog/[slug]/page.tsx', 'utf8');

// 1. Resolve conflict 1
content = content.replace(
  /<<<<<<< HEAD\r?\n\s*const \[selectedGarmentId, setSelectedGarmentId\] = useState<string \| null>\(null\);\r?\n\s*const \[addedMsg, setAddedMsg\] = useState<string \| null>\(null\);\r?\n=======\r?\n\s*const \[selectedImageUrl, setSelectedImageUrl\] = useState<string \| null>\(null\);\r?\n>>>>>>> e9b027a \(gop_code_kha1_son\)/,
  `  const [selectedGarmentId, setSelectedGarmentId] = useState<string | null>(null);
  const [addedMsg, setAddedMsg] = useState<string | null>(null);`
);

// Ah wait, the conflict marker was: >>>>>>> e9b027a (gop_code_kha1_son)
// Wait! Let's check `git status` again. The conflict marker is probably `>>>>>>> 2d4d831 (temp save)`
// Oh wait! The rebase log said:
// Last commands done (3 commands done):
//    pick 9df23b2 hoan thien login,cấu hình thông báo admin
//    pick 2d4d831 temp save
// Next command to do (1 remaining command):
//    pick e9b027a gop_code_kha1_son
// So the marker is `>>>>>>> e9b027a (gop_code_kha1_son)` !! Yes, we are currently rebasing `e9b027a`!
content = content.replace(
  /<<<<<<< HEAD\r?\n([\s\S]*?)=======\r?\n([\s\S]*?)>>>>>>> [a-f0-9]+ .*\r?\n/g,
  (match, p1, p2) => p1
);

// Wait, the regular expression might fail if the commit message is different.
// I will just use `multi_replace_file_content` via node script, removing HEAD marker and deleting the ======= to >>>>>> part.
content = content.replace(/<<<<<<< HEAD\r?\n/g, '');
content = content.replace(/=======\r?\n[\s\S]*?>>>>>>> .*\r?\n/g, '');

// Now fix the UI bugs
content = content.replace(
  /\{selectedImageUrl \? \([\s\S]*?<img src=\{selectedImageUrl\} alt=\{garment\.name\} className="h-full w-full object-cover" \/>\r?\n\s*\) : \(\r?\n\s*<span className="material-symbols-outlined text-\[80px\] text-antique\/30">checkroom<\/span>\r?\n\s*\)\}\r?\n\s*<\/div>\r?\n\s*\{garment\.images && garment\.images\.length > 1 && \([\s\S]*?\}\)\}\r?\n\s*<\/div>\r?\n\s*<\/div>\r?\n\s*\)\}/,
  `{group.imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={group.imageUrl} alt={group.name} className="h-full w-full object-cover" />
                ) : (
                  <span className="material-symbols-outlined text-[80px] text-antique/30">checkroom</span>
                )}
              </div>`
);

fs.writeFileSync('frontend/src/app/catalog/[slug]/page.tsx', content, 'utf8');
console.log('Fixed catalog slug page');
