using System;
using System.Diagnostics;
using System.IO;

namespace KlozetDashboard {
    class Program {
        static void Main(string[] args) {
            string baseDir = @"C:\Users\EthanCurro\Desktop\Ethan's Project\Wardobre.ai\Wardrobe.AI";
            string pyScript = Path.Combine(baseDir, "desktop_dashboard.pyw");
            
            string pythonExe = @"C:\Users\EthanCurro\AppData\Local\Microsoft\WindowsApps\PythonSoftwareFoundation.Python.3.11_qbz5n2kfra8p0\pythonw.exe";
            if (!File.Exists(pythonExe)) {
                pythonExe = @"C:\Users\EthanCurro\AppData\Local\Microsoft\WindowsApps\PythonSoftwareFoundation.Python.3.11_qbz5n2kfra8p0\python.exe";
            }
            if (!File.Exists(pythonExe)) {
                pythonExe = "pythonw.exe";
            }
            
            ProcessStartInfo psi = new ProcessStartInfo();
            psi.FileName = pythonExe;
            psi.Arguments = "\"" + pyScript + "\"";
            psi.WorkingDirectory = baseDir;
            psi.CreateNoWindow = true;
            psi.UseShellExecute = false;
            psi.WindowStyle = ProcessWindowStyle.Hidden;
            
            try {
                using (Process p = Process.Start(psi)) {
                    p.WaitForExit();
                }
            } catch (Exception) {
            }
        }
    }
}
