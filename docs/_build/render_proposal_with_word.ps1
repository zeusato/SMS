$ErrorActionPreference = 'Stop'
$proposalDocsRoot = Split-Path -Parent $PSScriptRoot
$proposalInput = Join-Path $proposalDocsRoot 'deliverables\SHS_Phuong_an_trien_khai_he_thong_quan_ly_kich_ban_v03.docx'
$proposalQa = Join-Path $proposalDocsRoot '_qa\proposal-v03'
New-Item -ItemType Directory -Path $proposalQa -Force | Out-Null
$proposalOutput = Join-Path $proposalQa 'SHS_Phuong_an_trien_khai_v03.pdf'
$proposalWord = $null
$proposalDocument = $null
$proposalOwnInstance = $false
try {
    $proposalWord = New-Object -ComObject Word.Application
    if ($proposalWord.Documents.Count -ne 0) { throw 'The automation instance contains existing documents; those documents will not be touched.' }
    $proposalOwnInstance = $true
    $proposalWord.Visible = $false
    $proposalWord.DisplayAlerts = 0
    $proposalWord.AutomationSecurity = 3
    $proposalDocument = $proposalWord.Documents.Open($proposalInput, $false, $true, $false)
    $proposalDocument.Repaginate()
    $proposalDocument.ExportAsFixedFormat($proposalOutput, 17)
    Write-Output $proposalOutput
    Write-Output ('Pages: ' + $proposalDocument.ComputeStatistics(2))
} finally {
    if ($null -ne $proposalDocument) {
        $proposalDocument.Close(0)
        [void][System.Runtime.InteropServices.Marshal]::FinalReleaseComObject($proposalDocument)
    }
    if ($null -ne $proposalWord) {
        if ($proposalOwnInstance) { $proposalWord.Quit(0) }
        [void][System.Runtime.InteropServices.Marshal]::FinalReleaseComObject($proposalWord)
    }
}
