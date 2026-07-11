import { lazy, Suspense } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import LandingPage from "./landing/LandingPage";
import { RequireAuth } from "./backend/auth";
import { PageLoader } from "./shared/ui";

// Code split the application routes so the landing page loads fast.
const AnalyzerPage = lazy(() => import("./frontend/pages/AnalyzerPage"));
const LoginPage = lazy(() => import("./frontend/pages/LoginPage"));
const SignupPage = lazy(() => import("./frontend/pages/SignupPage"));
const HistoryPage = lazy(() => import("./frontend/pages/HistoryPage"));

export default function App() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/app" element={<AnalyzerPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route
          path="/history"
          element={
            <RequireAuth>
              <HistoryPage />
            </RequireAuth>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
}
