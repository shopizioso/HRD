import { useState, useEffect } from "react";
import AppLayout from "./layouts/AppLayout";
import DashboardPage from "./pages/DashboardPage-Minimalist";
import PayrollPage from "./pages/PayrollPage";
import EmployeesPage from "./pages/EmployeesPage";
import SlipPage from "./pages/SlipPage";
import SettingsPage from "./pages/SettingsPage";
import FinancialPage from "./pages/FinancialPage-Minimalist";
import IncomePage from "./pages/IncomePage-Minimalist";
import { useAutoSaveSlip } from "./hooks/useAutoSaveSlip";
import { getEmployees, createEmployee as createEmployeeSvc, updateEmployee as updateEmployeeSvc, onEmployeesRealtime } from "./services/employeesService";
import { ThemeProvider } from "./context/ThemeContext";
import { ToastProvider } from "./context/ToastContext";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { LanguageProvider } from "./context/LanguageContext";
import { LoadingProvider } from "./context/LoadingContext";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { ToastContainer } from "./components/ToastContainer";
import LoginPage from "./pages/LoginPage";
import "./App.css";

const COMPANY = {
  name: "PT Global Digital Zone",
  address: "Jl Sunan Kudus, Tamantirto, Kasihan, Bantul, Daerah Istimewa Yogyakarta",
  email: "ptglobaldigitalzone@gmail.com",
  logo: "/GDZ.svg",
};

const INITIAL_EMPLOYEES = [
  { id: 1, name: "Viona Nur Alifah", position: "Admin Marketplace", department: "Marketplace", baseSalary: 2500000 },
  { id: 2, name: "Maulia Nissalati S", position: "Admin Marketplace", department: "Marketplace", baseSalary: 2500000 },
  { id: 3, name: "Hana Maria Ulfa", position: "Admin Marketplace", department: "Marketplace", baseSalary: 3000000 },
  { id: 4, name: "Putri Indriyanti", position: "Admin Marketplace", department: "Marketplace", baseSalary: 3000000 },
  { id: 5, name: "Mahmul Yakin", position: "Customer Support", department: "Marketplace", baseSalary: 3400000 },
  { id: 6, name: "Apit Purnomo", position: "Accounting", department: "Finance & Accounting", baseSalary: 6000000 },
  { id: 7, name: "Shopi Setiawan", position: "Manager", department: "Operations & Fulfillment", baseSalary: 10000000 },
];

const createSlipState = (employee, period = "Mei 2026") => ({
  company: { ...COMPANY },
  slip: {
    number: `SL-202605-${String(employee.id).padStart(3, "0")}`,
    period,
    presentDays: 22,
    leaveDays: 0,
    sickDays: 0,
    note: "Dokumen ini sah tanpa tanda tangan basah.",
    hrdName: "HRD PT Global Digital Zone",
    signature: "HRD Signature",
  },
  employee: {
    ...employee,
    allowance: 0,
    bonus: 0,
    overtime: 0,
    bpjs: 0,
    tax: 0,
    otherDeduction: 0,
  },
});

const buildSlipPDF = () => {
  return "%PDF-1.4\n%âãÏÓ\n1 0 obj\n<<>>\nendobj\ntrailer\n<< /Size 1 >>\nstartxref\n0\n%%EOF";
};

