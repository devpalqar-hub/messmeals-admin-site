import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/auth/Login/Login";
import Dashboard from "./pages/dashboard/Dashboard";
import Messes from "./pages/messes/Messes";
import DeliveryAgents from "./pages/deliveryAgents/DeliveryAgents";
import MainLayout from "./components/Layout/MainLayout";
import ProtectedRoute from "./routes/ProtectedRoute";
import AddMess from "./pages/messes/AddMess";
import EditMess from "./pages/messes/EditMess";
import MessEnquiries from "./pages/enquiries/Mess Listing Enquiries/MessEnquiries";
import CustomerEnquiries from "./pages/enquiries/Customer Enquiries/CustomerEnquiries";
import MessDetails from "./pages/mess-details/MessDetails";
import MessOwners from "./pages/ mess-owners/MessOwners";
import AddMessOwner from "./pages/ mess-owners/AddMessOwner";



function App() {

  return (
    <>
    <BrowserRouter>
  <Routes>
    {/* Public Routes */}
    <Route path="/" element={<Navigate to="/login" replace />} />
    <Route path="/login" element={<Login />} />

    {/* Protected Layout Routes */}
    <Route
  element={
    <ProtectedRoute>
      <MainLayout />
    </ProtectedRoute>
  }
      >
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/messes" element={<Messes />} />
        <Route path="/messes/add" element={<AddMess />} />
        <Route path="/messes/edit/:id" element={<EditMess />} />
        <Route path="/messes/:id" element={<MessDetails />} />
        <Route path="/mess-owners" element={<MessOwners />} />
        <Route path="/mess-owners/add" element={<AddMessOwner />} />
        <Route path="/delivery-agents" element={<DeliveryAgents />} />
        <Route path="/mess-enquiries" element={<MessEnquiries />} />
        <Route path="/customer-enquiries" element={<CustomerEnquiries />} />
      </Route>

  </Routes>
</BrowserRouter>

    </>
  )
}

export default App
