import {
  SignedOut,
  SignedIn,
} from "@clerk/clerk-react";
import { Route, Navigate, Routes } from "react-router";

import HomePage from "./pages/HomePage";
import AuthPage from "./pages/AuthPage";

const App = () => {
  return (
    <div>
      <header>
        <SignedIn>
          <Routes>
            <Route path="/" element={<HomePage />}></Route>
            <Route path="/auth" element={<Navigate to={"/"} replace />}></Route>
          </Routes>
        </SignedIn>

        <SignedOut>
          <Routes>
            <Route path="/auth" element={<AuthPage />} />
            <Route path="*" element={<Navigate to="/auth" replace />} />
          </Routes>
        </SignedOut>
      </header>
    </div>
  );
};

export default App;
