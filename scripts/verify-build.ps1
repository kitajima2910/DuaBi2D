<#
.SYNOPSIS
  Pre-deploy Build Verification — Countries Marble Race
.DESCRIPTION
  Kiểm tra build trước khi deploy: lint → typecheck → test → build → validate output
#>

param([switch]$SkipTests)

$ErrorActionPreference = "Stop"
$ROOT = Split-Path -Parent $PSScriptRoot
$DIST = Join-Path $ROOT "dist"

Write-Host "`n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host "  🏁 Countries Marble Race — Pre-deploy" -ForegroundColor Cyan
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`n" -ForegroundColor Cyan

# === Gate 1: Git status ===
Write-Host "📌 Gate 1: Git status" -ForegroundColor Yellow
Set-Location -LiteralPath $ROOT
$gitStatus = git status --porcelain
if ($gitStatus) {
  Write-Warning "⚠ Git có file chưa commit:"
  $gitStatus | ForEach-Object { Write-Host "   $_" -ForegroundColor DarkYellow }
  $answer = Read-Host "Tiếp tục build? (y/N)"
  if ($answer -ne "y") { exit 1 }
} else {
  Write-Host "   ✅ Git sạch sẽ" -ForegroundColor Green
}

# === Gate 2: Lint ===
Write-Host "`n📌 Gate 2: ESLint + TypeCheck" -ForegroundColor Yellow
& npm run lint
if (-not $?) {
  Write-Error "❌ Lint thất bại! Fix lỗi trước khi build."
  exit 1
}
Write-Host "   ✅ Lint + TypeCheck pass" -ForegroundColor Green

# === Gate 3: Test ===
if (-not $SkipTests) {
  Write-Host "`n📌 Gate 3: Test suite" -ForegroundColor Yellow
  & npm test
  if (-not $?) {
    Write-Error "❌ Test thất bại! Không thể build."
    exit 1
  }
  Write-Host "   ✅ Tests pass" -ForegroundColor Green
} else {
  Write-Host "`n⏩ Gate 3: Bỏ qua test (--SkipTests)" -ForegroundColor DarkYellow
}

# === Gate 4: Build ===
Write-Host "`n📌 Gate 4: Build" -ForegroundColor Yellow
& npm run build
if (-not $?) {
  Write-Error "❌ Build thất bại!"
  exit 1
}

# === Gate 5: Verify output ===
Write-Host "`n📌 Gate 5: Verify output" -ForegroundColor Yellow

# Check dist exists
if (-not (Test-Path $DIST)) {
  Write-Error "❌ dist/ không tồn tại!"
  exit 1
}

# Check index.html exists
if (-not (Test-Path (Join-Path $DIST "index.html"))) {
  Write-Error "❌ dist/index.html không tồn tại!"
  exit 1
}

# Check JS files exist
$jsFiles = Get-ChildItem -Path $DIST -Recurse -Filter "*.js"
if ($jsFiles.Count -eq 0) {
  Write-Error "❌ Không tìm thấy JS files trong dist/!"
  exit 1
}

# Calculate total size
$totalBytes = (Get-ChildItem -Path $DIST -Recurse -File | Measure-Object -Property Length -Sum).Sum
$totalMB = $totalBytes / 1MB
Write-Host "   📦 Total size: $($totalMB.ToString('N2')) MB" -ForegroundColor Cyan

if ($totalMB -gt 10) {
  Write-Warning "⚠ Build > 10MB! Cần tối ưu assets."
} else {
  Write-Host "   ✅ Size OK (< 10MB)" -ForegroundColor Green
}

# Check manifest
if (Test-Path (Join-Path $DIST "manifest.json")) {
  Write-Host "   ✅ manifest.json tồn tại" -ForegroundColor Green
} else {
  Write-Warning "⚠ Thiếu manifest.json"
}

# Check sw.js
if (Test-Path (Join-Path $DIST "sw.js")) {
  Write-Host "   ✅ Service worker tồn tại" -ForegroundColor Green
} else {
  Write-Warning "⚠ Thiếu service worker"
}

# === Summary ===
Write-Host "`n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host "  ✅ BUILD THÀNH CÔNG!" -ForegroundColor Green
Write-Host "  📁 Output: $DIST" -ForegroundColor Cyan
Write-Host "  📦 Dung lượng: $($totalMB.ToString('N2')) MB" -ForegroundColor Cyan
Write-Host "  🔢 Files: $((Get-ChildItem -Path $DIST -Recurse -File).Count)" -ForegroundColor Cyan
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`n" -ForegroundColor Cyan

Write-Host "👉 Bạn có thể deploy bằng cách:" -ForegroundColor White
Write-Host "   - GitHub Pages: push lên branch main" -ForegroundColor DarkGray
Write-Host "   - Itch.io:       chạy workflow Deploy to Itch.io" -ForegroundColor DarkGray
Write-Host "   - Local test:    npm run preview`n" -ForegroundColor DarkGray
