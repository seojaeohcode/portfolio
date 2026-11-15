# tools/shot.ps1 <url> <w,h> <out.png>  — headless Edge screenshot, nothing to install
param([string]$Url, [string]$Size, [string]$Out)
$edge = "C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe"
Remove-Item -Recurse -Force "$env:TEMP\edgeshot" -ErrorAction SilentlyContinue  # 캐시 없이 매번 새로
$p = Start-Process -FilePath $edge -ArgumentList "--headless=new","--disable-gpu","--hide-scrollbars","--no-first-run","--user-data-dir=$env:TEMP\edgeshot","--virtual-time-budget=6000","--window-size=$Size","--screenshot=$Out",$Url -Wait -PassThru
if (-not (Test-Path $Out)) { throw "no screenshot" }
