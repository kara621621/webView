
Set oWS = WScript.CreateObject("WScript.Shell")
sLinkFile = "C:\\Users\\Ryun\\Desktop\\모아워크_상담관리대시보드.lnk"
Set oLink = oWS.CreateShortcut(sLinkFile)
oLink.TargetPath = "c:\\Users\\Ryun\\Desktop\\ryun\\home-creative-pop\\admin.html"
oLink.WorkingDirectory = "c:\\Users\\Ryun\\Desktop\\ryun\\home-creative-pop"
oLink.IconLocation = "shell32.dll, 21"
oLink.Description = "모아워크 상담 관리 대시보드"
oLink.Save

sLinkFile2 = "C:\\Users\\Ryun\\Desktop\\MOAWORK_Admin_Dashboard.lnk"
Set oLink2 = oWS.CreateShortcut(sLinkFile2)
oLink2.TargetPath = "c:\\Users\\Ryun\\Desktop\\ryun\\home-creative-pop\\admin.html"
oLink2.WorkingDirectory = "c:\\Users\\Ryun\\Desktop\\ryun\\home-creative-pop"
oLink2.IconLocation = "shell32.dll, 21"
oLink2.Description = "MOAWORK Admin Dashboard"
oLink2.Save
