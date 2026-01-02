const fs = require('fs');
const path = require('path');

// フォントファイルのパス
const fontPath = path.join(__dirname, '../public/fonts/NotoSansJP-Regular.ttf');

// フォントファイルが存在するか確認
if (!fs.existsSync(fontPath)) {
    console.error('エラー: フォントファイルが見つかりません');
    console.log('以下の手順でフォントをダウンロードしてください:');
    console.log('1. https://fonts.google.com/noto/specimen/Noto+Sans+JP にアクセス');
    console.log('2. "Get font" → "Download all" をクリック');
    console.log('3. ZIPを解凍して static/NotoSansJP-Regular.ttf を見つける');
    console.log('4. public/fonts/ フォルダにコピー');
    process.exit(1);
}

// フォントファイルを読み込み
const fontData = fs.readFileSync(fontPath);

// Base64エンコード
const base64Font = fontData.toString('base64');

// TypeScriptファイルとして出力
const output = `// Noto Sans JP フォント (Base64エンコード済み)
// このファイルは自動生成されました
export const NotoSansJPFont = '${base64Font}';
`;

// 出力先ディレクトリを作成
const outputDir = path.join(__dirname, '../utils/fonts');
if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
}

// ファイルに書き込み
const outputPath = path.join(outputDir, 'NotoSansJP-font.ts');
fs.writeFileSync(outputPath, output);

console.log('✅ フォント変換完了！');
console.log(`📁 出力先: ${outputPath}`);
console.log(`📊 ファイルサイズ: ${(fs.statSync(outputPath).size / 1024 / 1024).toFixed(2)} MB`);
