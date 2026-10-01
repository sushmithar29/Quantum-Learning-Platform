@echo off
title QuantumLab Python Compiler Backend
echo ===================================================
echo   QuantumLab Python Compiler ^& Execution Backend
echo ===================================================
echo   Starting server on http://127.0.0.1:5000 ...
echo   Endpoints:
echo     - Status:       GET  http://127.0.0.1:5000/api/status
echo     - Compile Code: POST http://127.0.0.1:5000/api/compile
echo     - Run Code:     POST http://127.0.0.1:5000/api/run
echo     - Step Trace:   POST http://127.0.0.1:5000/api/step-trace
echo ===================================================
python backend\server.py
pause
