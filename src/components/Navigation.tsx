import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";

// Navigation component for consistent header across pages
const Navigation: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close menu when route changes
  useEffect(() => {
    setIsMenuOpen(false);
  }, [location]);

  const navLinks = [
    { path: "/", label: "Home" },
    { path: "/ar-menu", label: "AR Menu" },
    { path: "/recommendations", label: "Recommendations" },
    { path: "/admin", label: "Admin" },
  ];

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? "bg-card-background shadow-lg" : "bg-transparent"
      }`}
      style={{
        backgroundColor: isScrolled ? "var(--card-background)" : "transparent",
      }}
    >
      <div className="container mx-auto px-3">
        <nav className="flex items-center justify-between h-14">
          {/* Logo */}
          <Link
            to="/"
            className="flex items-center space-x-2 transform hover:scale-105 transition-transform duration-300"
          >
            <span
              className="text-xl font-bold"
              style={{ color: "var(--accent-color)" }}
            >
              MenuARt
            </span>
            <span
              className="text-xs"
              style={{ color: "var(--secondary-accent-color)" }}
            >
              AR Food Experience
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`relative px-2 py-1 text-sm font-medium transition-all duration-300 hover:scale-105 ${
                  location.pathname === link.path
                    ? "text-accent-color"
                    : "text-text-color hover:text-accent-color"
                }`}
                style={{
                  color:
                    location.pathname === link.path
                      ? "var(--accent-color)"
                      : "var(--text-color)",
                }}
              >
                {link.label}
                {location.pathname === link.path && (
                  <span
                    className="absolute bottom-0 left-0 w-full h-0.5 transform origin-left transition-transform duration-300"
                    style={{ backgroundColor: "var(--accent-color)" }}
                  />
                )}
              </Link>
            ))}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-1.5 rounded-lg hover:bg-primary-color transition-colors duration-300"
            aria-label="Toggle menu"
            style={{ color: "var(--text-color)" }}
          >
            <div className="w-5 h-4 relative transform transition-all duration-300">
              <span
                className={`absolute h-0.5 w-full bg-current transform transition-all duration-300 ${
                  isMenuOpen ? "rotate-45 top-1.5" : "top-0"
                }`}
              />
              <span
                className={`absolute h-0.5 w-full bg-current top-1.5 transition-all duration-300 ${
                  isMenuOpen ? "opacity-0" : "opacity-100"
                }`}
              />
              <span
                className={`absolute h-0.5 w-full bg-current transform transition-all duration-300 ${
                  isMenuOpen ? "-rotate-45 top-1.5" : "top-3"
                }`}
              />
            </div>
          </button>
        </nav>

        {/* Mobile Navigation Menu */}
        <div
          className={`md:hidden transition-all duration-300 ease-in-out ${
            isMenuOpen
              ? "max-h-64 opacity-100"
              : "max-h-0 opacity-0 pointer-events-none"
          }`}
          style={{ backgroundColor: "var(--card-background)" }}
        >
          <div className="py-1 space-y-0.5">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`block px-3 py-1.5 text-sm font-medium transition-all duration-300 ${
                  location.pathname === link.path
                    ? "text-accent-color"
                    : "text-text-color hover:text-accent-color"
                }`}
                style={{
                  color:
                    location.pathname === link.path
                      ? "var(--accent-color)"
                      : "var(--text-color)",
                }}
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navigation;
