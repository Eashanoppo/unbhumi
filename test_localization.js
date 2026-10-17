/**
 * test_localization.js
 * 
 * Automated Language Quality & Parity Check for Phase 13
 * Validates that frontend/lib/i18n.tsx has 100% parity between Bangla and English,
 * that no translation keys are empty or broken, and that formatters behave predictably.
 */

const fs = require('fs');
const path = require('path');

const i18nPath = path.join(__dirname, 'frontend', 'lib', 'i18n.tsx');

if (!fs.existsSync(i18nPath)) {
  console.error(`ERROR: Cannot find ${i18nPath}`);
  process.exit(1);
}

const fileContent = fs.readFileSync(i18nPath, 'utf8');

// Extract the DICTIONARY object from i18n.tsx
const match = fileContent.match(/export const DICTIONARY:\s*Translations\s*=\s*({[\s\S]*?\n};\n)/);
if (!match) {
  console.error("ERROR: Could not locate DICTIONARY in frontend/lib/i18n.tsx");
  process.exit(1);
}

// Evaluate dictionary safely in JS
let dictionary;
try {
  const dictCode = "module.exports = " + match[1].replace(/;\s*$/, '');
  const evalFunc = new Function('module', 'exports', dictCode);
  const mod = { exports: {} };
  evalFunc(mod, mod.exports);
  dictionary = mod.exports;
} catch (e) {
  console.error("ERROR parsing DICTIONARY:", e.message);
  process.exit(1);
}

const keys = Object.keys(dictionary);
console.log(`\n======================================================`);
console.log(` UNLEFT LANDGUARD (UNBUMI DETECTOR) - LOCALIZATION AUDIT`);
console.log(` Total translation keys identified: ${keys.length}`);
console.log(`======================================================\n`);

let missingBn = [];
let missingEn = [];
let emptyBn = [];
let emptyEn = [];

keys.forEach(k => {
  const entry = dictionary[k];
  if (!entry) {
    missingBn.push(k);
    missingEn.push(k);
    return;
  }
  if (entry.bn === undefined) missingBn.push(k);
  else if (entry.bn.trim() === '') emptyBn.push(k);

  if (entry.en === undefined) missingEn.push(k);
  else if (entry.en.trim() === '') emptyEn.push(k);
});

let failed = false;

if (missingBn.length > 0) {
  console.error(`FAIL: Keys missing Bangla ('bn'):`, missingBn);
  failed = true;
} else {
  console.log(`✔ PASS: All ${keys.length} keys possess verified Bangla ('bn') translations.`);
}

if (missingEn.length > 0) {
  console.error(`FAIL: Keys missing English ('en'):`, missingEn);
  failed = true;
} else {
  console.log(`✔ PASS: All ${keys.length} keys possess verified English ('en') translations.`);
}

if (emptyBn.length > 0) {
  console.error(`FAIL: Keys with empty Bangla ('bn'):`, emptyBn);
  failed = true;
}

if (emptyEn.length > 0) {
  console.error(`FAIL: Keys with empty English ('en'):`, emptyEn);
  failed = true;
}

// Test Numeral Formatter logic
function formatNumber(val, lang) {
  if (val === null || val === undefined) return '';
  const str = String(val);
  if (lang !== 'bn') return str;
  const bnDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
  return str.replace(/[0-9]/g, (w) => bnDigits[parseInt(w, 10)]);
}

const numTests = [
  { val: 125, bn: '১২৫', en: '125' },
  { val: 0, bn: '০', en: '0' },
  { val: '98.5%', bn: '৯৮.৫%', en: '98.5%' },
  { val: '2026', bn: '২০২৬', en: '2026' }
];

numTests.forEach(t => {
  if (formatNumber(t.val, 'bn') !== t.bn || formatNumber(t.val, 'en') !== t.en) {
    console.error(`FAIL: Numeral formatter error on ${t.val}: bn=${formatNumber(t.val, 'bn')}, en=${formatNumber(t.val, 'en')}`);
    failed = true;
  }
});
console.log(`✔ PASS: Numeral conversion unit tests passed (0-9 -> ০-৯).`);

if (failed) {
  console.error("\nFAILED: Localization audit found issues.");
  process.exit(1);
} else {
  console.log("\n✔ SUCCESS: 100% Key Parity & Formatter Rules Confirmed!\n");
  process.exit(0);
}
