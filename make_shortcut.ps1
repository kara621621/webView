[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
$desktop = [Environment]::GetFolderPath('Desktop')
$wsh = New-Object -ComObject WScript.Shell

# 1. 로컬 모아워크 관리자 대시보드 (admin.html) 바로가기
$adminPath = "c:\Users\Ryun\Desktop\ryun\home-creative-pop\admin.html"
$shortcut1 = $wsh.CreateShortcut((Join-Path $desktop "모아워크_상담대시보드.lnk"))
$shortcut1.TargetPath = $adminPath
$shortcut1.WorkingDirectory = "c:\Users\Ryun\Desktop\ryun\home-creative-pop"
$shortcut1.IconLocation = "$env:SystemRoot\System32\imageres.dll, 102"
$shortcut1.Description = "모아워크 상담 관리 대시보드"
$shortcut1.Save()

# 2. 구글 웹앱 온라인 대시보드 바로가기 (.url 파일 ANSI/UTF8 호환형)
$googleUrl = "https://script.google.com/macros/s/AKfycbzJtqypi1gII308jGHm9060etdwHcp8X8F83LBxIbBuJwuNwGIadYe9NhZaNgtlIcOY7g/exec"
$urlContent = "[InternetShortcut]`r`nURL=$googleUrl`r`nIconIndex=0`r`n"
[System.IO.File]::WriteAllText((Join-Path $desktop "모아워크_온라인웹앱.url"), $urlContent, [System.Text.Encoding]::Default)

# 3. 크롬/기본 브라우저를 직접 띄우는 실행 배치 파일 (.bat)
$batContent = "@echo off`r`nchcp 65001 > nul`r`nstart """" ""$googleUrl""`r`nexit`r`n"
[System.IO.File]::WriteAllText((Join-Path $desktop "모아워크_구글웹앱_실행.bat"), $batContent, [System.Text.Encoding]::Default)

Write-Host "바탕화면 바로가기 파일 3종이 완벽하게 생성되었습니다."
