function Exists([string] $file)
{
    $item = Get-Item $file -ErrorAction SilentlyContinue
    return !!$item
}

function NotExists([string] $file)
{
    return !(Exists($file))
}

function IsDir([string] $file)
{
    $item = Get-Item $src/$file
    return $item.PSIsContainer
}

function QuitIfLastCommandFailed
{
    if (-not $?)
    {
        exit 1
    }
}
