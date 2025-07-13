import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { useQuery } from "@tanstack/react-query";
import { Axios } from "../lib/axios";

import {
  CallPage,
  ChatPage,
  HomePage,
  LoginPage,
  NotFoundPage,
  NotificationPage,
  OnboardingPage,
  SignUpPage,
} from "../pages/index";

const Router = () => {
  const {
    data: authData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["authUser"],
    queryFn: async () => {
      const res = await Axios.get("https://jsonplaceholder.typicode.com/todos");
      // const res = await Axios.get("/auth/me");
      return res.data;
    },
    retry: false,
  });

  const authUser = authData?.user;

  const ProtectedRoute = ({ children }) => {
    return authData?.user ? children : <Navigate to="/login" />;
  };

  const PublicRoute = ({ children }) => {
    return !authData?.user ? children : <Navigate to="/" />;
  };

  return (
    <div className="h-screen" data-theme="coffee">
      <Routes>
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <HomePage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/signup"
          element={
            <PublicRoute>
              <SignUpPage />
            </PublicRoute>
          }
        />

        <Route
          path="/login"
          element={
            <PublicRoute>
              <LoginPage />
            </PublicRoute>
          }
        />

        <Route
          path="/onboarding"
          element={
            <ProtectedRoute>
              <OnboardingPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/notification"
          element={
            <ProtectedRoute>
              <NotificationPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/call"
          element={
            <ProtectedRoute>
              <CallPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/chat"
          element={
            <ProtectedRoute>
              <ChatPage />
            </ProtectedRoute>
          }
        />

        <Route path="*" element={<NotFoundPage />} />
      </Routes>

      <Toaster />
    </div>
  );
};

export default Router;
