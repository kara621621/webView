const cp = require('child_process');
const path = require('path');
const os = require('os');
const fs = require('fs');

const desktop = path.join(os.homedir(), 'Desktop');
const adminPath = 'c:\\Users\\Ryun\\Desktop\\ryun\\home-creative-pop\\admin.html';
const googleUrl = 'https://script.google.com/macros/s/AKfycbzJtqypi1gII308jGHm9060etdwHcp8X8F83LBxIbBuJwuNwGIadYe9NhZaNgtlIcOY7g/exec';

// 1. 모아워크_상담대시보드.lnk
const psScript1 = `
$w = New-Object -ComObject WScript.Shell
$s = $w.CreateShortcut("${desktop}\\모아워크_상담대시보드.lnk")
$s.TargetPath = "${adminPath}"
$s.WorkingDirectory = "c:\\Users\\Ryun\\Desktop\\ryun\\home-creative-pop"
$s.IconLocation = "$env:SystemRoot\\System32\\imageres.dll, 102"
$s.Save()

$s2 = $w.CreateShortcut("${desktop}\\MOAWORK_Admin.lnk")
$s2.TargetPath = "${adminPath}"
$s2.WorkingDirectory = "c:\\Users\\Ryun\\Desktop\\ryun\\home-creative-pop"
$s2.IconLocation = "$env:SystemRoot\\System32\\imageres.dll, 102"
$s2.Save()
`;

const b64 = Buffer.from(psScript1, 'utf16le').toString('base64');
const out = cp.execSync(`powershell.exe -NoProfile -EncodedCommand ${b64}`).toString();
console.log('PowerShell Output:', out);

// 2. 배치 파일 (.bat)
const batContent = `@echo off\r\nchcp 65001 > nul\r\ntitle 모아워크 상담 대시보드\r\nstart "" "${adminPath}"\r\nexit\r\n`;
fs.writeFileSync(path.join(desktop, '모아워크_상담대시보드_실행.bat'), batContent, 'utf8');

// 3. 구글 웹앱 실행 배치 파일 (.bat)
const googleBatContent = `@echo off\r\nchcp 65001 > nul\r\ntitle 구글 웹앱 대시보드\r\nstart "" "${googleUrl}"\r\nexit\r\n`;
fs.writeFileSync(path.join(desktop, '구글웹앱_대시보드_실행.bat'), googleBatContent, 'utf8');

console.log('All files created successfully!');
