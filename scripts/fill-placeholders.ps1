<#
.SYNOPSIS
  一次性把站内占位符替换成真实值，并把 AnPyer 的第三方声明 JSON 拷进来。

.DESCRIPTION
  占位符（全站统一，大小写敏感）—— 2026-09-20 起只剩两个：
    [COMPANY LEGAL NAME]  英文发布者名 —— 必须与 Play Console 商店页显示的开发者名逐字一致
                          （Play 政策要求隐私政策「reference the entity named in the Play listing」；
                          不必是营业执照全名，用 Console 里的 developer name 即可）
    [公司法定名称]         同上中文（zh 页面用）

  已移除（2026-09-20 用户决定，非必要不放）：注册地址、司法辖区 —— 官网不放；
  地址由 Play 商店页（trader 信息）公开，条款不设「适用法律」节。
  域名 / 邮箱已固化为 anpyer.com / contact@anpyer.com，不再是占位符。

  替换后再跑一次是幂等的（找不到占位符就什么都不改）。

.EXAMPLE
  pwsh -File scripts/fill-placeholders.ps1 -LegalNameEn "OpenBook" -LegalNameZh "OpenBook"
#>
param(
    [Parameter(Mandatory)] [string]$LegalNameEn,
    [string]$LegalNameZh = $LegalNameEn,
    # AnPyer 仓库根目录；给了就把 src/generated/third-party-notices.json 拷到 notices/
    [string]$AnPyerRepo = (Join-Path $PSScriptRoot '..' '..' 'AnPyer')
)

$ErrorActionPreference = 'Stop'
$root = Resolve-Path (Join-Path $PSScriptRoot '..')

$map = [ordered]@{
    '[COMPANY LEGAL NAME]'  = $LegalNameEn
    '[公司法定名称]'          = $LegalNameZh
}

$files = Get-ChildItem -Path $root -Recurse -File -Include *.html, *.xml, *.txt, CNAME |
    Where-Object { $_.FullName -notmatch '[\\/]\.git[\\/]' -and $_.FullName -notmatch '[\\/]scripts[\\/]' }

$changed = 0
foreach ($f in $files) {
    $text = Get-Content -Raw -Encoding UTF8 $f.FullName
    $new = $text
    foreach ($k in $map.Keys) { $new = $new.Replace($k, $map[$k]) }
    if ($new -ne $text) {
        [IO.File]::WriteAllText($f.FullName, $new, [Text.UTF8Encoding]::new($false))
        $changed++
        Write-Host "  updated  $($f.FullName.Substring($root.Path.Length + 1))"
    }
}
Write-Host "Placeholders: $changed file(s) updated."

$src = Join-Path $AnPyerRepo 'src' 'generated' 'third-party-notices.json'
if (Test-Path $src) {
    $dst = Join-Path $root 'notices' 'third-party-notices.json'
    Copy-Item $src $dst -Force
    Write-Host "Notices: copied $src -> notices/third-party-notices.json"
} else {
    Write-Warning "Notices JSON not found at $src — run 'uv run scripts/licenses.py --notice' in AnPyer first, or pass -AnPyerRepo."
}

# 残留检查
$left = Select-String -Path ($files | ForEach-Object FullName) -Pattern '\[(COMPANY LEGAL NAME|公司法定名称)\]' -SimpleMatch:$false
if ($left) {
    Write-Warning "Placeholders still present:"
    $left | ForEach-Object { Write-Host "  $($_.Path):$($_.LineNumber)" }
} else {
    Write-Host "No placeholders left."
}
