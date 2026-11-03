$ErrorActionPreference = 'Stop'
$root = Split-Path $PSScriptRoot -Parent
$launcher = Join-Path $root 'start-admin-windows.bat'
$bytes = [IO.File]::ReadAllBytes($launcher)
$source = [Text.Encoding]::ASCII.GetString($bytes)
if (@($bytes | Where-Object { $_ -gt 127 -or ($_ -lt 32 -and $_ -ne 10 -and $_ -ne 13) }).Count) { throw 'Launcher must contain ASCII text without control characters.' }
if ($source.Replace("`r`n", '').Contains("`n")) { throw 'Launcher must use CRLF line endings.' }

function New-Cmd([string]$command, [string]$pathValue = $env:PATH) {
    $start = [Diagnostics.ProcessStartInfo]::new()
    $start.FileName = $env:ComSpec
    # CMD parses its own command string; avoid CRT escaping of its inner quotes.
    $start.Arguments = '/d /v:off /c ' + $command
    $start.UseShellExecute = $false
    $start.CreateNoWindow = $true
    $start.RedirectStandardOutput = $true
    $start.RedirectStandardError = $true
    $start.RedirectStandardInput = $true
    $start.Environment['PATH'] = $pathValue
    $process = [Diagnostics.Process]::Start($start)
    return [pscustomobject]@{ Process=$process; Output=$process.StandardOutput.ReadToEndAsync(); Error=$process.StandardError.ReadToEndAsync() }
}
function Stop-Cmd($job) {
    if (-not $job.Process.HasExited) { $job.Process.Kill($true); $job.Process.WaitForExit() }
}
function Run-Check([string]$file, [int]$expected, [string]$message, [string]$pathValue = $env:PATH) {
    $job = New-Cmd ('call "' + $file + '" --check') $pathValue
    try {
        $job.Process.StandardInput.Close()
        if (-not $job.Process.WaitForExit(15000)) { throw "Preflight did not finish: $file" }
        $output = $job.Output.Result + $job.Error.Result
        if ($job.Process.ExitCode -ne $expected -or $output -notmatch [regex]::Escape($message)) { throw "Unexpected preflight result [$($job.Process.ExitCode)]: $output" }
    } finally { Stop-Cmd $job }
}

$temporary = Join-Path ([IO.Path]::GetTempPath()) ('algo quest ' + [char]0x542f + [char]0x52a8 + ' (local)! & ' + [guid]::NewGuid().ToString('N'))
$complete = Join-Path $temporary 'complete project'
$incomplete = Join-Path $temporary 'only launcher'
New-Item -ItemType Directory -Path $complete,$incomplete -Force | Out-Null
try {
    foreach ($name in @('start-admin-windows.bat','package.json','admin')) { Copy-Item (Join-Path $root $name) $complete -Recurse }
    New-Item -ItemType Directory -Path (Join-Path $complete 'src/config') -Force | Out-Null
    Copy-Item (Join-Path $root 'src/config/cloud.js') (Join-Path $complete 'src/config/cloud.js')
    Copy-Item $launcher $incomplete
    $completeLauncher = Join-Path $complete 'start-admin-windows.bat'
    $incompleteLauncher = Join-Path $incomplete 'start-admin-windows.bat'
    Run-Check $completeLauncher 0 'Preflight OK'
    Run-Check $incompleteLauncher 1 'AQ_PROJECT_FILES'
    Run-Check $completeLauncher 1 'AQ_NODE_NOT_FOUND' (Join-Path $env:SystemRoot 'System32')

    # Double-click equivalent: a failure must leave its child CMD running until explicitly closed.
    $held = New-Cmd ('call "' + $incompleteLauncher + '"')
    try {
        if ($held.Process.WaitForExit(1800)) { throw 'The console closed after a startup error.' }
        $held.Process.StandardInput.WriteLine('exit')
        $held.Process.StandardInput.Close()
        if (-not $held.Process.WaitForExit(5000)) { throw 'The retained console did not accept exit.' }
        if (($held.Output.Result + $held.Error.Result) -notmatch 'AQ_PROJECT_FILES') { throw 'The retained console did not display the startup failure.' }
    } finally { Stop-Cmd $held }

    # Start the actual server through CMD and the BAT, with no browser or production requests.
    $server = New-Cmd ('call "' + $completeLauncher + '" --run --no-open')
    try {
        $session = $null
        $deadline = [DateTime]::UtcNow.AddSeconds(15)
        while ([DateTime]::UtcNow -lt $deadline) {
            if ($server.Process.HasExited) { throw ('Server exited: ' + $server.Output.Result + $server.Error.Result) }
            try { $session = Invoke-RestMethod 'http://127.0.0.1:4780/api/session' -TimeoutSec 1; break } catch { Start-Sleep -Milliseconds 150 }
        }
        if ($null -eq $session -or $session.authenticated -ne $false) { throw 'The real server did not start through the Windows launcher.' }
        $html = Invoke-WebRequest 'http://127.0.0.1:4780/' -TimeoutSec 2
        if ($html.StatusCode -ne 200 -or $html.Content -notmatch 'id="sign-in"') { throw 'Dashboard HTML was not served.' }

        # A second launch must print its port error and retain the console as well.
        $duplicate = New-Cmd ('call "' + $completeLauncher + '"')
        try {
            if ($duplicate.Process.WaitForExit(1800)) { throw 'The console closed on a server startup failure.' }
            $duplicate.Process.StandardInput.WriteLine('exit')
            $duplicate.Process.StandardInput.Close()
            if (-not $duplicate.Process.WaitForExit(5000)) { throw 'The duplicate retained console did not accept exit.' }
            if (($duplicate.Output.Result + $duplicate.Error.Result) -notmatch 'AQ_SERVER_EXIT') { throw 'The server failure was not reported.' }
        } finally { Stop-Cmd $duplicate }
    } finally { Stop-Cmd $server }
    Write-Host 'Windows startup passed: ASCII/CRLF, spaced Unicode paths, complete extraction, missing Node, real server startup, and retained error consoles.'
} finally {
    Remove-Item $temporary -Recurse -Force -ErrorAction SilentlyContinue
}
