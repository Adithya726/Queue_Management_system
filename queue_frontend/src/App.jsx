import { Navigate, Route, Routes } from 'react-router-dom';
import Home from './main/Home';
import About from './main/About';
import NotFound from './main/NotFound';
import Login from './auth/Login';
import Register from './auth/Register';
import ProtectedRoute from './components/common/ProtectedRoute';
import ManagerHome from './manager/ManagerHome';
import Dashboard from './manager/Dashboard';
import ManageQueues from './manager/ManageQueues';
import QueueDetails from './manager/QueueDetails';
import Analytics from './analytics/Analytics';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/about" element={<About />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      <Route element={<ProtectedRoute />}>
        <Route path="/manager" element={<ManagerHome />}>
          <Route index element={<Dashboard />} />
          <Route path="queues" element={<ManageQueues />} />
          <Route path="queues/:queueId" element={<QueueDetails />} />
          <Route path="analytics" element={<Analytics />} />
          <Route path="analytics/:queueId" element={<Analytics />} />
        </Route>
      </Route>

      <Route path="/home" element={<Navigate to="/" replace />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default App;
