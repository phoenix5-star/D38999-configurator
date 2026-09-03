Write-Host "Running Pre-Commit Integrity and Code Quality Checks..." -ForegroundColor Cyan

$errors = @()

# 1. Validate HTML structure across all HTML pages
$htmlFiles = @("index.html", "admin.html")
$voidTags = [System.Collections.Generic.HashSet[string]]::new([string[]]@('area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'link', 'meta', 'param', 'source', 'track', 'wbr'), [System.StringComparer]::OrdinalIgnoreCase)
$tagRegex = [regex]'<\/?([a-zA-Z0-9\-]+)(?:\s+[^>]*)?\/?>'

foreach ($hf in $htmlFiles) {
    if (-not (Test-Path $hf)) { continue }
    try {
        $html = Get-Content -Raw -Path $hf
        $matches = $tagRegex.Matches($html)
        $stack = [System.Collections.Generic.Stack[string]]::new()

        foreach ($m in $matches) {
            $fullTag = $m.Value
            $tagName = $m.Groups[1].Value.ToLower()
            $isClosing = $fullTag.StartsWith('</')
            $isSelfClosing = $fullTag.EndsWith('/>') -or $voidTags.Contains($tagName)

            if ($isClosing) {
                if ($stack.Count -eq 0) {
                    $errors += "HTML Error in $($hf): Unexpected closing tag </$tagName> found."
                } else {
                    $last = $stack.Pop()
                    if ($last -ne $tagName) {
                        $errors += "HTML Error in $($hf): Mismatched tag. Expected closing </$last>, but found </$tagName>."
                    }
                }
            } elseif (-not $isSelfClosing) {
                $stack.Push($tagName)
            }
        }

        if ($stack.Count -gt 0) {
            $remaining = ($stack.ToArray()) -join ', '
            $errors += "HTML Error in $($hf): Unclosed tags remaining: $remaining"
        } else {
            Write-Host "[PASS] $hf structure verified (no unclosed tags, valid nesting)." -ForegroundColor Green
        }
    } catch {
        $errors += "HTML Check Failed for $($hf): $($_.Exception.Message)"
    }
}

# 2. Validate CSS structure
try {
    $cssFiles = @("styles.css", "admin.css")
    foreach ($cf in $cssFiles) {
        if (-not (Test-Path $cf)) { continue }
        $css = Get-Content -Raw -Path $cf
        $openBraces = 0
        $inComment = $false

        for ($i = 0; $i -lt $css.Length; $i++) {
            $c = $css[$i]
            $next = if ($i + 1 -lt $css.Length) { $css[$i + 1] } else { '' }

            if ($inComment) {
                if ($c -eq '*' -and $next -eq '/') {
                    $inComment = $false
                    $i++
                }
            } else {
                if ($c -eq '/' -and $next -eq '*') {
                    $inComment = $true
                    $i++
                } elseif ($c -eq '{') {
                    $openBraces++
                } elseif ($c -eq '}') {
                    $openBraces--
                    if ($openBraces -lt 0) {
                        $errors += "CSS Error in $($cf): Unexpected closing brace '}' without matching '{' at character $i"
                        break
                    }
                }
            }
        }

        if ($openBraces -ne 0) {
            $errors += "CSS Error in $($cf): Mismatched braces. Open balance: $openBraces"
        } else {
            Write-Host "[PASS] $cf syntax verified (matching braces, valid comment blocks)." -ForegroundColor Green
        }
    }
} catch {
    $errors += "CSS Check Failed: $($_.Exception.Message)"
}

# 3. Validate JSON Data Models
try {
    $dataFiles = @("series.json", "shells.json", "finishes.json", "layouts.json", "contacts.json", "tooling.json", "accessories.json")
    foreach ($file in $dataFiles) {
        $path = Join-Path "data" $file
        if (-not (Test-Path $path)) {
            $errors += "Data Error: Missing $path"
            continue
        }
        $raw = Get-Content -Raw $path
        $null = ConvertFrom-Json $raw
    }
    Write-Host "[PASS] All data/*.json files verified (valid JSON syntax and structure)." -ForegroundColor Green
} catch {
    $errors += "Data Check Failed: $($_.Exception.Message)"
}


Write-Host "--------------------------------------------------"
if ($errors.Count -gt 0) {
    Write-Host "VALIDATION FAILED:" -ForegroundColor Red
    foreach ($err in $errors) {
        Write-Host "  * $err" -ForegroundColor Red
    }
    exit 1
} else {
    Write-Host "ALL QUALITY & INTEGRITY CHECKS PASSED!" -ForegroundColor Green
    exit 0
}
