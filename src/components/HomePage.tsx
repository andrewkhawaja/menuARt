import React from "react";
import { Link } from "react-router-dom";

const HomePage: React.FC = () => {
  return (
    <div
      className="min-h-screen"
      style={{
        backgroundColor: "var(--background-color)",
        color: "var(--text-color)",
      }}
    >
      <div className="container mx-auto px-4 py-12">
        <header className="text-center mb-16">
          <h1
            className="text-4xl md:text-5xl font-bold mb-4"
            style={{ color: "var(--secondary-accent-color)" }}
          >
            AR Food Experience
          </h1>
          <p
            className="text-lg md:text-xl"
            style={{ color: "var(--text-color)" }}
          >
            Discover our menu in augmented reality
          </p>
        </header>

        <div className="max-w-4xl mx-auto card overflow-hidden">
          <div className="md:flex">
            <div className="md:w-1/2 p-6 md:p-8">
              <h2
                className="text-2xl md:text-3xl font-semibold mb-4"
                style={{ color: "var(--accent-color)" }}
              >
                Welcome to Our Restaurant
              </h2>
              <p className="mb-6" style={{ color: "var(--text-color)" }}>
                Experience our delicious cuisine like never before with our
                innovative augmented reality menu. Scan our special markers to
                see detailed 3D models of each dish before you order.
              </p>
              <p className="mb-6" style={{ color: "var(--text-color)" }}>
                Our chefs prepare each dish with the finest ingredients,
                combining traditional recipes with modern culinary techniques to
                create unforgettable flavors.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link
                  to="/ar-menu"
                  className="inline-block btn transform hover:scale-105"
                >
                  Explore AR Menu
                </Link>
                <Link
                  to="/recommendations"
                  className="inline-block btn"
                  style={{
                    backgroundColor: "var(--primary-color)",
                    color: "var(--text-color)",
                    border: "1px solid var(--accent-color)",
                  }}
                >
                  Get Recommendations
                </Link>
              </div>
            </div>
            <div
              className="md:w-1/2 p-8 flex items-center justify-center"
              style={{ backgroundColor: "var(--primary-color)" }}
            >
              <div
                className="text-center"
                style={{ color: "var(--text-color)" }}
              >
                <div
                  className="text-6xl mb-4"
                  style={{ color: "var(--secondary-accent-color)" }}
                >
                  🍽️
                </div>
                <h3 className="text-2xl font-semibold mb-2">
                  Scan. View. Order.
                </h3>
                <p>
                  Use your device's camera to experience our menu in augmented
                  reality
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-16 text-center">
          <p className="mb-2" style={{ color: "var(--text-color)" }}>
            Are you an administrator?
          </p>
          <Link
            to="/admin"
            className="underline"
            style={{ color: "var(--accent-color)" }}
          >
            Access Admin Panel
          </Link>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
