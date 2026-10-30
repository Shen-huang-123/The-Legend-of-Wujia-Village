$ErrorActionPreference = 'Stop'
$project = Split-Path $PSScriptRoot -Parent
$manifest = Get-Content -Raw -LiteralPath (Join-Path $project 'AndroidManifest.xml')
$activity = Get-Content -Raw -LiteralPath (Join-Path $project 'src/cn/wujiacun/legends/MainActivity.java')
$build = Get-Content -Raw -LiteralPath (Join-Path $project 'build.ps1')

$checks = [ordered]@{
    'custom launch theme' = $manifest.Contains('android:theme="@style/Theme.Wujia"')
    'version 1.2.4' = $manifest.Contains('android:versionCode="8"') -and $manifest.Contains('android:versionName="1.2.4"')
    'webview hidden before ready' = $activity.Contains('game.setAlpha(0f)')
    'critical menu art gate' = $activity.Contains('sources=[a.background,a.character]')
    'javascript ready bridge' = $activity.Contains('@JavascriptInterface public void ready()')
    'failed asset settles' = $activity.Contains('image.onerror=finish') -and $activity.Contains('setTimeout(finish,2800)')
    'stalled startup recovery' = $activity.Contains('recoverFromStalledStartup')
    'matching dark background' = $activity.Contains('0xff050308')
    'versioned APK output' = $build.Contains('Wujia-Legends-1.2.4.apk')
}

$failed = @($checks.GetEnumerator() | Where-Object { -not $_.Value })
if ($failed.Count) {
    $failed | ForEach-Object { Write-Error "FAIL: $($_.Key)" }
    exit 1
}
$checks.Keys | ForEach-Object { Write-Output "PASS: $_" }
