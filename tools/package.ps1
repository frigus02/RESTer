$ScriptPath = Split-Path -Path $MyInvocation.MyCommand.Definition -Parent
. $ScriptPath\_helpers.ps1


$dst = ".package"


function Clean
{
    Write-Host "Clean..."
    if (Exists($dst))
    {
        Remove-Item -Recurse -Force $dst | Out-Null
    }
}

function Package
{
    Write-Host "Package..."

    mkdir $dst/data/site | Out-Null
    Copy-Item -Recurse .build/* $dst/data/site/

    Copy-Item -Recurse data/images $dst/data/
    Copy-Item -Recurse data/site-content $dst/data/
    Copy-Item -Recurse lib $dst/
    Copy-Item icon.png $dst/
    Copy-Item index.js $dst/
    Copy-Item LICENSE $dst/
    Copy-Item package.json $dst/

    jpm xpi --addon-dir $dst
}


Clean
Package
