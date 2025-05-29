import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import HomePage from "./components/HomePage";
import ARMenuPage from "./components/ARMenuPage";
import RecommendationsPage from "./components/RecommendationsPage";
import AdminPanel, { FoodItemsProvider } from "./components/AdminPanel";
import ARViewPage from "./components/ARViewPage";
import ThemeToggle from "./components/ThemeToggle";
import Navigation from "./components/Navigation";
import "./App.css";

const App: React.FC = () => {
  return (
    <FoodItemsProvider>
      <Router>
        <div
          className="min-h-screen pt-14"
          style={{ backgroundColor: "var(--background-color)" }}
        >
          <Navigation />
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/ar-menu" element={<ARMenuPage />} />
            <Route path="/recommendations" element={<RecommendationsPage />} />
            <Route path="/admin" element={<AdminPanel />} />
            <Route path="/ar-view/:id" element={<ARViewPage />} />
          </Routes>
          <ThemeToggle />
        </div>
      </Router>
    </FoodItemsProvider>
  );
};

export default App;
