<#
  scripts/build-journal.ps1
  Turns data/ojt.js into the Markdown files of the ojt-journal GitHub repo.

  HOW TO RUN (no installs needed - PowerShell ships with Windows):
    - Double-click  Update-Journal.bat  in the project root, OR
    - Right-click scripts\build-journal.ps1 > Run with PowerShell, OR
    - npm run journal:sync                (if you have Node installed)

  You only ever edit data/ojt.js. Run this, then commit + push the repo.

  OPTIONAL: pass a target folder, e.g.
    powershell -File scripts\build-journal.ps1 D:\somewhere\ojt-journal
#>
param(
  [string]$Target = ""
)

$ErrorActionPreference = "Stop"

$projectRoot = Split-Path -Parent $PSScriptRoot
$dataFile = Join-Path $projectRoot "data\ojt.js"

if (-not $Target) {
  $Target = Join-Path (Split-Path -Parent $projectRoot) "ojt-journal"
}
$Target = [System.IO.Path]::GetFullPath($Target)
$daysDir = Join-Path $Target "days"

if (-not (Test-Path $dataFile)) {
  throw "Cannot find data\ojt.js next to this script."
}

# ---------- 1. Read the JS data file ----------
$raw = [System.IO.File]::ReadAllText($dataFile)

# Trailing commas are valid JavaScript but not valid JSON, so we remove them
# before parsing. This walks the text and skips commas that sit right before a
# closing ] or } — but never inside a string.
function Remove-TrailingCommas([string]$Text) {
  $sb = New-Object System.Text.StringBuilder
  $inQuote = $false
  $i = 0
  $n = $Text.Length
  while ($i -lt $n) {
    $ch = $Text[$i]
    if ($inQuote) {
      [void]$sb.Append($ch)
      if ($ch -eq '\') { $i++; if ($i -lt $n) { [void]$sb.Append($Text[$i]) }; $i++; continue }
      if ($ch -eq '"') { $inQuote = $false }
      $i++
      continue
    }
    if ($ch -eq '"') { $inQuote = $true; [void]$sb.Append($ch); $i++; continue }
    if ($ch -eq ',') {
      $j = $i + 1
      while ($j -lt $n -and ($Text[$j] -eq ' ' -or $Text[$j] -eq "`t" -or $Text[$j] -eq "`r" -or $Text[$j] -eq "`n")) { $j++ }
      if ($j -lt $n -and ($Text[$j] -eq ']' -or $Text[$j] -eq '}')) { $i++; continue }
    }
    [void]$sb.Append($ch)
    $i++
  }
  return $sb.ToString()
}

function Get-Literal {
  # Takes the text between the given markers, drops full-line // comments,
  # and returns the { ... } or [ ... ] literal inside it.
  param([string]$Text, [string]$Start, [string]$End)

  $from = $Text.IndexOf($Start)
  if ($from -lt 0) { throw "Marker '$Start' not found in data\ojt.js" }
  $from = $Text.IndexOf($Start, $from) + $Start.Length
  $to = $Text.IndexOf($End, $from)
  if ($to -lt 0) { throw "Marker '$End' not found in data\ojt.js" }
  $block = $Text.Substring($from, $to - $from)

  # remove full-line comments
  $clean = ($block -split "`r?`n" | Where-Object { $_.Trim() -notlike '//*' }) -join "`n"
  $clean = $clean.Trim()

  # drop the "export const name =" prefix (only when it is really there)
  if ($clean.StartsWith("export")) {
    $eq = $clean.IndexOf("=")
    if ($eq -ge 0) { $clean = $clean.Substring($eq + 1).Trim() }
  }
  # drop a trailing semicolon
  $clean = ($clean -replace ';\s*$', '').Trim()
  # JavaScript allows trailing commas, JSON does not — remove them.
  $clean = Remove-TrailingCommas $clean
  return $clean
}

$metaSource = Get-Literal -Text $raw -Start "export const ojtMeta =" -End "export const ojtEntries ="
$entriesSource = Get-Literal -Text $raw -Start "export const ojtEntries =" -End "export const ojtFileName"

# ---------- 2. Parse the literals ----------
Add-Type -AssemblyName System.Web.Extensions
$serializer = New-Object System.Web.Script.Serialization.JavaScriptSerializer

$meta = $serializer.DeserializeObject($metaSource)
$entries = $serializer.DeserializeObject($entriesSource)

if ($entries.Count -eq 0) { throw "No journal entries found in data\ojt.js" }

# ---------- 3. Build the Markdown ----------
function Get-LongDate([string]$iso) {
  return ([datetime]::ParseExact($iso, "yyyy-MM-dd", $null)).ToString("dddd, MMMM d, yyyy")
}
function Get-ShortDate([string]$iso) {
  return ([datetime]::ParseExact($iso, "yyyy-MM-dd", $null)).ToString("MMM d, yyyy")
}
function Get-FileName($entry) {
  return "day-{0:d2}-{1}.md" -f ([int]$entry["day"]), $entry["date"]
}

if (-not (Test-Path $daysDir)) {
  New-Item -ItemType Directory -Path $daysDir -Force | Out-Null
}

foreach ($entry in $entries) {
  $lines = @()
  $lines += "# Day $($entry['day']) — $($entry['title'])"
  $lines += ""
  $lines += "**Date:** $(Get-LongDate $entry['date'])"
  $lines += "**Focus:** $($entry['focus'])"
  $lines += ""
  $lines += "## ✅ What I did"
  $lines += ""
  foreach ($t in $entry["tasks"]) { $lines += "- $t" }
  $lines += ""
  $lines += "## 💡 What I learned"
  $lines += ""
  foreach ($t in $entry["learnings"]) { $lines += "- $t" }
  $lines += ""
  $lines += "## 🛠️ Tools used"
  $lines += ""
  $toolNames = @($entry["tools"] | ForEach-Object { "``$_``" })
  $lines += ($toolNames -join " · ")
  $lines += ""
  if ($entry["next"]) {
    $lines += "## ➡️ Next"
    $lines += ""
    $lines += $entry["next"]
    $lines += ""
  }
  $lines += "---"
  $lines += ""
  $lines += "*Logged by $($meta['author']) during work immersion — part of my OJT journal.*"
  $lines += ""

  $file = Get-FileName $entry
  [System.IO.File]::WriteAllText((Join-Path $daysDir $file), ($lines -join "`r`n"), (New-Object System.Text.UTF8Encoding($false)))
}

# ---------- 4. The repo README ----------
$table = @()
foreach ($entry in ($entries | Sort-Object { [int]$_["day"] })) {
  $file = Get-FileName $entry
  $table += "| $($entry['day']) | $(Get-ShortDate $entry['date']) | $($entry['title']) | [$file](days/$file) |"
}

$readme = @()
$readme += "# 📓 OJT Journal — $($meta['author'])"
$readme += ""
$readme += $meta["intro"]
$readme += ""
$readme += "**Role:** $($meta['role']) · **Team:** $($meta['team']) · **Period:** $($meta['period'])"
$readme += ""
$readme += "## 📅 Entries"
$readme += ""
$readme += "| Day | Date | Entry | File |"
$readme += "|---|---|---|---|"
$readme += $table
$readme += ""
$readme += "## 🔁 How I keep this updated"
$readme += ""
$readme += "1. Edit ``data/ojt.js`` in my portfolio repo — that is the one source of truth."
$readme += "2. Run ``Update-Journal.bat`` — this regenerates every file in ``days/``."
$readme += "3. Commit and push the day's entry:"
$readme += ""
$readme += '```bash'
$readme += "cd ../ojt-journal"
$readme += "git add ."
$readme += 'git commit -m "Day 1: orientation and team setup"'
$readme += "git push"
$readme += '```'
$readme += ""
$readme += "## 🔗 Links"
$readme += ""
$readme += "- Live journal on my portfolio: $($meta['pageUrl'])"
$readme += "- Portfolio repo: https://github.com/silvernelcardinal-crypto/Portfolio"
$readme += ""
$readme += "> ⚠️ Everything here is public. No company secrets, no credentials, no personal data."
$readme += ""

[System.IO.File]::WriteAllText((Join-Path $Target "README.md"), ($readme -join "`r`n"), (New-Object System.Text.UTF8Encoding($false)))

# ---------- 5. Clean up stale day files ----------
foreach ($file in Get-ChildItem $daysDir -Filter "day-*.md" -ErrorAction SilentlyContinue) {
  $known = $entries | Where-Object { (Get-FileName $_) -eq $file.Name }
  if (-not $known) {
    Remove-Item $file.FullName
    Write-Host "Removed stale file: days/$($file.Name)"
  }
}

Write-Host ""
Write-Host "Wrote $($entries.Count) day file(s) + README.md" -ForegroundColor Green
Write-Host "Target: $Target" -ForegroundColor Cyan
Write-Host ""
Write-Host "Next: cd ""$Target"" ; git add . ; git commit -m ""Add journal entries"" ; git push" -ForegroundColor Yellow
