function Get-AEScript-Path {
    param([bool]$readEnv = $false)
    if ($readEnv) {
        $envPath = ".env"
        if (Test-Path $envPath) {
            $lines = Get-Content($envPath)
            foreach ($line in $lines) {
                if ($line -cmatch '^AE_PATH=(.+)$') {
                    $path = $Matches[1]
                    break
                }
            }
            if ($null -eq $path) {
                Write-Error "AE_PATH not found in .env file"
                return Get-AEScript-Path
            }
        }
    }
    else {
        $path = Read-Host "`nEnter the AE path (e.g C:\Program Files (x86)\AE\Adobe After Effects 2024\Support Files)"
    } 
    if (Test-Path $path -PathType Container) {
        return Join-Path $path "Scripts"
    }
    else {
        Write-Error "It should be folder path"
        return Get-AEScript-Path
    } 
}
function Get-Type-TargetDir {
    param(
        [string]$fileName,
        [string]$AEScriptPath
    )
    $fileName = $fileName -replace '.min', ''
    $info = $fileName.Split('.')
    $type = $info[$info.Count - 2]
    if ($type -notin @('lib', 'ui')) {
        $type = 'script'
    }
    $paths = @{
        script = $AEScriptPath
        lib    = Join-Path $AEScriptPath "Startup"    
        ui     = Join-Path $AEScriptPath "ScriptUI Panels"
    }
    Write-Host "`nFile type: $type"
    return $paths.$type
}
function Select-Option {
    param(
        [string]$title,
        [array]$options,
        [string]$optionTitle
    )

    Write-Host "`n$title"
    for ($i = 0; $i -lt $options.Count; $i++) {
        Write-Host "  $($i + 1). $(if ($optionTitle) { $options[$i].($optionTitle) } else { $options[$i] })"
    }
    $selection = Read-Host "Enter number (1-$($options.Count))"
    $option = $options[$selection - 1]

    if ($option) {
        return $option
    }
    else {
        Write-Error "Invalid number"
        return Select-Option $title $options
    }
}
function Select-File {
    param(
        [string]$AEScriptPath,
        [array]$files,
        [string]$nameKey,
        [string]$pathKey
    )
    $option = Select-Option "Please select a file to install:" $files $nameKey
    $fileName = $option.$nameKey
    $targetDir = Get-Type-TargetDir $fileName $AEScriptPath
    $sourcePath = $option.$pathKey
    $targetPath = Join-Path $targetDir $fileName
    Write-Host "source path: $sourcePath"
    Write-Host "target path: $targetPath"
    Read-Host "Press any key to install..."
    return @($sourcePath, $targetPath)
}
function Main {
    $Web = @{
        title = "Web";
        fn    = {
            $path = Get-AEScript-Path
            $owner = "Cubxx"
            $repo = "ae-script"
            try {
                Write-Host "Fetching files from GitHub..."
                $response = Invoke-RestMethod -Uri "https://api.github.com/repos/$owner/$repo/contents/dist?ref=main"
                $response = $response | Where-Object { $_.name -match ".jsx$" }
            }
            catch {
                Write-Error $_
                exit
            }
            $i = {
                $_, $source, $target = Select-File $path $response "name" "download_url"
                Invoke-WebRequest -Uri $source -OutFile $target
                Write-Host "Successfully Install"
                & $i
            }
            & $i
        }
    }
    $Local = @{ 
        title = "Local";
        fn    = {
            $readEnv = Select-Option "Do you want to read AE_PATH from .env file?" @(
                @{ title = "Yes"; value = $true },
                @{ title = "No"; value = $false }
            ) "title"
            $path = Get-AEScript-Path $readEnv.value
            $files = Get-ChildItem "dist" -Filter "*.jsx"             
            $i = {
                $_, $source, $target = Select-File $path $files "name" "fullName"
                Copy-Item -Path $source -Destination $target -Force
                Write-Host "Successfully Install"
                & $i
            }
            & $i
        }
    }
    $option = Select-Option "Please select an installation method:" $($Web, $Local) "title" 
    & $option.fn
}
Main