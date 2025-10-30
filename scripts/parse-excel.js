const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');

// 读取Excel文件
const workbook = XLSX.readFile(path.join(__dirname, '../public/guest_post_sites_80_items.xlsx'));
const sheetName = workbook.SheetNames[0];
const worksheet = workbook.Sheets[sheetName];

// 转换为JSON
const data = XLSX.utils.sheet_to_json(worksheet);

// 输出前5条数据供查看
console.log('Total rows:', data.length);
console.log('\nFirst 5 rows:');
console.log(JSON.stringify(data.slice(0, 5), null, 2));

// 输出所有列名
if (data.length > 0) {
  console.log('\nColumn names:');
  console.log(Object.keys(data[0]));
}

// 保存完整数据到JSON文件
fs.writeFileSync(
  path.join(__dirname, '../public/guest_post_sites.json'),
  JSON.stringify(data, null, 2)
);

console.log('\nData saved to public/guest_post_sites.json');
