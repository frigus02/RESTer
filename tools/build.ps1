Param(
    [switch]$DontLint,
    [switch]$Serve
)


$ScriptPath = Split-Path -Path $MyInvocation.MyCommand.Definition -Parent
. $ScriptPath\_helpers.ps1
$OutputEncoding = [System.Text.Encoding]::UTF8
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8


$polylint = ".\node_modules\.bin\polylint"
$vulcanize = ".\node_modules\.bin\vulcanize"
$crisper = ".\node_modules\.bin\crisper"
$browserSync = ".\node_modules\.bin\browser-sync"

$src = "data/site"
$dst = ".build"


function Clean
{
    Write-Host "Clean..."
    if (Exists($dst))
    {
        Remove-Item -Recurse -Force $dst | Out-Null
    }
}

function Lint
{
    Write-Host "Lint..."
    & $polylint --root $src --input elements/rester-app.html
    QuitIfLastCommandFailed
}

function Build
{
    Write-Host "Build..."
    mkdir $dst/elements | Out-Null

    & $vulcanize $src/elements/rester-app.html --inline-script --strip-comments | & $crisper --html $dst/elements/rester-app.html --js $dst/elements/rester-app.js
    QuitIfLastCommandFailed

    $additionalFiles = @(
        "bower_components/ace-builds/src-min-noconflict/theme-twilight.js",
        "bower_components/ace-builds/src-min-noconflict/mode-json.js",
        "bower_components/ace-builds/src-min-noconflict/worker-json.js",
        "bower_components/ace-builds/src-min-noconflict/mode-xml.js",
        "bower_components/ace-builds/src-min-noconflict/worker-xml.js",
        "bower_components/ace-builds/src-min-noconflict/mode-html.js",
        "bower_components/ace-builds/src-min-noconflict/worker-html.js",
        "bower_components/ace-builds/src-min-noconflict/mode-text.js",
        "bower_components/ace-builds/src-min-noconflict/ext-searchbox.js",
        "bower_components/webcomponentsjs/webcomponents-lite.min.js",
        "elements/data/workers/format-code.js",
        "images",
        "other_components/vkbeautify/vkbeautify.js",
        "bower.json",
        "index.html"
    )
    foreach ($file in $additionalFiles)
    {
        if ($file.Contains("/"))
        {
            $parentFolder = $file.Substring(0, $file.LastIndexOf("/"))
            if (NotExists("$dst/$parentFolder"))
            {
                mkdir $dst/$parentFolder | Out-Null
            }
        }

        if (IsDir($file))
        {
            Copy-Item -Recurse $src/$file $dst/$file
        }
        else
        {
            Copy-Item $src/$file $dst/$file
        }
    }
}

function Serve
{
    Write-Host "Serve..."
    & $browserSync start --server $dst
}


Clean
if (-not $DontLint) { Lint }
Build
if ($Serve) { Serve }
