$files = Get-ChildItem -Path "c:\Users\erasm\OneDrive\Desktop\tejiendo-redes\src\app" -Recurse -Filter "*-client.tsx"

foreach ($f in $files) {
    $c = [System.IO.File]::ReadAllText($f.FullName)
    
    # Text colors
    $c = $c -replace 'text-gray-900', 'text-foreground'
    $c = $c -replace 'text-gray-700', 'text-foreground'
    $c = $c -replace 'text-gray-600', 'text-muted-foreground'
    $c = $c -replace 'text-gray-500', 'text-muted-foreground'
    $c = $c -replace 'text-gray-400', 'text-muted-foreground/70'
    $c = $c -replace 'text-red-600', 'text-destructive'
    $c = $c -replace 'text-red-500', 'text-destructive'
    $c = $c -replace 'text-blue-600', 'text-primary'
    $c = $c -replace 'text-blue-500', 'text-primary'
    $c = $c -replace 'text-green-600', 'text-success'
    $c = $c -replace 'text-green-500', 'text-success'
    
    # Background colors
    $c = $c -replace 'bg-blue-600', 'bg-primary'
    $c = $c -replace 'hover:bg-blue-700', 'hover:bg-primary/90'
    $c = $c -replace 'bg-red-600', 'bg-destructive'
    $c = $c -replace 'hover:bg-red-700', 'hover:bg-destructive/90'
    $c = $c -replace 'bg-white', 'bg-card'
    $c = $c -replace 'border-gray-200', 'border-border'
    $c = $c -replace 'border-gray-300', 'border-border'
    $c = $c -replace 'bg-gray-50', 'bg-muted/50'
    $c = $c -replace 'bg-gray-100', 'bg-muted'
    $c = $c -replace 'bg-gray-200', 'bg-muted'
    
    [System.IO.File]::WriteAllText($f.FullName, $c)
    Write-Host "Updated: $($f.Name)"
}
