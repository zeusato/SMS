$ErrorActionPreference = 'Stop'
$smsDocsRoot = Split-Path -Parent $PSScriptRoot
$smsInput = Join-Path $smsDocsRoot 'deliverables\SMS_De_xuat_he_thong_v02.docx'
$smsQa = Join-Path $smsDocsRoot '_qa'
New-Item -ItemType Directory -Path $smsQa -Force | Out-Null
$smsOutput = Join-Path $smsQa 'SMS_De_xuat_he_thong_v02.pdf'
$smsWord = $null
$smsDocument = $null
$smsOwnInstance = $false
try {
    $smsWord = New-Object -ComObject Word.Application
    if ($smsWord.Documents.Count -ne 0) {
        throw 'Word automation did not return an empty instance; existing documents will not be changed.'
    }
    $smsOwnInstance = $true
    $smsWord.Visible = $false
    $smsWord.DisplayAlerts = 0
    $smsWord.AutomationSecurity = 3
    $smsDocument = $smsWord.Documents.Open($smsInput, $false, $true, $false)
    $smsDocument.Repaginate()
    $smsDocument.ExportAsFixedFormat($smsOutput, 17)
    Write-Output $smsOutput
    Write-Output ('Pages: ' + $smsDocument.ComputeStatistics(2))
} finally {
    if ($null -ne $smsDocument) {
        $smsDocument.Close(0)
        [void][System.Runtime.InteropServices.Marshal]::FinalReleaseComObject($smsDocument)
    }
    if ($null -ne $smsWord) {
        if ($smsOwnInstance) { $smsWord.Quit(0) }
        [void][System.Runtime.InteropServices.Marshal]::FinalReleaseComObject($smsWord)
    }
}
