import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
  useParams,
} from "react-router-dom";
import { ThirdwebProvider } from "thirdweb/react";
import AppLayout from "./components/layout/AppLayout";
import AuthLayout from "./components/layout/AuthLayout";
import CustomerLayout from "./components/layout/CustomerLayout";
import CreatorLayout from "./components/layout/CreatorLayout";
import SellerLayout from "./components/layout/SellerLayout";
import AdminLayout from "./components/layout/AdminLayout";
import CallLayout from "./components/layout/CallLayout";
import ProtectedRoute, { AdminRoute } from "./components/auth/ProtectedRoute";
import AuthProvider from "./components/auth/AuthProvider";
import CreatorsPage from "./pages/CreatorsPage";
import CreatorDetailPage from "./pages/CreatorDetailPage";
import MyPurchasesPage from "./pages/MyPurchasesPage";
import LoginPage from "./pages/LoginPage";
import { ROUTES } from "./constants/routes";
import PerfilPage from "./pages/PerfilPage";
import CRMpage from "./pages/CRMpage";
import ChatMessage from "./pages/ChatMessage";
import InternalChatPage from "./pages/InternalChatPage";
import ChatPage from "./pages/ChatPage";
import CreatorInboxPage from "./pages/CreatorInboxPage";
import ClientInboxPage from "./pages/ClientInboxPage";
import CRMDashboard from "./pages/CRMDashboard";
import CRMDealsPage from "./pages/CRMDeals";
import SettingsPage from "./pages/SettingsPage";
import SalesPeoplePage from "./pages/SalesPeoplePage";
import GalleryPage from "./pages/GalleryPage";
import Contacts from "./pages/Contacts";
import ProductsPage from "./pages/ProductsPage";
import WorkTeamsPage from "./pages/WorkTeamsPage";
import AdminPricingPage from "./pages/AdminPricingPage";
import AdminUsersPage from "./pages/admin/AdminUsersPage";
import AdminAuditLogPage from "./pages/admin/AdminAuditLogPage";
import PlanesPage from "./pages/PlanesPage";
import { Toaster } from "react-hot-toast";
import PublicCreatorProfilePage from "./pages/PublicCreatorProfilePage";
import MyBookings from "./pages/MyBookings";
import CreatorBookings from "./pages/CreatorBookings";
import CallSettings from "./pages/CallSettings";
import { useAuthStore } from "./store/auth";
import { USER_ROLES } from "./types/auth";
import { CallProvider } from "./components/calls/CallProvider";
import { ThemeProvider } from "./theme/ThemeProvider";
import CursorGlow from "./components/effects/CursorGlow";
import BecomeCreatorWizard from "./components/onboarding/BecomeCreatorWizard";
import BecomeSellerWizard from "./components/onboarding/BecomeSellerWizard";
import SelectPathPage from "./pages/onboarding/SelectPathPage";
import DiscoverSellersPage from "./pages/DiscoverSellersPage";
import NotificationsPage from "./pages/NotificationsPage";
import CollaborationsPage from "./pages/CollaborationsPage";
import CallPage from "./pages/CallPage";
import ComingSoon from "./pages/_ComingSoon";
import { PERMISSIONS } from "./constants/permissions";
import DashboardPage from "./pages/DashboardPage";
import StudioAIPage from "./pages/StudioAIPage";
import EarningsPage from "./pages/EarningsPage";
import ProductEditPage from "./pages/ProductEditPage";
import SellerCreatorViewPage from "./pages/SellerCreatorViewPage";
import SellerDashboardPage from "./pages/SellerDashboardPage";
import SellerCommissionsPage from "./pages/SellerCommissionsPage";
import SellerAIPage from "./pages/SellerAIPage";
import SellerAnalyticsPage from "./pages/SellerAnalyticsPage";
import PublicSellerProfilePage from "./pages/PublicSellerProfilePage";

/** Redirige a la página principal del rol del usuario. */
function RoleBasedRedirect() {
  const user = useAuthStore((s) => s.user);
  if (!user) return <Navigate to={ROUTES.login} replace />;
  switch (user.role) {
    case USER_ROLES.CUSTOMER:
      return <Navigate to={ROUTES["customer-creators"]} replace />;
    case USER_ROLES.CREATOR:
      return <Navigate to={ROUTES["creator-dashboard"]} replace />;
    case USER_ROLES.VENDEDOR:
    case USER_ROLES.MODERATOR:
      return <Navigate to={ROUTES["seller-creators"]} replace />;
    case USER_ROLES.ADMIN:
      return <Navigate to={ROUTES["admin-users"]} replace />;
    default:
      return <Navigate to={ROUTES["customer-creators"]} replace />;
  }
}

/** Entrada compartida /messages → inbox según rol. */
function MessagesRedirect() {
  const user = useAuthStore((s) => s.user);
  if (user?.role === USER_ROLES.VENDEDOR || user?.role === USER_ROLES.MODERATOR)
    return <Navigate to={ROUTES["seller-chat"]} replace />;
  if (user?.role === USER_ROLES.CUSTOMER)
    return <Navigate to={ROUTES["client-inbox"]} replace />;
  return <Navigate to={ROUTES["creator-inbox"]} replace />;
}

