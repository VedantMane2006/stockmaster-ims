================================================================================
                    STOCKMASTER - INVENTORY MANAGEMENT SYSTEM
================================================================================

✅ MIGRATION TO NODE.JS COMPLETE!

StockMaster now uses Node.js + Express.js instead of Python + Flask.
All Python files have been removed.

================================================================================
                            QUICK START OPTIONS
================================================================================

OPTION 1: AUTOMATED SCRIPT (10 MINUTES)
----------------------------------------
1. Right-click PowerShell → Run as Administrator
2. Run: .\install_windows.ps1
3. Close and reopen PowerShell
4. Run: .\setup_stockmaster.ps1
5. Follow the instructions

OPTION 2: MANUAL INSTALLATION (15 MINUTES)
-------------------------------------------
1. Install Python 3.8+: https://www.python.org/downloads/
2. Install MySQL 8.0+: https://dev.mysql.com/downloads/installer/
3. See QUICK_START.md for detailed steps

================================================================================
                              DOCUMENTATION
================================================================================

📖 QUICKSTART.md       - Quick 5-step setup (START HERE!)
📖 NODE_SETUP.md       - Detailed Node.js setup guide
📖 MIGRATION_TO_NODEJS.md - What changed from Python to Node.js
📖 README.md           - Project overview

================================================================================
                            WHAT YOU NEED
================================================================================

- Node.js 16 or higher (with npm)
- MySQL 8.0 or higher

================================================================================
                          DEFAULT CREDENTIALS
================================================================================

Email: admin@stockmaster.com
Password: admin123

(Change these after first login!)

================================================================================
                            TROUBLESHOOTING
================================================================================

"node not found"
→ Restart terminal after installing Node.js
→ Verify: node --version

"MySQL not found"
→ Add MySQL to PATH or use MySQL Workbench
→ Default location: C:\Program Files\MySQL\MySQL Server 8.0\bin

"Can't connect to database"
→ Check MySQL service is running (services.msc)
→ Verify password in .env file
→ Make sure database 'stockmaster' exists

"npm install fails"
→ Delete node_modules folder
→ Run: npm install again
→ Make sure you have Node.js 16+

================================================================================
                              FEATURES
================================================================================

✅ Product Management
✅ Receipt Processing (Incoming Stock)
✅ Delivery Orders (Outgoing Stock)
✅ Internal Transfers
✅ Stock Adjustments
✅ Real-time Dashboard
✅ Low Stock Alerts
✅ Complete Audit Trail
✅ Multi-warehouse Support
✅ User Authentication

================================================================================
                          RECOMMENDED APPROACH
================================================================================

1. Try AUTOMATED SCRIPT first (easiest!)
2. If that doesn't work, use MANUAL INSTALLATION

================================================================================
                            NEED HELP?
================================================================================

Read the documentation files in this order:
1. QUICK_START.md (start here!)
2. MYSQL_SETUP.md (if you need MySQL help)
3. SETUP.md (for detailed steps)

================================================================================

Ready to start? Open QUICKSTART.md or run:
    npm install
    npm run init-db
    npm start

================================================================================
