const fs = require('fs');
let content = fs.readFileSync('d:/SEP/Project/client/src/pages/accountant-page/accountant-dashboard/index.jsx', 'utf8');

const reps = [
  [/label: "Công nợ KH",\s*value: "8"/, 'label: "Công nợ KH",\n        value: "15.000.000 ₫"'],
  [/label: "Công nợ KH",\s*value: "10"/, 'label: "Công nợ KH",\n        value: "12.000.000 ₫"'],
  [/label: "Công nợ KH",\s*value: "45"/, 'label: "Công nợ KH",\n        value: "50.000.000 ₫"'],
  [/label: "Công nợ KH",\s*value: "185"/, 'label: "Công nợ KH",\n        value: "120.000.000 ₫"'],
  [/label: "Công nợ KH",\s*value: "140"/, 'label: "Công nợ KH",\n        value: "90.000.000 ₫"'],
  [/label: "Công nợ NCC",\s*value: "158"/, 'label: "Công nợ NCC",\n        value: "5.000.000 ₫"'],
  [/label: "Công nợ NCC",\s*value: "140"/, 'label: "Công nợ NCC",\n        value: "4.000.000 ₫"'],
  [/label: "Công nợ NCC",\s*value: "920"/, 'label: "Công nợ NCC",\n        value: "25.000.000 ₫"'],
  [/label: "Công nợ NCC",\s*value: "3.850"/, 'label: "Công nợ NCC",\n        value: "80.000.000 ₫"'],
  [/label: "Công nợ NCC",\s*value: "2.950"/, 'label: "Công nợ NCC",\n        value: "65.000.000 ₫"']
];

reps.forEach(r => content = content.replace(r[0], r[1]));

fs.writeFileSync('d:/SEP/Project/client/src/pages/accountant-page/accountant-dashboard/index.jsx', content);
console.log("Done");
