import { BrowserRouter, Route, Routes } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "react-hot-toast";

import {
  CallPage,
  ChatPage,
  HomePage,
  LoginPage,
  NotFoundPage,
  NotificationPage,
  OnboardingPage,
  SignUpPage,
} from "./pages/index";

const queryClient = new QueryClient();

const App = () => {
  return (
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        <div className="h-screen" data-theme="coffee">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/signup" element={<SignUpPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/onboarding" element={<OnboardingPage />} />
            <Route path="/notification" element={<NotificationPage />} />
            <Route path="/call" element={<CallPage />} />
            <Route path="/chat" element={<ChatPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>

          <Toaster />
        </div>
      </QueryClientProvider>
    </BrowserRouter>
  );
};

export default App;
