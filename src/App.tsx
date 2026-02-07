import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/auth/Login/Login";
import Dashboard from "./pages/dashboard/Dashboard";
import Messes from "./pages/messes/Messes";
import DeliveryAgents from "./pages/deliveryAgents/DeliveryAgents";
import MainLayout from "./components/Layout/MainLayout";
import ProtectedRoute from "./routes/ProtectedRoute";
import MessDetails from "./pages/mess-details/MessDetails";
import AddMess from "./pages/messes/AddMess";
import EditMess from "./pages/messes/EditMess";
function App() {

  return (
    <>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />
        <Route element={<MainLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/messes" element={<Messes />} />
           <Route path="/messes/add" element={<AddMess />} />
            <Route path="/messes/edit/:id" element={<EditMess />} />
          <Route path="/delivery-agents" element={<DeliveryAgents />} />
        </Route>
        <Route
          path="/messes/:id"
          element={
            <ProtectedRoute>
              <MainLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<MessDetails />} />
        </Route>
      </Routes>
    </BrowserRouter>
    </>
  )
}

export default App
