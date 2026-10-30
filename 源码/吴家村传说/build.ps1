$ErrorActionPreference = 'Stop'
Set-Location $PSScriptRoot
$sdkPath = 'D:/Android Studio/Sdk'
$javaBin = 'D:/Android Studio/studio/jbr/bin'
$buildTools = "$sdkPath/build-tools/35.0.0"
$platformJar = "$sdkPath/platforms/android-35/android.jar"
function Run-Checked { param([string]$Exe,[string[]]$Arguments) & $Exe @Arguments; if ($LASTEXITCODE -ne 0) { throw "Build step failed: $Exe" } }
New-Item -ItemType Directory -Force -Path build/classes,build/dex,release | Out-Null
Run-Checked "$buildTools/aapt.exe" @('package','-f','-M','AndroidManifest.xml','-S','res','-A','assets','-I',$platformJar,'-F','build/base.apk')
Run-Checked "$javaBin/javac.exe" @('-encoding','UTF-8','--release','8','-classpath',$platformJar,'-d','build/classes','src/cn/wujiacun/legends/MainActivity.java')
$classFiles = @(Get-ChildItem build/classes -Filter '*.class' -Recurse | ForEach-Object {$_.FullName})
Run-Checked "$javaBin/java.exe" (@('-cp',"$buildTools/lib/d8.jar",'com.android.tools.r8.D8','--lib',$platformJar,'--min-api','26','--output','build/dex') + $classFiles)
Copy-Item build/base.apk build/unsigned.apk -Force
Add-Type -AssemblyName System.IO.Compression.FileSystem
$archive = [System.IO.Compression.ZipFile]::Open((Join-Path $PSScriptRoot 'build/unsigned.apk'),[System.IO.Compression.ZipArchiveMode]::Update)
try { [System.IO.Compression.ZipFileExtensions]::CreateEntryFromFile($archive,(Join-Path $PSScriptRoot 'build/dex/classes.dex'),'classes.dex') | Out-Null } finally { $archive.Dispose() }
Run-Checked "$buildTools/zipalign.exe" @('-f','4','build/unsigned.apk','build/aligned.apk')
# Local distribution key. Keep it to sign future updates of the same app.
if (!(Test-Path 'release/local-signing.jks')) {
 Run-Checked "$javaBin/keytool.exe" @('-genkeypair','-keystore','release/local-signing.jks','-storepass','wujia-local-build','-keypass','wujia-local-build','-alias','wujia','-keyalg','RSA','-keysize','2048','-validity','10000','-dname','CN=Wujia Legends Local Build')
}
Run-Checked "$javaBin/java.exe" @('-jar',"$buildTools/lib/apksigner.jar",'sign','--ks','release/local-signing.jks','--ks-pass','pass:wujia-local-build','--key-pass','pass:wujia-local-build','--out','release/Wujia-Legends-1.2.3.apk','build/aligned.apk')
Run-Checked "$javaBin/java.exe" @('-jar',"$buildTools/lib/apksigner.jar",'verify','--verbose','release/Wujia-Legends-1.2.3.apk')
Run-Checked "$buildTools/aapt.exe" @('dump','badging','release/Wujia-Legends-1.2.3.apk')



