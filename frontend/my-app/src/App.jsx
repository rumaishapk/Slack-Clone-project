import { useAuth } from "@clerk/clerk-react";
import { Route, Navigate, Routes } from "react-router";

import HomePage from "./pages/HomePage";
import AuthPage from "./pages/AuthPage";

import * as Sentry from "@sentry/react";
const SentryRoutes = Sentry.withSentryReactRouterV7Routing(Routes);
import CallPage from "./pages/callPage";

const App = () => {
  const { isSignedIn, isLoaded } = useAuth();

  if (!isLoaded) return null;

  return (
    <div>
      <header>
        <SentryRoutes>
          <Route
            path="/"
            element={
              isSignedIn ? <HomePage /> : <Navigate to={"/auth"} replace />
            }
          />
          <Route
            path="/auth"
            element={isSignedIn ? <Navigate to={"/"} replace /> : <AuthPage />}
          />
          <Route
            path="/call/:id"
            element={
              isSignedIn ? <CallPage /> : <Navigate to={"/auth"} replace />
            }
          />
          <Route
            path="*"
            element={
              isSignedIn ? (
                <Navigate to={"/"} replace />
              ) : (
                <Navigate to={"/auth"} replace />
              )
            }
          />
        </SentryRoutes>
      </header>
    </div>
  );
};

export default App;
