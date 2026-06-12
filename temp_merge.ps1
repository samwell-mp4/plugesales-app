$ErrorActionPreference = 'Stop'
$dataTs = Get-Content "src/academy/data.ts" -Raw -Encoding UTF8
$userJson = Get-Content "temp_user.json" -Raw -Encoding UTF8 | ConvertFrom-Json

$articles = $userJson.PSObject.Properties

foreach ($article in $articles) {
    $articleId = $article.Name
    $blocks = $article.Value | ConvertTo-Json -Depth 10
    
    # Convert JSON to TypeScript-like format with single quotes
    $blocksTS = $blocks -replace '"([^"]+)":', '$1:'
    $blocksTS = $blocksTS -replace ':"([^"]+)"', ":'$1'"
    
    # Find the article in data.ts
    $startMarker = "  '$articleId': {"
    $startIdx = $dataTs.IndexOf($startMarker)
    if ($startIdx -eq -1) {
        Write-Host "NOT FOUND: $articleId"
        continue
    }
    
    # Find "blocks: [" after startMarker
    $blocksStart = $dataTs.IndexOf("    blocks: [", $startIdx)
    if ($blocksStart -eq -1) {
        Write-Host "NO BLOCKS: $articleId"
        continue
    }
    
    # Find closing pattern
    $closePattern = "`n    ],`n  },`n"
    $endIdx = $dataTs.IndexOf($closePattern, $blocksStart)
    if ($endIdx -eq -1) {
        Write-Host "NO CLOSE: $articleId"
        continue
    }
    $endIdx = $endIdx + $closePattern.Length
    
    # Indent the blocks
    $lines = $blocksTS -split "`n"
    $indented = ($lines | ForEach-Object { "      $_" }) -join "`n"
    
    $newSection = "    blocks: [`n$indented`n    ],`n  },`n"
    
    $dataTs = $dataTs.Substring(0, $blocksStart) + $newSection + $dataTs.Substring($endIdx)
    Write-Host "REPLACED: $articleId"
}

Set-Content "src/academy/data.ts" $dataTs -Encoding UTF8 -NoNewline
Write-Host "DONE"
