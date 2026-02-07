import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/auth/Login/Login";
import Dashboard from "./pages/dashboard/Dashboard";
import Messes from "./pages/messes/Messes";
import DeliveryAgents from "./pages/deliveryAgents/DeliveryAgents";
import MainLayout from "./components/Layout/MainLayout";
import ProtectedRoute from "./routes/ProtectedRoute";
import MessDetails from "./pages/mess-details/MessDetails";
import MessEnquiries from "./pages/enquiries/Mess Listing Enquiries/MessEnquiries";
import CustomerEnquiries from "./pages/enquiries/Customer Enquiries/CustomerEnquiries";

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
          <Route path="/delivery-agents" element={<DeliveryAgents />} />
          <Route path="/mess-enquiries" element={<MessEnquiries />} />
          <Route path="/customer-enquiries" element={<CustomerEnquiries />} />
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