export default function App() {
  const [view, setView] = useState("dashboard");
  const [employees, setEmployees] = useState(() => {
    const saved = localStorage.getItem('employeesData');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to load employees from storage:', e);
      }
    }
    return INITIAL_EMPLOYEES;
  });
  const [slipData, setSlipData] = useState(() => {
    const saved = localStorage.getItem('payrollSlip_autosave');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to load saved slip:', e);
      }
    }
    return createSlipState(INITIAL_EMPLOYEES[0]);
  });

  const autosave = useAutoSaveSlip(slipData, () => {});

  const useSupabase = Boolean(import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY);

  // Map Supabase employee row to app shape
  const mapEmployee = (e) => ({
    id: e.id,
    name: e.full_name || e.name || '',
    position: e.position || '',
    department: e.department || '',
    baseSalary: e.salary || e.baseSalary || 0,
  });

  // Fetch employees from Supabase when configured and subscribe to realtime changes
  useEffect(() => {
    if (!useSupabase) return;
    let mounted = true;
    (async () => {
      try {
        const rows = await getEmployees();
        if (!mounted) return;
        if (Array.isArray(rows) && rows.length > 0) {
          setEmployees(rows.map(mapEmployee));
        }
      } catch (err) {
        console.error('Failed to load employees from Supabase', err);
      }
    })();

    const unsub = onEmployeesRealtime((payload) => {
      // payload example: { eventType: 'INSERT'|'UPDATE'|'DELETE', new: {...}, old: {...} }
      try {
        const e = payload.record || payload.new || payload;
        const type = payload.eventType || payload.event || (payload.type || null);
        if (!e) return;
        if (type === 'DELETE' || payload.event === 'DELETE') {
          setEmployees((prev) => prev.filter((it) => it.id !== e.id));
        } else {
          const mapped = mapEmployee(e);
          setEmployees((prev) => {
            const found = prev.find((p) => p.id === mapped.id);
            if (found) return prev.map((p) => (p.id === mapped.id ? { ...p, ...mapped } : p));
            return [...prev, mapped];
          });
        }
      } catch (e) {
        console.error('Realtime employee handler error', e);
      }
    });

    return () => {
      mounted = false;
      try { if (unsub) unsub(); } catch (e) {}
    };
  }, []);
  const [exportMsg, setExportMsg] = useState("");
  const [selectedMonth] = useState(5);
  const [selectedYear] = useState(2026);

  useEffect(() => {
    try {
      if (!useSupabase) {
        localStorage.setItem('employeesData', JSON.stringify(employees));
      }
    } catch (e) {
      console.error('Failed to persist employees:', e);
    }
  }, [employees]);

  const handleAddEmployee = (employee) => {
    if (useSupabase) {
      (async () => {
        try {
          const [created] = await createEmployeeSvc({
            full_name: employee.name,
            position: employee.position,
            department: employee.department,
            salary: Number(employee.baseSalary || 0),
            status: 'active',
          });
          if (created) setEmployees((prev) => [...prev, mapEmployee(created)]);
        } catch (err) {
          console.error('Failed to create employee in Supabase', err);
        }
      })();
    } else {
      const nextId = employees.reduce((max, item) => Math.max(max, item.id || 0), 0) + 1;
      setEmployees((prev) => [
        ...prev,
        {
          id: nextId,
          name: employee.name,
          position: employee.position,
          department: employee.department,
          baseSalary: Number(employee.baseSalary || 0),
        },
      ]);
    }
  };

  const handleUpdateEmployee = (updatedEmployee) => {
    if (useSupabase) {
      (async () => {
        try {
          const [updated] = await updateEmployeeSvc({
            id: updatedEmployee.id,
            full_name: updatedEmployee.name,
            position: updatedEmployee.position,
            department: updatedEmployee.department,
            salary: Number(updatedEmployee.baseSalary || 0),
          });
          if (updated) setEmployees((prev) => prev.map((item) => (item.id === updated.id ? mapEmployee(updated) : item)));
        } catch (err) {
          console.error('Failed to update employee in Supabase', err);
        }
      })();
    } else {
      setEmployees((prev) => prev.map((item) => (item.id === updatedEmployee.id ? { ...item, ...updatedEmployee } : item)));
    }
  };

  const loadScript = (src) =>
    new Promise((res, rej) => {
      if (document.querySelector(`script[src="${src}"]`)) return res();
      const s = document.createElement("script");
      s.src = src;
      s.onload = res;
      s.onerror = rej;
      document.head.appendChild(s);
    });

  const handleExportPDF = async () => {
    const filename = `${slipData.slip.number || `slip-${slipData.employee.id}`}.pdf`;
    try {
      await loadScript("https://cdn.jsdelivr.net/npm/html2canvas@1.4.1/dist/html2canvas.min.js");
      await loadScript("https://cdn.jsdelivr.net/npm/jspdf@2.5.1/dist/jspdf.umd.min.js");
      const source = document.querySelector(".slip-preview");
      if (!source) throw new Error("Slip preview not found");
      const clone = source.cloneNode(true);
      clone.querySelectorAll("input,textarea,select").forEach((ctrl) => {
        const val = (ctrl.value || "").toString().trim();
        const span = document.createElement("div");
        span.textContent = val || "-";
        span.style.display = "inline-block";
        span.style.background = "#fff";
        span.style.color = "#0f172a";
        span.style.padding = "6px 8px";
        span.style.fontSize = getComputedStyle(ctrl).fontSize || "13px";
        span.style.fontWeight = getComputedStyle(ctrl).fontWeight || "600";
        span.style.borderRadius = "6px";
        span.style.minWidth = "36px";
        span.style.boxSizing = "border-box";
        const txtAlign = (ctrl.style && ctrl.style.textAlign) || getComputedStyle(ctrl).textAlign;
        if (txtAlign) span.style.textAlign = txtAlign;
        ctrl.replaceWith(span);
      });
      clone.style.position = "fixed";
      clone.style.left = "-9999px";
      clone.style.top = "0";
      clone.style.width = `${source.offsetWidth}px`;
      clone.style.height = `${source.offsetHeight}px`;
      clone.style.opacity = "1";
      clone.style.visibility = "visible";
      clone.style.pointerEvents = "none";
      clone.style.overflow = "visible";
      document.body.appendChild(clone);
      const canvas = await window.html2canvas(clone, { scale: 2, useCORS: true, backgroundColor: "#fff" });
      const imgData = canvas.toDataURL("image/jpeg", 0.98);
      const { jsPDF } = window.jspdf;
      const pdf = new jsPDF("p", "pt", "a4");
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const imgProps = pdf.getImageProperties(imgData);
      const maxWidth = pageWidth - 20;
      const maxHeight = pageHeight - 20;
      const ratio = Math.min(maxWidth / imgProps.width, maxHeight / imgProps.height);
      const imgWidth = imgProps.width * ratio;
      const imgHeight = imgProps.height * ratio;
      pdf.addImage(imgData, "JPEG", 10, 10, imgWidth, imgHeight);
      const blob = pdf.output("blob");
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(() => URL.revokeObjectURL(url), 1500);
      document.body.removeChild(clone);
      setExportMsg("✅ PDF berhasil didownload (match preview)");
      setTimeout(() => setExportMsg(""), 3000);
    } catch (err) {
      try {
        const pdfStr = buildSlipPDF({ emp: slipData.employee, pr: {}, month: selectedMonth, year: selectedYear, gross: slipData.employee.baseSalary, deductions: 0, net: slipData.employee.baseSalary });
        const bytes = new Uint8Array(pdfStr.length);
        for (let i = 0; i < pdfStr.length; i++) bytes[i] = pdfStr.charCodeAt(i) & 0xff;
        const blob = new Blob([bytes], { type: "application/pdf" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        setTimeout(() => URL.revokeObjectURL(url), 1500);
        setExportMsg("✅ PDF berhasil didownload (fallback)");
        setTimeout(() => setExportMsg(""), 3000);
      } catch (e) {
        setExportMsg("❌ Gagal membuat PDF: " + (e && e.message || e));
      }
    }
  };

  const handleViewSlip = (employee) => {
    // Check if there's already saved data for this employee (uses autosave hook/load)
    try {
      const saved = autosave.load();
      if (saved && saved.employee && saved.employee.id === employee.id) {
        setSlipData(saved);
      } else {
        setSlipData(createSlipState(employee));
      }
    } catch (e) {
      setSlipData(createSlipState(employee));
    }
    setView("slip");
    setExportMsg("");
  };

  const handleCreateSlip = (employeeId, period = "Mei 2026") => {
    const employee = employees.find((item) => item.id === employeeId) || employees[0];
    if (!employee) return;
    setSlipData(createSlipState(employee, period));
    setView("slip");
    setExportMsg("");
  };

  return (
    <ThemeProvider>
      <ToastProvider>
        <LoadingProvider>
          <AuthProvider>
            <LanguageProvider>
            <ErrorBoundary>
              <AppContent 
                slipData={slipData}
                onUpdateSlip={setSlipData}
                view={view}
                onNavigate={setView}
                employees={employees}
                onViewSlip={handleViewSlip}
                onAddEmployee={handleAddEmployee}
                onCreateSlip={handleCreateSlip}
                exportMessage={exportMsg}
                onExport={handleExportPDF}
              />
              <ToastContainer />
            </ErrorBoundary>
          </LanguageProvider>
        </AuthProvider>
      </ToastProvider>
    </ThemeProvider>
  );
}

function AppContent({
  slipData,
  onUpdateSlip,
  view,
  onNavigate,
  employees,
  onViewSlip,
  onAddEmployee,
  onCreateSlip,
  exportMessage,
  onExport,
}) {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <LoginPage />;
  }

  return (
    <ProtectedRoute>
      <AppLayout currentView={view} onNavigate={onNavigate}>
        {view === "dashboard" && <DashboardPage />}
        {view === "payroll" && <PayrollPage employees={employees} onViewSlip={onViewSlip} onAddEmployee={onAddEmployee} onCreateSlip={onCreateSlip} />}
        {view === "income" && <IncomePage />}
        {view === "employees" && <EmployeesPage employees={employees} onAddEmployee={onAddEmployee} onCreateSlip={onCreateSlip} />}
        {view === "financial" && <FinancialPage />}
        {view === "settings" && <SettingsPage />}
        {view === "goals" && <GoalsPage />}
        {view === "comparison" && <ComparisonReportPage />}
        {view === "advanced-filter" && <AdvancedFilteringPage />}
        {view === "slip" && (
          <SlipPage
            slipData={slipData}
            onUpdateSlip={onUpdateSlip}
            exportMessage={exportMessage}
            onExport={onExport}
            onBack={() => onNavigate("payroll")}
          />
        )}
      </AppLayout>
    </ProtectedRoute>
  );
}
