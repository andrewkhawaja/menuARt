import React, { useEffect, useState, useContext } from "react";
import { useParams, Link } from "react-router-dom";
import { FoodItemsContext } from "./AdminPanel";
import Navigation from "./Navigation";

const ARViewPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { foodItems, loading: appLoading } = useContext(FoodItemsContext);
  const [modelViewerLoaded, setModelViewerLoaded] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);

  // Find the selected food item
  const foodItem = foodItems.find((item) => item.id.toString() === id);

  // Determine the correct model URL based on whether it's a relative path
  const modelSourceUrl = foodItem?.modelUrl.startsWith("/uploads")
    ? `http://localhost:5000${foodItem.modelUrl}`
    : foodItem?.modelUrl;

  // Find related items (same category)
  const relatedItems = foodItems
    .filter(
      (item) =>
        foodItem &&
        item.category === foodItem.category &&
        item.id.toString() !== id
    )
    .slice(0, 3);

  // Load model-viewer script
  useEffect(() => {
    const script = document.createElement("script");
    script.type = "module";
    script.src =
      "https://unpkg.com/@google/model-viewer/dist/model-viewer.min.js";
    script.onload = () => {
      setModelViewerLoaded(true);
    };
    document.head.appendChild(script);

    return () => {
      document.head.removeChild(script);
    };
  }, []);

  // Handle zoom in
  const handleZoomIn = () => {
    setZoomLevel((prev) => Math.min(prev + 0.5, 3));
  };

  // Handle zoom out
  const handleZoomOut = () => {
    setZoomLevel((prev) => Math.max(prev - 0.5, 0.5));
  };

  // Handle reset view
  const handleResetView = () => {
    setZoomLevel(1);

    // Reset camera position if model-viewer is available
    const modelViewer = document.querySelector("model-viewer");
    if (modelViewer) {
      const modelElement = modelViewer as HTMLModelElement;
      if (modelElement.resetTurntable) {
        // Check if resetTurntable exists and is a function
        modelElement.resetTurntable();
      }
      if (modelElement.cameraOrbit !== undefined) {
        // Check if cameraOrbit exists
        modelElement.cameraOrbit = "0deg 75deg 105%";
      }
    }
  };

  // Use appLoading from context to show loading spinner
  if (appLoading) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-amber-500"></div>
      </div>
    );
  }

  if (!foodItem) {
    return (
      <div className="min-h-screen bg-gray-900 text-white">
        <Navigation />
        <div className="container mx-auto px-4 py-16 text-center">
          <h1 className="text-3xl font-bold text-amber-400 mb-4">
            Item Not Found
          </h1>
          <p className="text-gray-300 mb-8">
            The food item you're looking for doesn't exist.
          </p>
          <Link
            to="/ar-menu"
            className="bg-amber-600 hover:bg-amber-700 text-white py-2 px-6 rounded-md transition-colors"
          >
            Back to Menu
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <Navigation />

      <div className="container mx-auto px-4 py-8">
        <Link
          to="/ar-menu"
          className="text-amber-400 hover:text-amber-300 mb-6 inline-block"
        >
          ← Back to Menu
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* 3D Model Viewer */}
          <div className="bg-gray-800 rounded-lg overflow-hidden shadow-lg">
            <div className="relative">
              <div className="h-96 bg-black flex items-center justify-center">
                {modelViewerLoaded ? (
                  <model-viewer
                    src={modelSourceUrl}
                    alt={foodItem.name}
                    auto-rotate
                    camera-controls
                    style={{
                      width: "100%",
                      height: "100%",
                      transform: `scale(${zoomLevel})`,
                    }}
                  ></model-viewer>
                ) : (
                  <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-amber-500"></div>
                )}
              </div>

              {/* Zoom controls */}
              <div className="absolute bottom-4 right-4 flex flex-col space-y-2">
                <button
                  onClick={handleZoomIn}
                  className="bg-amber-600 hover:bg-amber-700 text-white w-10 h-10 rounded-full flex items-center justify-center"
                >
                  +
                </button>
                <button
                  onClick={handleZoomOut}
                  className="bg-amber-600 hover:bg-amber-700 text-white w-10 h-10 rounded-full flex items-center justify-center"
                >
                  -
                </button>
                <button
                  onClick={handleResetView}
                  className="bg-amber-600 hover:bg-amber-700 text-white w-10 h-10 rounded-full flex items-center justify-center"
                >
                  ↺
                </button>
              </div>
            </div>
          </div>

          {/* Food Item Details */}
          <div className="bg-gray-800 rounded-lg p-6 shadow-lg">
            <div className="flex items-center mb-4">
              <span className="text-4xl mr-4">{foodItem.image}</span>
              <div>
                <h1 className="text-2xl font-bold text-white">
                  {foodItem.name}
                </h1>
                <p className="text-amber-400 text-lg font-semibold">
                  {foodItem.price}
                </p>
              </div>
            </div>

            <div className="mb-6">
              <h2 className="text-lg font-semibold text-amber-400 mb-2">
                Description
              </h2>
              <p className="text-gray-300">{foodItem.description}</p>
            </div>

            <div className="mb-6">
              <h2 className="text-lg font-semibold text-amber-400 mb-2">
                Category
              </h2>
              <div className="flex space-x-2">
                <span className="px-3 py-1 bg-amber-600 text-white text-sm rounded-full">
                  {foodItem.category}
                </span>
                <span className="px-3 py-1 bg-amber-800 text-white text-sm rounded-full">
                  {foodItem.subcategory}
                </span>
              </div>
            </div>

            {/* AR Instructions */}
            <div className="mb-6 p-4 bg-gray-700 rounded-lg">
              <h2 className="text-lg font-semibold text-amber-400 mb-2">
                AR Viewing Instructions
              </h2>
              <ul className="text-gray-300 space-y-2">
                <li>• Drag to rotate the 3D model</li>
                <li>• Pinch or use buttons to zoom in/out</li>
                <li>• Double-tap to reset the view</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Related Items */}
        {relatedItems.length > 0 && (
          <div className="mt-12">
            <h2 className="text-2xl font-bold text-amber-400 mb-6">
              You Might Also Like
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {relatedItems.map((item) => (
                <div
                  key={item.id}
                  className="bg-gray-800 rounded-lg overflow-hidden shadow-lg transition-transform hover:scale-105"
                >
                  <div className="p-6 flex flex-col items-center">
                    <div className="text-4xl mb-4">{item.image}</div>
                    <h3 className="text-lg font-semibold text-white mb-2">
                      {item.name}
                    </h3>
                    <p className="text-gray-300 text-sm mb-4 text-center line-clamp-2">
                      {item.description}
                    </p>
                    <p className="text-amber-400 font-bold mb-4">
                      {item.price}
                    </p>

                    <Link
                      to={`/ar-view/${item.id}`}
                      className="bg-amber-600 hover:bg-amber-700 text-white py-2 px-4 rounded-md transition-colors w-full text-center"
                    >
                      View in AR
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ARViewPage;
