import React, { useState, useContext } from "react";
import { Link } from "react-router-dom";
import { FoodItemsContext } from "./AdminPanel";
import Navigation from "./Navigation";

const ARMenuPage: React.FC = () => {
  const { foodItems } = useContext(FoodItemsContext);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedSubcategory, setSelectedSubcategory] = useState<string | null>(
    null
  );

  // Get all unique categories
  const categories = Array.from(
    new Set(foodItems.map((item) => item.category))
  );

  // Get all unique subcategories for the selected category
  const subcategories = selectedCategory
    ? Array.from(
        new Set(
          foodItems
            .filter((item) => item.category === selectedCategory)
            .map((item) => item.subcategory)
        )
      )
    : [];

  // Filter food items based on selected category and subcategory
  const filteredItems = foodItems.filter((item) => {
    if (selectedCategory && item.category !== selectedCategory) {
      return false;
    }
    if (selectedSubcategory && item.subcategory !== selectedSubcategory) {
      return false;
    }
    return true;
  });

  // Helper function for price formatting
  const formatPrice = (price: string | number | undefined): string => {
    if (price === undefined || price === null) return "N/A";
    const numPrice = typeof price === "string" ? parseFloat(price) : price;
    if (isNaN(numPrice)) return price.toString(); // Return original if not a valid number
    return `$${numPrice.toFixed(2)}`;
  };

  // Helper function for capitalization (basic example)
  const capitalize = (text: string | undefined): string => {
    if (!text) return "";
    return text.charAt(0).toUpperCase() + text.slice(1);
  };

  return (
    <div
      className="min-h-screen"
      style={{
        backgroundColor: "var(--background-color)",
        color: "var(--text-color)",
      }}
    >
      <Navigation />

      <div className="container mx-auto px-4 py-8">
        <h1
          className="text-3xl font-bold mb-8 text-center"
          style={{ color: "var(--secondary-accent-color)" }}
        >
          AR Food Menu
        </h1>

        {/* Category filters */}
        <div className="mb-8">
          <h2
            className="text-xl font-semibold mb-4"
            style={{ color: "var(--accent-color)" }}
          >
            Categories
          </h2>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => {
                setSelectedCategory(null);
                setSelectedSubcategory(null);
              }}
              className={`px-4 py-2 rounded-full transition-colors ${
                selectedCategory === null
                  ? "bg-accent-color text-white"
                  : "bg-primary-color text-text-color hover:bg-gray-600"
              }`}
              style={{
                border:
                  selectedCategory === null
                    ? "none"
                    : "1px solid var(--border-color)",
              }}
            >
              All
            </button>
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => {
                  setSelectedCategory(category);
                  setSelectedSubcategory(null);
                }}
                className={`px-4 py-2 rounded-full transition-colors ${
                  selectedCategory === category
                    ? "bg-accent-color text-white"
                    : "bg-primary-color text-text-color hover:bg-gray-600"
                }`}
                style={{
                  border:
                    selectedCategory === category
                      ? "none"
                      : "1px solid var(--border-color)",
                }}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {/* Subcategory filters (only show if a category is selected) */}
        {selectedCategory && subcategories.length > 0 && (
          <div className="mb-8">
            <h2
              className="text-xl font-semibold mb-4"
              style={{ color: "var(--accent-color)" }}
            >
              Subcategories
            </h2>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setSelectedSubcategory(null)}
                className={`px-4 py-2 rounded-full transition-colors ${
                  selectedSubcategory === null
                    ? "bg-accent-color text-white"
                    : "bg-primary-color text-text-color hover:bg-gray-600"
                }`}
                style={{
                  border:
                    selectedSubcategory === null
                      ? "none"
                      : "1px solid var(--border-color)",
                }}
              >
                All {selectedCategory}
              </button>
              {subcategories.map((subcategory) => (
                <button
                  key={subcategory}
                  onClick={() => setSelectedSubcategory(subcategory)}
                  className={`px-4 py-2 rounded-full transition-colors ${
                    selectedSubcategory === subcategory
                      ? "bg-accent-color text-white"
                      : "bg-primary-color text-text-color hover:bg-gray-600"
                  }`}
                  style={{
                    border:
                      selectedSubcategory === subcategory
                        ? "none"
                        : "1px solid var(--border-color)",
                  }}
                >
                  {subcategory}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Food items grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredItems.length > 0 ? (
            filteredItems.map((item) => (
              <div
                key={item.id}
                className="card rounded-lg overflow-hidden shadow-lg transition-transform hover:scale-105"
              >
                <div className="p-6 flex flex-col items-center">
                  <div className="text-5xl mb-4">{item.image}</div>
                  <h3
                    className="text-xl font-semibold mb-2"
                    style={{ color: "var(--text-color)" }}
                  >
                    {capitalize(item.name)}
                  </h3>
                  <p
                    className="text-sm mb-4 text-center line-clamp-2"
                    style={{ color: "var(--text-color)" }}
                  >
                    {item.description?.replace(/,([a-zA-Z])/g, ", $1")}
                  </p>
                  <p
                    className="font-bold mb-4"
                    style={{ color: "var(--secondary-accent-color)" }}
                  >
                    {formatPrice(item.price)}
                  </p>

                  <Link
                    to={`/ar-view/${item.id}`}
                    className="btn py-2 px-4 rounded-md transition-colors w-full text-center"
                    style={{}}
                  >
                    View in AR
                  </Link>
                </div>
              </div>
            ))
          ) : (
            <div
              className="col-span-full text-center py-12"
              style={{ color: "var(--text-color)" }}
            >
              <p className="text-lg">
                No items found. Try a different category.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ARMenuPage;
