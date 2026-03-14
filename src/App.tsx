import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AppProvider } from "@/context/AppContext";

// Layouts
import MainLayout from "@/layouts/MainLayout";
import DashboardLayout from "@/layouts/DashboardLayout";
import AdminLayout from "@/layouts/AdminLayout";

// Public pages
import Home from "@/pages/public/Home";
import Marketplace from "@/pages/public/Marketplace";
import ProductDetails from "@/pages/public/ProductDetails";
import InstallmentCalculator from "@/pages/public/InstallmentCalculator";
import About from "@/pages/public/About";
import Contact from "@/pages/public/Contact";

// Auth pages
import Login from "@/pages/auth/Login";
import Register from "@/pages/auth/Register";
import ForgotPassword from "@/pages/auth/ForgotPassword";

// Dashboard pages
import DashboardHome from "@/pages/dashboard/DashboardHome";
import Orders from "@/pages/dashboard/Orders";
import Installments from "@/pages/dashboard/Installments";
import Payments from "@/pages/dashboard/Payments";
import Receipts from "@/pages/dashboard/Receipts";
import Wishlist from "@/pages/dashboard/Wishlist";
import Profile from "@/pages/dashboard/Profile";
import PaymentMethods from "@/pages/dashboard/PaymentMethods";
import Notifications from "@/pages/dashboard/Notifications";

// Admin pages
import AdminDashboard from "@/pages/admin/AdminDashboard";
import AdminProducts from "@/pages/admin/AdminProducts";
import AdminUsers from "@/pages/admin/AdminUsers";
import AdminOrders from "@/pages/admin/AdminOrders";
import AdminInstallments from "@/pages/admin/AdminInstallments";
import AdminTransactions from "@/pages/admin/AdminTransactions";
import AdminAnalytics from "@/pages/admin/AdminAnalytics";

import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AppProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<MainLayout><Home /></MainLayout>} />
            <Route path="/marketplace" element={<MainLayout><Marketplace /></MainLayout>} />
            <Route path="/product/:id" element={<MainLayout><ProductDetails /></MainLayout>} />
            <Route path="/calculator" element={<MainLayout><InstallmentCalculator /></MainLayout>} />
            <Route path="/about" element={<MainLayout><About /></MainLayout>} />
            <Route path="/contact" element={<MainLayout><Contact /></MainLayout>} />

            {/* Auth routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />

            {/* Dashboard routes */}
            <Route path="/dashboard" element={<DashboardLayout><DashboardHome /></DashboardLayout>} />
            <Route path="/dashboard/orders" element={<DashboardLayout><Orders /></DashboardLayout>} />
            <Route path="/dashboard/installments" element={<DashboardLayout><Installments /></DashboardLayout>} />
            <Route path="/dashboard/payments" element={<DashboardLayout><Payments /></DashboardLayout>} />
            <Route path="/dashboard/receipts" element={<DashboardLayout><Receipts /></DashboardLayout>} />
            <Route path="/dashboard/wishlist" element={<DashboardLayout><Wishlist /></DashboardLayout>} />
            <Route path="/dashboard/profile" element={<DashboardLayout><Profile /></DashboardLayout>} />
            <Route path="/dashboard/payment-methods" element={<DashboardLayout><PaymentMethods /></DashboardLayout>} />
            <Route path="/dashboard/notifications" element={<DashboardLayout><Notifications /></DashboardLayout>} />

            {/* Admin routes */}
            <Route path="/admin" element={<AdminLayout><AdminDashboard /></AdminLayout>} />
            <Route path="/admin/products" element={<AdminLayout><AdminProducts /></AdminLayout>} />
            <Route path="/admin/users" element={<AdminLayout><AdminUsers /></AdminLayout>} />
            <Route path="/admin/orders" element={<AdminLayout><AdminOrders /></AdminLayout>} />
            <Route path="/admin/installments" element={<AdminLayout><AdminInstallments /></AdminLayout>} />
            <Route path="/admin/transactions" element={<AdminLayout><AdminTransactions /></AdminLayout>} />
            <Route path="/admin/analytics" element={<AdminLayout><AdminAnalytics /></AdminLayout>} />

            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AppProvider>
  </QueryClientProvider>
);

export default App;
