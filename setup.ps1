function Test-Folder-Path {
    param([string]$path)
    if (Test-Path $path -PathType Container) {
        return $true      
    }
    else {
        Write-Error "'$path' should be folder path"
        return $false
    }
}
function Get-AEScript-Path {
    $scriptPath = Read-Host "Enter the AE scripts folder path (e.g E:\Ae\Adobe After Effects 2022\Support Files\Scripts)"    
    $libPath = Join-Path $scriptPath "Startup"    
    $uiPath = Join-Path $scriptPath "ScriptUI Panels"
    
    if ((Test-Folder-Path $scriptPath) -and (Test-Folder-Path $libPath) -and (Test-Folder-Path $uiPath)) {
        Write-Host "Get AE script path successfully"
        return @{
            script = $scriptPath
            lib    = $libPath
            UI     = $uiPath 
        }
    }
    else {
        return Get-AEScript-Path
    } 
}
function Select-Option {
    param(
        [string]$title,
        [array]$options,
        [string]$optionTitle
    )

    Write-Host $title
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
function Install-Web {
    param([hashtable]$paths)
    $owner = "Cubxx"
    $repo = "My-AfterEffect-Script"
    $type = Select-Option "Please select the script type you want to install:" @("UI", "lib", "script")

    try {
        $response = Invoke-RestMethod -Uri "https://api.github.com/repos/$owner/$repo/contents/dist/$($type)?ref=main"
    }
    catch {
        Write-Error $_
        exit
    }

    $Install = { 
        $option = Select-Option "Please select a file to install:" $response "name"
        $filepath = Join-Path $paths.$type $option.name
        # Write-Host "download url: '$($option.download_url)'"
        # Write-Host "installation path: '$filepath'"
        # Read-Host "Press any key to install..."
        Invoke-WebRequest -Uri $option.download_url -OutFile $filepath
        Write-Host "Install $($option.name) successfully" 
        & $Install
    }
    & $Install
}
function Install-Local {
    param([hashtable]$paths)    
}
function Main {
    $option = Select-Option "Please select an installation method:" @( 
        @{ title = "Web"; fn = { Install-Web } }, 
        @{ title = "Local"; fn = { Install-Local } }
    ) "title"
    Get-AEScript-Path | & $option.fn   
}
Main