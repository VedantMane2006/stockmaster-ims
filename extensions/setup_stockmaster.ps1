# StockMaster Setup Script
# Run this AFTER installing Python and PostgreSQL

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "StockMaster Setup" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check Python
Write-Host "Checking Python..." -ForegroundColor Yellow
$pythonCmd = Get-Command python -ErrorAction SilentlyContinue
if (-not $pythonCmd) {
    Write-Host "ERROR: Python not found!" -ForegroundColor Red
    Write-Host "Please install Python first or restart your terminal." -ForegroundColor Yellow
    pause
    exit
}
Write-Host "✓ Python found:" (python --version) -ForegroundColor Green

# Check MySQL
Write-Host "Checking MySQL..." -ForegroundColor Yellow
$mysqlCmd = Get-Command mysql -ErrorAction SilentlyContinue
if (-not $mysqlCmd) {
    Write-Host "WARNING: mysql not found in PATH" -ForegroundColor Yellow
    Write-Host "MySQL might be installed but not in PATH." -ForegroundColor Yellow
    Write-Host "You may need to add it manually or use MySQL Workbench." -ForegroundColor Yellow
} else {
    Write-Host "✓ MySQL found:" (mysql --version) -ForegroundColor Green
}

Write-Host ""
Write-Host "Setting up StockMaster..." -ForegroundColor Cyan
Write-Host ""

# Create virtual environment
Write-Host "1. Creating virtual environment..." -ForegroundColor Yellow
if (Test-Path "venv") {
    Write-Host "   Virtual environment already exists" -ForegroundColor Gray
} else {
    python -m venv venv
    Write-Host "   ✓ Virtual environment created" -ForegroundColor Green
}

# Activate virtual environment
Write-Host "2. Activating virtual environment..." -ForegroundColor Yellow
& ".\venv\Scripts\Activate.ps1"
Write-Host "   ✓ Virtual environment activated" -ForegroundColor Green

# Install dependencies
Write-Host "3. Installing Python dependencies..." -ForegroundColor Yellow
pip install --upgrade pip --quiet
pip install -r requirements.txt --quiet
Write-Host "   ✓ Dependencies installed" -ForegroundColor Green

# Create .env file
Write-Host "4. Creating configuration file..." -ForegroundColor Yellow
if (Test-Path ".env") {
    Write-Host "   .env file already exists" -ForegroundColor Gray
} else {
    Copy-Item ".env.example" ".env"
    Write-Host "   ✓ .env file created" -ForegroundColor Green
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Setup Complete!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "IMPORTANT: Next Steps" -ForegroundColor Yellow
Write-Host ""
Write-Host "1. Configure Database:" -ForegroundColor White
Write-Host "   - Open .env file: notepad .env" -ForegroundColor Gray
Write-Host "   - Update DB_PASSWORD with your MySQL root password" -ForegroundColor Gray
Write-Host "   - (Leave empty if no password set)" -ForegroundColor Gray
Write-Host ""
Write-Host "2. Create Database:" -ForegroundColor White
Write-Host "   Option A: Use MySQL Workbench" -ForegroundColor Gray
Write-Host "     - Open MySQL Workbench" -ForegroundColor Gray
Write-Host "     - Create database named: stockmaster" -ForegroundColor Gray
Write-Host ""
Write-Host "   Option B: Use command line" -ForegroundColor Gray
Write-Host "     - Run: mysql -u root -p" -ForegroundColor Gray
Write-Host "     - Then: CREATE DATABASE stockmaster;" -ForegroundColor Gray
Write-Host ""
Write-Host "3. Initialize Database:" -ForegroundColor White
Write-Host "   python init_db.py" -ForegroundColor Gray
Write-Host ""
Write-Host "4. Run Application:" -ForegroundColor White
Write-Host "   python app.py" -ForegroundColor Gray
Write-Host ""
Write-Host "5. Open Browser:" -ForegroundColor White
Write-Host "   http://localhost:5000" -ForegroundColor Gray
Write-Host "   Login: admin@stockmaster.com / admin123" -ForegroundColor Gray
Write-Host ""
pause
