const fs = require('fs');
const path = require('path');

const mappings = {
  'RegisterPage.tsx': 'app/(auth)/signup/page.tsx',
  'OnboardingPage.tsx': 'app/(auth)/onboarding/page.tsx',
  'StudentDashboardPage.tsx': 'app/(student)/dashboard/page.tsx',
  'ClassroomPage.tsx': 'app/(student)/learn/[sessionId]/page.tsx',
  'ApPrepPage.tsx': 'app/(student)/ap-prep/page.tsx',
  'TeacherDashboardPage.tsx': 'app/(teacher)/dashboard/page.tsx',
  'ParentDashboardPage.tsx': 'app/(parent)/portal/page.tsx'
};

const srcDir = 'c:\\CoastalTutor UI\\src\\app\\pages';
const destDir = 'c:\\CoastalTutor';

for (const [srcFile, destPath] of Object.entries(mappings)) {
  const fullSrc = path.join(srcDir, srcFile);
  const fullDest = path.join(destDir, destPath);
  
  let content = fs.readFileSync(fullSrc, 'utf-8');
  
  content = content.replace(/import { useNavigate } from "react-router";/g, 'import { useRouter } from "next/navigation";');
  content = content.replace(/useNavigate\(\)/g, 'useRouter()');
  content = content.replace(/navigate\(/g, 'router.push(');
  content = content.replace(/\.\.\/\.\.\/imports\//g, '@/components/imports/');
  content = '"use client";\n\n' + content;
  
  fs.mkdirSync(path.dirname(fullDest), { recursive: true });
  fs.writeFileSync(fullDest, content);
}
console.log('Migration complete.');