/** Redirección que preserva params de la URL. */
function RedirectParam({ build }: { build: (p: Record<string, string | undefined>) => string }) {
  const params = useParams();
  return <Navigate to={build(params)} replace />;
}

export default function App() {
  return (
    <ThirdwebProvider>
      <ThemeProvider>
      <CursorGlow />
      <Toaster position="top-right" toastOptions={{ duration: 3000 }} />
      <BrowserRouter>
        <AuthProvider>
          <CallProvider>
            <Routes>
              {/* ===== Públicas ===== */}
              <Route element={<AuthLayout />}>
                <Route path={ROUTES.login} element={<LoginPage />} />
              </Route>
              <Route path="/p/:username" element={<PublicCreatorProfilePage />} />
              <Route path="/vendedor/:username" element={<PublicSellerProfilePage />} />

              {/* ===== Llamada (full-screen, sin AppLayout) ===== */}
              <Route element={<CallLayout />}>
                <Route
                  path={ROUTES.call}
                  element={
                    <ProtectedRoute>
                      <CallPage />
                    </ProtectedRoute>
                  }
                />
              </Route>
              <Route
                path="/calls/:bookingId"
                element={<RedirectParam build={(p) => `/call/${p.bookingId}`} />}
              />

              {/* ===== Rutas protegidas con layout común ===== */}
              <Route
                path="/"
                element={
                  <ProtectedRoute>
                    <AppLayout />
                  </ProtectedRoute>
                }
              >
                <Route index element={<RoleBasedRedirect />} />
                <Route path="dashboard" element={<RoleBasedRedirect />} />

                {/* ----- Shared ----- */}
                <Route path="profile" element={<PerfilPage />} />
                <Route path="settings" element={<SettingsPage />} />
                <Route path="notifications" element={<NotificationsPage />} />
                <Route path="messages" element={<MessagesRedirect />} />

                {/* ----- Onboarding ----- */}
                <Route path="onboarding/select-path" element={<SelectPathPage />} />
                <Route path="onboarding/creator" element={<BecomeCreatorWizard />} />
                <Route path="onboarding/seller" element={<BecomeSellerWizard />} />
                {/* Alias legacy */}
                <Route path="become-creator" element={<BecomeCreatorWizard />} />
                <Route path="become-seller" element={<BecomeSellerWizard />} />

                {/* ===== Customer (/customer/*) ===== */}
                <Route path="customer" element={<CustomerLayout />}>
                  <Route path="creators" element={<CreatorsPage />} />
                  <Route path="creator/:id" element={<CreatorDetailPage />} />
                  <Route path="purchases" element={<MyPurchasesPage />} />
                  <Route path="bookings" element={<MyBookings />} />
                  <Route path="planes" element={<PlanesPage />} />
                  <Route path="cart" element={<ComingSoon title="Carrito" />} />
                </Route>

                {/* ===== Creator (/creator/*) ===== */}
                <Route path="creator" element={<CreatorLayout />}>
                  <Route path="dashboard" element={<DashboardPage />} />
                  <Route path="products" element={<ProductsPage />} />
                  <Route path="products/:id" element={<ProductEditPage />} />
                  <Route path="sellers" element={<DiscoverSellersPage />} />
                  <Route path="collaborations" element={<CollaborationsPage />} />
                  <Route path="bookings" element={<CreatorBookings />} />
                  <Route path="settings/calls" element={<CallSettings />} />
                  <Route path="crm" element={<CRMpage />}>
                    <Route index element={<CRMDashboard />} />
                    <Route path="dashboard" element={<CRMDashboard />} />
                    <Route path="deals" element={<CRMDealsPage />} />
                  </Route>
                  <Route path="contacts" element={<Contacts />} />
                  <Route path="work-teams" element={<WorkTeamsPage />} />
                  <Route path="studio-ai" element={<StudioAIPage />} />
                  <Route path="earnings" element={<EarningsPage />} />
                </Route>

                {/* ===== Seller (/seller/*) — rol "vendedor" ===== */}
                <Route path="seller" element={<SellerLayout />}>
                  <Route path="dashboard" element={<SellerDashboardPage />} />
                  <Route path="creators" element={<CollaborationsPage />} />
                  {/* Vista individual por creadora: /seller/creator/:username/* */}
                  <Route path="creator/:username/*" element={<SellerCreatorViewPage />} />
                  <Route path="commissions" element={<SellerCommissionsPage />} />
                  <Route path="ai-sales" element={<SellerAIPage />} />
                  <Route path="analytics" element={<SellerAnalyticsPage />} />
                  <Route path="profile" element={<PerfilPage />} />
                </Route>

                {/* ===== Admin (/admin/*) — solo andresquinteros2017@gmail.com ===== */}
                <Route path="admin" element={<AdminRoute><AdminLayout /></AdminRoute>}>
                  <Route path="users" element={<AdminUsersPage />} />
                  <Route path="audit-log" element={<AdminAuditLogPage />} />
                  <Route path="pricing" element={<AdminPricingPage />} />
                  <Route path="creators" element={<ComingSoon title="Creadoras" />} />
                  <Route path="sellers" element={<ComingSoon title="Vendedores" />} />
                  <Route path="reports" element={<ComingSoon title="Reportes" />} />
                  <Route path="payments" element={<ComingSoon title="Pagos" />} />
                  <Route path="commissions" element={<ComingSoon title="Comisiones" />} />
                  <Route path="ai" element={<ComingSoon title="IA" />} />
                  <Route path="moderation" element={<ComingSoon title="Moderación" />} />
                </Route>

                {/* ===== Alias legacy (rutas planas que siguen funcionando) ===== */}
                <Route
                  path="creators"
                  element={
                    <ProtectedRoute requiredPermission={PERMISSIONS.CUSTOMER_CREATORS_BROWSE}>
                      <CreatorsPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="creators/:id"
                  element={<RedirectParam build={(p) => `/customer/creator/${p.id}`} />}
                />
                <Route
                  path="my-purchases"
                  element={
                    <ProtectedRoute requiredPermission={PERMISSIONS.CUSTOMER_PURCHASES_VIEW}>
                      <MyPurchasesPage />
                    </ProtectedRoute>
                  }
                />
                <Route path="my-bookings" element={<MyBookings />} />
                <Route
                  path={ROUTES["planes"]}
                  element={
                    <ProtectedRoute requiredPermission={PERMISSIONS.CUSTOMER_PURCHASES_VIEW}>
                      <PlanesPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path={ROUTES.chat}
                  element={
                    <ProtectedRoute requiredPermission={PERMISSIONS.CUSTOMER_MESSAGES_ACCESS}>
                      <ChatPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path={ROUTES["client-inbox"]}
                  element={
                    <ProtectedRoute requiredPermission={PERMISSIONS.CUSTOMER_MESSAGES_ACCESS}>
                      <ClientInboxPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path={ROUTES["creator-inbox"]}
                  element={
                    <ProtectedRoute requiredPermission={PERMISSIONS.CREATOR_MESSAGES_ACCESS}>
                      <CreatorInboxPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path={ROUTES.conversations}
                  element={
                    <ProtectedRoute requiredPermission={PERMISSIONS.CREATOR_MESSAGES_ACCESS}>
                      <InternalChatPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path={ROUTES.chatMessage}
                  element={
                    <ProtectedRoute requiredPermission={PERMISSIONS.CREATOR_MESSAGES_ACCESS}>
                      <ChatMessage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path={ROUTES.products}
                  element={
                    <ProtectedRoute requiredPermission={PERMISSIONS.CREATOR_PRODUCTS_VIEW}>
                      <ProductsPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path={ROUTES.crm}
                  element={
                    <ProtectedRoute requiredPermission={PERMISSIONS.CREATOR_CRM_VIEW}>
                      <CRMpage />
                    </ProtectedRoute>
                  }
                >
                  <Route index element={<CRMDashboard />} />
                  <Route path="dashboard" element={<CRMDashboard />} />
                  <Route path="deals" element={<CRMDealsPage />} />
                </Route>
                <Route
                  path={ROUTES.contacts}
                  element={
                    <ProtectedRoute requiredPermission={PERMISSIONS.CREATOR_CONTACTS_VIEW}>
                      <Contacts />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path={ROUTES["work-teams"]}
                  element={
                    <ProtectedRoute requiredPermission={PERMISSIONS.CREATOR_TEAMS_MANAGE}>
                      <WorkTeamsPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path={ROUTES["discover-sellers"]}
                  element={
                    <ProtectedRoute requiredPermission={PERMISSIONS.CREATOR_SELLERS_MANAGE}>
                      <DiscoverSellersPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path={ROUTES.collaborations}
                  element={
                    <ProtectedRoute requiredPermissions={[PERMISSIONS.CREATOR_SELLERS_MANAGE, PERMISSIONS.SELLER_CREATORS_VIEW]}>
                      <CollaborationsPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path={ROUTES.salespeople}
                  element={
                    <ProtectedRoute requiredPermission={PERMISSIONS.CREATOR_DASHBOARD_VIEW}>
                      <SalesPeoplePage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path={ROUTES.gallery}
                  element={
                    <ProtectedRoute requiredPermission={PERMISSIONS.CREATOR_DASHBOARD_VIEW}>
                      <GalleryPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path={ROUTES.membership}
                  element={
                    <ProtectedRoute requiredPermission={PERMISSIONS.CREATOR_DASHBOARD_VIEW}>
                      <PlanesPage />
                    </ProtectedRoute>
                  }
                />

                <Route path="*" element={<Navigate to="/" replace />} />
              </Route>
            </Routes>
          </CallProvider>
        </AuthProvider>
      </BrowserRouter>
      </ThemeProvider>
    </ThirdwebProvider>
  );
}
