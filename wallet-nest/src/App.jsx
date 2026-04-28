import { BrowserRouter as Router, Routes, Route, Outlet } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { FinanceProvider } from './context/FinanceContext';
import { AuthProvider } from './context/AuthContext';
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';

// Page placeholders
import Dashboard from './pages/Dashboard';
import AddExpenses from './pages/AddExpenses';
import AIInsights from './pages/AIInsights';
import MentorChat from './pages/MentorChat';
import Goals from './pages/Goals';
import Reports from './pages/Reports';
import History from './pages/History';
import Profile from './pages/Profile';
import Login from './pages/Login';
import Signup from './pages/Signup';

import MobileNav from './components/MobileNav';

function AppShell() {
  return (
    <div className="flex h-screen bg-[var(--bg-color)] text-[var(--text-color)] overflow-hidden transition-colors duration-300">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden relative">
        <Navbar />
        <main className="flex-1 overflow-y-auto pt-6 px-4 pb-28 md:p-8 lg:p-10">
          <Outlet />
        </main>
        <MobileNav />
      </div>
    </div>
  );
}

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <FinanceProvider>
          <Router>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />

              <Route element={<ProtectedRoute />}>
                <Route element={<AppShell />}>
                  <Route path="/" element={<Dashboard />} />
                  <Route path="/expenses" element={<AddExpenses />} />
                  <Route path="/insights" element={<AIInsights />} />
                  <Route path="/mentor" element={<MentorChat />} />
                  <Route path="/goals" element={<Goals />} />
                  <Route path="/reports" element={<Reports />} />
                  <Route path="/history" element={<History />} />
                  <Route path="/profile" element={<Profile />} />
                </Route>
              </Route>
            </Routes>
          </Router>
        </FinanceProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
