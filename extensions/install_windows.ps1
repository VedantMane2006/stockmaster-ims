# StockMaster Automated Installation Script for Windows
# Run this script in PowerShell as Administrator

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "StockMaster Automated Installer" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check if running as Administrator
$isAdmin = ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
if (-not $isAdmin) {
    Write-Host "ERROR: This script must be run as Administrator!" -ForegroundColor Red
    Write-Host "Right-click PowerShell and select 'Run as Administrator'" -ForegroundColor Yellow
    pause
    exit
}

Write-Host "Checking for required software..." -ForegroundColor Yellow
Write-Host ""

# Check for winget (Windows Package Manager)
$wingetExists = Get-Command winget -ErrorAction SilentlyContinue
if (-not $wingetExists) {
    Write-Host "ERROR: winget (Windows Package Manager) not found!" -ForegroundColor Red
    Write-Host "Please install it from Microsoft Store: 'App Installer'" -ForegroundColor Yellow
    Write-Host "Or download from: https://aka.ms/getwinget" -ForegroundColor Yellow
    pause
    exit
}

Write-Host "✓ winget found" -ForegroundColor Green

# Function to check if software is installed
function Test-SoftwareInstalled {
    param($Name)
    $software = Get-Command $Name -ErrorAction SilentlyContinue
    return $null -ne $software
}

# Install Python
Write-Host ""
Write-Host "Checking Python..." -ForegroundColor Yellow
if (Test-SoftwareInstalled "python") {
    Write-Host "✓ Python is already installed" -ForegroundColor Green
    python --version
} else {
    Write-Host "Installing Python 3.12..." -ForegroundColor Cyan
    winget install -e --id Python.Python.3.12 --silent --accept-package-agreements --accept-source-agreements
    
    # Refresh environment variables
    $env:Path = [System.Environment]::GetEnvironmentVariable("Path","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path","User")
    
    Write-Host "✓ Python installed" -ForegroundColor Green
}

# Install MySQL
Write-Host ""
Write-Host "Checking MySQL..." -ForegroundColor Yellow
if (Test-SoftwareInstalled "mysql") {
    Write-Host "✓ MySQL is already installed" -ForegroundColor Green
} else {
    Write-Host "Installing MySQL 8.0..." -ForegroundColor Cyan
    Write-Host "NOTE: You'll need to set a root password during installation!" -ForegroundColor Yellow
    winget install -e --id Oracle.MySQL --accept-package-agreements --accept-source-agreements
    
    # Refresh environment variables
    $env:Path = [System.Environment]::GetEnvironmentVariable("Path","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path","User")
    
    Write-Host "✓ MySQL installed" -ForegroundColor Green
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Installation Complete!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Next Steps:" -ForegroundColor Yellow
Write-Host "1. Close this PowerShell window" -ForegroundColor White
Write-Host "2. Open a NEW PowerShell window (to load new PATH)" -ForegroundColor White
Write-Host "3. Navigate to StockMaster folder" -ForegroundColor White
Write-Host "4. Run: .\setup_stockmaster.ps1" -ForegroundColor White
Write-Host ""
pause
