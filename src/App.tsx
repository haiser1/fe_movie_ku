import { Routes, Route } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import AdminLayout from "@/components/layout/AdminLayout";
import ProtectedRoute from "@/components/shared/ProtectedRoute";
import AdminRoute from "@/components/shared/AdminRoute";
import HomePage from "@/pages/HomePage";
import MoviesPage from "@/pages/MoviesPage";
import MovieDetailPage from "@/pages/MovieDetailPage";
import AuthCallbackPage from "@/pages/AuthCallbackPage";
import WishlistPage from "@/pages/WishlistPage";
import MyMoviesPage from "@/pages/MyMoviesPage";
import AdminDashboardPage from "@/pages/AdminDashboardPage";
import AdminMoviesPage from "@/pages/AdminMoviesPage";
import AdminUsersPage from "@/pages/AdminUsersPage";
import AdminSyncPage from "@/pages/AdminSyncPage";
import LoginPage from "@/pages/LoginPage";
import RegisterPage from "@/pages/RegisterPage";

export default function App() {
  return (
    <Routes>
      {/* Public + User routes — uses top Navbar */}
      <Route element={<Layout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/movies" element={<MoviesPage />} />
        <Route path="/movies/:id" element={<MovieDetailPage />} />
        <Route path="/auth/callback" element={<AuthCallbackPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        <Route element={<ProtectedRoute />}>
          <Route path="/wishlist" element={<WishlistPage />} />
          <Route path="/my-movies" element={<MyMoviesPage />} />
        </Route>
      </Route>

      {/* Admin routes — uses sidebar layout (no Navbar) */}
      <Route element={<AdminRoute />}>
        <Route element={<AdminLayout />}>
          <Route path="/admin/dashboard" element={<AdminDashboardPage />} />
          <Route path="/admin/movies" element={<AdminMoviesPage />} />
          <Route path="/admin/users" element={<AdminUsersPage />} />
          <Route path="/admin/sync" element={<AdminSyncPage />} />
        </Route>
      </Route>
    </Routes>
  );
}