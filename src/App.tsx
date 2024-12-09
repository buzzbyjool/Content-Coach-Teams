import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { TouchBackend } from 'react-dnd-touch-backend';
import ProtectedRoute from './components/ProtectedRoute';
import AdminRoute from './components/AdminRoute';
import Layout from './components/Layout';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import NewForm from './pages/NewForm';
import EditForm from './pages/EditForm';
import AdminDashboard from './pages/admin/Dashboard';
import Users from './pages/admin/Users';
import { ChatPanel } from './components/chat/ChatPanel';

// Detect touch device
const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

export default function App() {
  return (
    <DndProvider backend={isTouchDevice ? TouchBackend : HTML5Backend}>
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route element={<ProtectedRoute />}>
              <Route element={<Layout />}>
                <Route path="/" element={<Dashboard />} />
                <Route path="/forms/new" element={<NewForm />} />
                <Route path="/forms/edit/:id" element={<EditForm />} />
                
                {/* Admin Routes */}
                <Route element={<AdminRoute />}>
                  <Route path="/admin" element={<AdminDashboard />} />
                  <Route path="/admin/users" element={<Users />} />
                </Route>
              </Route>
            </Route>
          </Routes>
          <ChatPanel />
        </AuthProvider>
      </BrowserRouter>
    </DndProvider>
  );
}