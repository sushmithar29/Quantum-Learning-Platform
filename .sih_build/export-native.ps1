$ErrorActionPreference = 'Stop'
$deckPath = 'C:\Users\sushm\OneDrive\Desktop\e green quanta\output\QuantumLab_SIH2026_Presentation.pptx'
$pdfPath = 'C:\Users\sushm\OneDrive\Desktop\e green quanta\.sih_build\native-export.pdf'
$previewDir = 'C:\Users\sushm\OneDrive\Desktop\e green quanta\.sih_build\native'
New-Item -ItemType Directory -Force -Path $previewDir | Out-Null
$pptApplication = New-Object -ComObject PowerPoint.Application
$deck = $null
try {
  $deck = $pptApplication.Presentations.Open($deckPath, -1, 0, 0)
  for ($slideIndex = 1; $slideIndex -le $deck.Slides.Count; $slideIndex++) {
    $destination = Join-Path $previewDir ('slide-' + $slideIndex + '.png')
    $deck.Slides.Item($slideIndex).Export($destination, 'PNG', 1920, 1080)
  }
  $deck.SaveAs($pdfPath, 32)
  Write-Output ('Exported ' + $deck.Slides.Count + ' slides and PDF through PowerPoint.')
} finally {
  if ($null -ne $deck) { $deck.Close(); [void][System.Runtime.Interopservices.Marshal]::ReleaseComObject($deck) }
  [void][System.Runtime.Interopservices.Marshal]::ReleaseComObject($pptApplication)
}
