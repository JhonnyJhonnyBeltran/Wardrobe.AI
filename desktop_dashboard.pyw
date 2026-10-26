import os
import sys
import ctypes
import time
import socket
import shutil
import atexit
import subprocess
import webview

try:
    app_id = 'Klozet.AdminInsightsTerminal.App.1.0'
    ctypes.windll.shell32.SetCurrentProcessExplicitAppUserModelID(app_id)
except Exception:
    pass

ROOT = os.path.dirname(os.path.abspath(__file__))
if ROOT not in sys.path:
    sys.path.insert(0, ROOT)

CREATE_NO_WINDOW = 0x08000000
DETACHED_PROCESS = 0x00000008
HIDDEN_FLAGS = CREATE_NO_WINDOW | DETACHED_PROCESS

ICON_PATH = os.path.abspath(os.path.join(ROOT, 'public', 'klozet-app.ico'))
server_proc = None

def is_port_open(port: int) -> bool:
    try:
        with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
            s.settimeout(0.35)
            return s.connect_ex(('127.0.0.1', port)) == 0
    except Exception:
        return False

def find_available_port(start_port: int = 3000, max_port: int = 3050) -> int:
    for p in range(start_port, max_port + 1):
        if not is_port_open(p):
            return p
    # Fallback to random free OS port
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
        s.bind(('127.0.0.1', 0))
        return s.getsockname()[1]

def get_hidden_startupinfo():
    si = subprocess.STARTUPINFO()
    si.dwFlags |= subprocess.STARTF_USESHOWWINDOW
    si.wShowWindow = 0  # SW_HIDE
    return si

def cleanup():
    global server_proc
    if server_proc:
        try:
            subprocess.run(["taskkill", "/F", "/T", "/PID", str(server_proc.pid)], capture_output=True, creationflags=CREATE_NO_WINDOW)
        except Exception:
            pass

atexit.register(cleanup)

def main():
    global server_proc
    si = get_hidden_startupinfo()

    # 1. Determine active server port or find an available one
    target_port = None
    if is_port_open(3000):
        target_port = 3000
    else:
        # Check next ports
        target_port = find_available_port(3000, 3050)
        
        # Start Next.js local server completely SILENT in background (ZERO console window)
        node_bin = shutil.which('npm') or 'npm.cmd'
        server_proc = subprocess.Popen(
            [node_bin, 'run', 'start', '--', '-p', str(target_port)],
            cwd=ROOT,
            startupinfo=si,
            creationflags=HIDDEN_FLAGS,
            stdout=subprocess.DEVNULL,
            stderr=subprocess.DEVNULL,
            shell=True
        )

        # Wait until port responds
        for _ in range(60):
            if is_port_open(target_port):
                break
            time.sleep(0.4)

    dashboard_url = f"http://localhost:{target_port}/admin/insights"

    # 2. Open Standalone Native Desktop Window (Zero CMD, Zero terminal, Pure GUI)
    window = webview.create_window(
        title='Klozet | Terminal de Control & Reportes de Usuarios',
        url=dashboard_url,
        width=1440,
        height=900,
        min_size=(1024, 680),
        background_color='#09090b'
    )

    icon_to_use = ICON_PATH if os.path.exists(ICON_PATH) else None

    # 3. Start GUI loop
    if icon_to_use:
        webview.start(icon=icon_to_use)
    else:
        webview.start()

    # 4. On window exit: terminate server if launched by this instance
    cleanup()

if __name__ == '__main__':
    main()
