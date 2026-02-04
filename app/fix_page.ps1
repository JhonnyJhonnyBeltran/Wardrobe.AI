$path = "c:\Users\EthanCurro\Desktop\Ethan's Project\Wardobre.ai\Wardrobe.AI\app\page.tsx"
$lines = [System.IO.File]::ReadAllLines($path)
$output = @()
$globalSlidesDeleted = $false
$inGlobalSlides = $false

foreach ($line in $lines) {
    if ($line.Trim() -eq "const slides = [" -and -not $inGlobalSlides -and -not $globalSlidesDeleted) {
        $inGlobalSlides = $true
        $globalSlidesDeleted = $true
        continue
    }

    if ($inGlobalSlides) {
        if ($line.Trim() -eq "];") {
            $inGlobalSlides = $false
        }
        continue
    }

    if ($line.Contains("Listo para empezar?")) {
        $output += "                  {t.onboarding.cta.title}"
        continue
    }

    $output += $line
}

[System.IO.File]::WriteAllLines($path, $output)
