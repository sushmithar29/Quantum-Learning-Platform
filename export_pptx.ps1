param()
$pptxPath = "c:\Users\sushm\OneDrive\Desktop\e green quanta\SIH2026_QuantumLab_Winning_Presentation.pptx"
$pdfPath  = "c:\Users\sushm\OneDrive\Desktop\e green quanta\SIH2026_QuantumLab_Winning_Presentation.pdf"
$imgDir   = "c:\Users\sushm\OneDrive\Desktop\e green quanta\slide_images"

if (!(Test-Path $imgDir)) {
    New-Item -ItemType Directory -Path $imgDir | Out-Null
}

$ppt = New-Object -ComObject PowerPoint.Application
$pres = $ppt.Presentations.Open($pptxPath, 2, 0, 0) # 2=ReadOnly, 0=Untitled, 0=WithWindow(False)

$pres.SaveAs($pdfPath, 32) # 32 = ppSaveAsPDF
Write-Host "Exported PDF successfully to: $pdfPath"

$idx = 1
foreach ($s in $pres.Slides) {
    $imgPath = Join-Path $imgDir ("Slide_$idx.png")
    $s.Export($imgPath, "PNG", 1920, 1080)
    Write-Host "Exported slide $idx to $imgPath"
    $idx++
}

$pres.Close()
$ppt.Quit()
[System.Runtime.Interopservices.Marshal]::ReleaseComObject($pres) | Out-Null
[System.Runtime.Interopservices.Marshal]::ReleaseComObject($ppt) | Out-Null
[System.GC]::Collect()
[System.GC]::WaitForPendingFinalizers()
Write-Host "All exports completed successfully!"
