# 日本語フォント追加手順

## 概要
jsPDFで日本語を表示するには、日本語フォントファイルを追加する必要があります。

## 手順

### 1. フォントファイルのダウンロード

Google Fontsから Noto Sans JP をダウンロードします：
https://fonts.google.com/noto/specimen/Noto+Sans+JP

または、以下のコマンドでダウンロード：
```bash
# PowerShellで実行
Invoke-WebRequest -Uri "https://github.com/google/fonts/raw/main/ofl/notosansjp/NotoSansJP%5Bwght%5D.ttf" -OutFile "utils/fonts/NotoSansJP.ttf"
```

### 2. フォント変換

TTFファイルをjsPDF用に変換する必要があります。
オンラインツールを使用：
https://peckconsulting.s3.amazonaws.com/fontconverter/fontconverter.html

1. NotoSansJP.ttf をアップロード
2. "Create" をクリック
3. 生成された .js ファイルをダウンロード
4. `utils/fonts/NotoSansJP-normal.js` として保存

### 3. フォントファイルをインポート

`pdfGenerator.ts` でフォントをインポートして使用します。

## 簡易版: 既存のフォントを使用

日本語フォントの追加が難しい場合は、以下の代替案があります：

### オプション A: PDFMake を使用
- より簡単に日本語対応
- ライブラリの変更が必要

### オプション B: サーバーサイドで生成
- Node.jsでPDF生成
- より高度なフォント対応

### オプション C: 画像として埋め込み
- テキストを画像に変換してPDFに埋め込む
- 検索・コピーができなくなる

## 推奨: 事前準備済みフォントの使用

最も簡単な方法は、事前に変換済みのフォントファイルを使用することです。
