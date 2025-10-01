# PowerShell script to generate dummy construction progress data for demo purposes
# Run this script to populate the database with realistic timeline data

Write-Host "Generating dummy construction progress data..." -ForegroundColor Green

# First, get all plots
try {
    $plotsResponse = Invoke-RestMethod -Uri 'http://localhost:3000/api/plots?map=welbourne' -Method GET
    Write-Host "Found $($plotsResponse.Count) plots" -ForegroundColor Yellow
} catch {
    Write-Host "Error fetching plots: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

$successCount = 0
$errorCount = 0

foreach ($plot in $plotsResponse) {
    if (-not $plot.constructionType -or -not $plot.constructionType.constructionStages) {
        Write-Host "Skipping plot $($plot.name) - no construction stages defined" -ForegroundColor Yellow
        continue
    }
    
    Write-Host "Processing plot: $($plot.name)" -ForegroundColor Cyan
    
    # Sort stages by sort order
    $stages = $plot.constructionType.constructionStages | Sort-Object sortOrder
    
    # Start date for this plot (stagger starts across plots)
    $plotStartDate = Get-Date "2025-10-01"
    $plotStartDate = $plotStartDate.AddDays((Get-Random -Minimum 0 -Maximum 30))
    
    $currentDate = $plotStartDate
    
    foreach ($stage in $stages) {
        # Generate random duration between 2-4 weeks
        $durationDays = Get-Random -Minimum 14 -Maximum 28
        
        $startDate = $currentDate
        $endDate = $startDate.AddDays($durationDays)
        
        # Sometimes add actual dates (for completed or in-progress stages)
        $actualStart = $null
        $actualEnd = $null
        
        $random = Get-Random -Minimum 1 -Maximum 100
        if ($random -le 30) {
            # 30% chance stage is completed
            $actualStart = $startDate.AddDays((Get-Random -Minimum -3 -Maximum 3))
            $actualEnd = $endDate.AddDays((Get-Random -Minimum -5 -Maximum 10))
        } elseif ($random -le 50) {
            # 20% chance stage is in progress
            $actualStart = $startDate.AddDays((Get-Random -Minimum -2 -Maximum 2))
        }
        
        # Create the payload
        $payload = @{
            plotId = $plot.id
            stageId = $stage.id
            plannedStartDate = $startDate.ToString("yyyy-MM-ddTHH:mm:ss.fffZ")
            plannedEndDate = $endDate.ToString("yyyy-MM-ddTHH:mm:ss.fffZ")
        }
        
        if ($actualStart) {
            $payload.actualStartDate = $actualStart.ToString("yyyy-MM-ddTHH:mm:ss.fffZ")
        }
        
        if ($actualEnd) {
            $payload.actualEndDate = $actualEnd.ToString("yyyy-MM-ddTHH:mm:ss.fffZ")
        }
        
        try {
            $body = $payload | ConvertTo-Json
            $response = Invoke-RestMethod -Uri 'http://localhost:3000/api/construction-progress' -Method POST -Body $body -ContentType 'application/json'
            Write-Host "  ✓ $($stage.name): $($startDate.ToString("MMM dd")) - $($endDate.ToString("MMM dd"))" -ForegroundColor Green
            $successCount++
        } catch {
            Write-Host "  ✗ Failed to create progress for $($stage.name): $($_.Exception.Message)" -ForegroundColor Red
            $errorCount++
        }
        
        # Next stage starts 1 week after this one starts (with some overlap)
        $currentDate = $currentDate.AddDays(7)
    }
    
    Write-Host ""
}

Write-Host "Dummy data generation complete!" -ForegroundColor Green
Write-Host "Successfully created: $successCount records" -ForegroundColor Green
if ($errorCount -gt 0) {
    Write-Host "Errors encountered: $errorCount records" -ForegroundColor Red
}

Write-Host "`nYou can now view the timeline in your dashboard!" -ForegroundColor Yellow