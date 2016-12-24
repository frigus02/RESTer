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

$src = "src"
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
    & $polylint --root $src/site --input elements/rester-app.html
    QuitIfLastCommandFailed
}

function Build
{
    Write-Host "Build..."
    mkdir $dst/site/elements | Out-Null

    #& $vulcanize $src/site/elements/rester-app.html --inline-script --strip-comments | & $crisper --html $dst/site/elements/rester-app.html --js $dst/site/elements/rester-app.js
    & $vulcanize $src/site/index.html --inline-script --strip-comments | & $crisper --html $dst/site/index.html --js $dst/site/index.js
    QuitIfLastCommandFailed

    $additionalFiles = @(
        "background",
        "images",
        "site/bower_components/ace-builds/src-min-noconflict/theme-twilight.js",
        "site/bower_components/ace-builds/src-min-noconflict/mode-json.js",
        "site/bower_components/ace-builds/src-min-noconflict/worker-json.js",
        "site/bower_components/ace-builds/src-min-noconflict/mode-xml.js",
        "site/bower_components/ace-builds/src-min-noconflict/worker-xml.js",
        "site/bower_components/ace-builds/src-min-noconflict/mode-html.js",
        "site/bower_components/ace-builds/src-min-noconflict/worker-html.js",
        "site/bower_components/ace-builds/src-min-noconflict/mode-text.js",
        "site/bower_components/ace-builds/src-min-noconflict/ext-searchbox.js",
        #"site/bower_components/webcomponentsjs/webcomponents-lite.min.js",
        "site/elements/data/workers/format-code.js",
        "site/images",
        "site/other_components/vkbeautify/vkbeautify.js",
        "site/bower.json",
        #"site/index.html",
        "manifest.json"
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


Clean
if (-not $DontLint) { Lint }
Build
