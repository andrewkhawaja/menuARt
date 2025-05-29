import React, { useState, useEffect } from "react";
import {
  FoodItem,
  addMenuItem,
  updateMenuItem,
  deleteMenuItem,
  getMenuItems,
} from "../api/menuApi";
import Navigation from "./Navigation";
import { QRCodeSVG } from "qrcode.react";

// Create a context to share food items data across components
export const FoodItemsContext = React.createContext<{
  foodItems: FoodItem[];
  setFoodItems: React.Dispatch<React.SetStateAction<FoodItem[]>>;
  refreshFoodItems: () => Promise<void>;
  loading: boolean;
}>({
  foodItems: [],
  setFoodItems: () => {},
  refreshFoodItems: async () => {},
  loading: true,
});

export const FoodItemsProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [foodItems, setFoodItems] = useState<FoodItem[]>([]);
  const [loading, setLoading] = useState(true);

  const refreshFoodItems = async () => {
    try {
      setLoading(true);
      const items = await getMenuItems();
      setFoodItems(items);
    } catch (err) {
      console.error("Error fetching menu items:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshFoodItems();
  }, []);

  return (
    <FoodItemsContext.Provider
      value={{ foodItems, setFoodItems, refreshFoodItems, loading }}
    >
      {children}
    </FoodItemsContext.Provider>
  );
};

const AdminPanel: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const { foodItems, refreshFoodItems } = React.useContext(FoodItemsContext);
  const [selectedItem, setSelectedItem] = useState<FoodItem | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [modelPreviewUrl, setModelPreviewUrl] = useState<string | null>(null);
  const [modelFile, setModelFile] = useState<File | null>(null);
  const modelViewerRef = React.useRef<HTMLElement | null>(null);
  const [modelViewerLoaded, setModelViewerLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [itemToDeleteId, setItemToDeleteId] = useState<string | number | null>(
    null
  );
  // State for AR Menu QR code modal
  const [showMenuQrModal, setShowMenuQrModal] = useState(false);
  const [menuQrCodeUrl, setMenuQrCodeUrl] = useState("");

  // Form state
  const [formData, setFormData] = useState<Partial<FoodItem>>({
    id: "",
    name: "",
    description: "",
    price: "",
    image: "",
    modelUrl: "",
    category: "",
    subcategory: "",
  });

  // Categories and subcategories (now managed in state)
  const [categories, setCategories] = useState<string[]>([
    "Starter",
    "Main Course",
    "Dessert",
  ]);
  const [subcategories, setSubcategories] = useState<{
    [key: string]: string[];
  }>({
    Starter: ["Salads", "Soups", "Breads", "Appetizers"],
    "Main Course": ["Pizza", "Pasta", "Burgers", "Curry", "Seafood", "Steak"],
    Dessert: ["Cakes", "Ice Cream", "Pastries", "Italian Desserts"],
  });

  // State for new category/subcategory input
  const [newCategoryName, setNewCategoryName] = useState("");
  const [newSubcategoryName, setNewSubcategoryName] = useState("");
  const [selectedCategoryForSub, setSelectedCategoryForSub] = useState("");

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

  // Handle login
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === "admin123") {
      setIsAuthenticated(true);
      setPassword("");
    } else {
      alert("Incorrect password. Please try again.");
    }
  };

  // Handle logout
  const handleLogout = () => {
    setIsAuthenticated(false);
    setSelectedItem(null);
    setIsEditing(false);
    setShowAddForm(false);
  };

  // Handle form input changes
  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  // Handle model file upload
  const handleModelUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];

      // Create a temporary URL for the uploaded file
      const objectUrl = URL.createObjectURL(file);
      setModelPreviewUrl(objectUrl);
      setModelFile(file);

      // Update form data with temporary URL
      setFormData({
        ...formData,
        modelUrl: objectUrl,
      });
    }
  };

  // Handle edit button click
  const handleEdit = (item: FoodItem) => {
    setSelectedItem(item);
    setFormData(item);
    setIsEditing(true);
    setShowAddForm(false);
    setModelPreviewUrl(item.modelUrl);
  };

  // Handle delete button click
  const handleDelete = (id: string | number) => {
    setItemToDeleteId(id);
    setShowDeleteModal(true);
  };

  // Handle confirmation of deletion from modal
  const confirmDelete = async () => {
    if (itemToDeleteId === null) return;

    setShowDeleteModal(false);
    setIsLoading(true);
    setError(null);

    try {
      await deleteMenuItem(itemToDeleteId);

      // Refresh the food items list from the backend
      await refreshFoodItems();

      if (selectedItem && selectedItem.id === itemToDeleteId) {
        setSelectedItem(null);
        setIsEditing(false);
      }
    } catch (err) {
      setError("Failed to delete item. Please try again.");
      console.error("Error deleting item:", err);
    } finally {
      setIsLoading(false);
      setItemToDeleteId(null);
    }
  };

  // Handle cancellation of deletion from modal
  const cancelDelete = () => {
    setShowDeleteModal(false);
    setItemToDeleteId(null);
  };

  // Handle add new item button click
  const handleAddNew = () => {
    // Reset all form-related states
    setSelectedItem(null);
    setIsEditing(false);
    setShowAddForm(true);
    setModelPreviewUrl(null);
    setModelFile(null);

    // Set default form values
    setFormData({
      id: "",
      name: "",
      description: "",
      price: "",
      image: "🍽️",
      modelUrl: "/models/food/placeholders/pizza.glb",
      category: "Main Course",
      subcategory: "Pizza",
    });

    // Force focus on the name input field to improve UX
    setTimeout(() => {
      const nameInput = document.querySelector('input[name="name"]');
      if (nameInput) {
        (nameInput as HTMLInputElement).focus();
      }
    }, 100);
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      if (isEditing && selectedItem) {
        // Update existing item
        await updateMenuItem(selectedItem.id, formData, modelFile || undefined);
      } else if (showAddForm) {
        // Add new item
        await addMenuItem(formData, modelFile || undefined);
      }

      // Refresh the food items list from the backend
      await refreshFoodItems();

      // Reset form and preview
      setFormData({
        id: "",
        name: "",
        description: "",
        price: "",
        image: "",
        modelUrl: "",
        category: "",
        subcategory: "",
      });
      setModelPreviewUrl(null);
      setModelFile(null);
      setSelectedItem(null);
      setIsEditing(false);
      setShowAddForm(false);

      alert("Operation successful!"); // Provide user feedback
    } catch (err) {
      setError("Operation failed. Please try again.");
      console.error("Error submitting form:", err);
      alert("Operation failed. See console for details."); // Provide user feedback
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setSelectedItem(null);
    setIsEditing(false);
    setShowAddForm(false);
    setModelPreviewUrl(null);
    setModelFile(null);
    setError(null); // Clear any previous errors
  };

  // Handle adding a new category
  const handleAddCategory = async () => {
    if (newCategoryName.trim() === "") {
      alert("Category name cannot be empty.");
      return;
    }
    // In a real application, you would call a backend API to add the category
    // For this example, we'll just update the local state
    setCategories([...categories, newCategoryName]);
    setNewCategoryName("");
  };

  // Handle adding a new subcategory
  const handleAddSubcategory = async () => {
    if (
      selectedCategoryForSub.trim() === "" ||
      newSubcategoryName.trim() === ""
    ) {
      alert("Please select a category and enter a subcategory name.");
      return;
    }
    // In a real application, you would call a backend API to add the subcategory
    // For this example, we'll just update the local state
    setSubcategories((prev) => ({
      ...prev,
      [selectedCategoryForSub]: [
        ...(prev[selectedCategoryForSub] || []),
        newSubcategoryName,
      ],
    }));
    setNewSubcategoryName("");
  };

  // Handle showing AR Menu QR code modal
  const handleShowMenuQrCode = () => {
    const menuUrl = `http://localhost:3000/ar-menu`;
    setMenuQrCodeUrl(menuUrl);
    setShowMenuQrModal(true);
  };

  // Handle closing AR Menu QR code modal
  const handleCloseMenuQrModal = () => {
    setShowMenuQrModal(false);
    setMenuQrCodeUrl("");
  };

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

  if (!isAuthenticated) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ backgroundColor: "var(--background-color)" }}
      >
        <div className="card p-8 rounded-lg shadow-md w-full max-w-sm">
          <h2
            className="text-2xl font-bold text-center mb-6"
            style={{ color: "var(--accent-color)" }}
          >
            Admin Login
          </h2>
          <form onSubmit={handleLogin}>
            <div className="mb-4">
              <label
                className="block text-sm font-bold mb-2"
                htmlFor="password"
                style={{ color: "var(--text-color)" }}
              >
                Password:
              </label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="shadow appearance-none border rounded w-full py-2 px-3 leading-tight focus:outline-none focus:shadow-outline"
                required
                style={{
                  backgroundColor: "var(--primary-color)",
                  color: "var(--text-color)",
                  border: "1px solid var(--border-color)",
                }}
              />
            </div>
            <div className="flex items-center justify-center">
              <button
                type="submit"
                className="btn"
                style={{
                  backgroundColor: "var(--accent-color)",
                  color: "var(--text-color)",
                }}
              >
                Login
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

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
          className="text-3xl font-bold mb-6 text-center"
          style={{ color: "var(--secondary-accent-color)" }}
        >
          Admin Panel
        </h1>

        <div className="flex flex-wrap justify-center sm:justify-between items-center gap-4 mb-6">
          <button
            onClick={handleAddNew}
            className="btn"
            style={{
              backgroundColor: "var(--accent-color)",
              color: "var(--text-color)",
            }}
          >
            Add New Food Item
          </button>
          <button
            onClick={handleShowMenuQrCode}
            className="btn"
            style={{
              backgroundColor: "var(--accent-color)",
              color: "var(--text-color)",
            }}
          >
            Show AR Menu QR Code
          </button>
          <button
            onClick={handleLogout}
            className="btn"
            style={{
              backgroundColor: "var(--primary-color)",
              color: "var(--text-color)",
              border: "1px solid var(--border-color)",
            }}
          >
            Logout
          </button>
        </div>

        {isLoading && (
          <div className="text-center text-accent-color mb-4">Loading...</div>
        )}
        {error && (
          <div className="text-center text-danger-color mb-4">
            Error: {error}
          </div>
        )}

        {/* Add/Edit Form */}
        {(showAddForm || isEditing) && (
          <div className="card mb-8">
            <h2
              className="text-2xl font-bold mb-4"
              style={{ color: "var(--accent-color)" }}
            >
              {isEditing ? "Edit Food Item" : "Add New Food Item"}
            </h2>
            <form onSubmit={handleSubmit}>
              {/* Form fields (similar styling to Home and Recommendations pages) */}
              <div className="mb-4">
                <label
                  className="block text-sm font-bold mb-2"
                  htmlFor="name"
                  style={{ color: "var(--text-color)" }}
                >
                  Name:
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name || ""}
                  onChange={handleInputChange}
                  required
                  style={{
                    backgroundColor: "var(--primary-color)",
                    color: "var(--text-color)",
                    border: "1px solid var(--border-color)",
                  }}
                />
              </div>
              <div className="mb-4">
                <label
                  className="block text-sm font-bold mb-2"
                  htmlFor="description"
                  style={{ color: "var(--text-color)" }}
                >
                  Description:
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description || ""}
                  onChange={handleInputChange}
                  required
                  style={{
                    backgroundColor: "var(--primary-color)",
                    color: "var(--text-color)",
                    border: "1px solid var(--border-color)",
                  }}
                />
              </div>
              <div className="mb-4">
                <label
                  className="block text-sm font-bold mb-2"
                  htmlFor="price"
                  style={{ color: "var(--text-color)" }}
                >
                  Price:
                </label>
                <input
                  type="text"
                  id="price"
                  name="price"
                  value={formData.price || ""}
                  onChange={handleInputChange}
                  required
                  style={{
                    backgroundColor: "var(--primary-color)",
                    color: "var(--text-color)",
                    border: "1px solid var(--border-color)",
                  }}
                />
              </div>
              <div className="mb-4">
                <label
                  className="block text-sm font-bold mb-2"
                  htmlFor="image"
                  style={{ color: "var(--text-color)" }}
                >
                  Image Emoji:
                </label>
                <input
                  type="text"
                  id="image"
                  name="image"
                  value={formData.image || ""}
                  onChange={handleInputChange}
                  style={{
                    backgroundColor: "var(--primary-color)",
                    color: "var(--text-color)",
                    border: "1px solid var(--border-color)",
                  }}
                />
              </div>
              <div className="mb-4">
                <label
                  className="block text-sm font-bold mb-2"
                  htmlFor="category"
                  style={{ color: "var(--text-color)" }}
                >
                  Category:
                </label>
                <select
                  id="category"
                  name="category"
                  value={formData.category || ""}
                  onChange={handleInputChange}
                  required
                  style={{
                    backgroundColor: "var(--primary-color)",
                    color: "var(--text-color)",
                    border: "1px solid var(--border-color)",
                  }}
                >
                  <option value="">Select Category</option>
                  {categories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>
              <div className="mb-4">
                <label
                  className="block text-sm font-bold mb-2"
                  htmlFor="subcategory"
                  style={{ color: "var(--text-color)" }}
                >
                  Subcategory:
                </label>
                <select
                  id="subcategory"
                  name="subcategory"
                  value={formData.subcategory || ""}
                  onChange={handleInputChange}
                  required
                  style={{
                    backgroundColor: "var(--primary-color)",
                    color: "var(--text-color)",
                    border: "1px solid var(--border-color)",
                  }}
                >
                  <option value="">Select Subcategory</option>
                  {formData.category &&
                    subcategories[formData.category]?.map((sub) => (
                      <option key={sub} value={sub}>
                        {sub}
                      </option>
                    ))}
                </select>
              </div>
              <div className="mb-4">
                <label
                  className="block text-sm font-bold mb-2"
                  htmlFor="modelFile"
                  style={{ color: "var(--text-color)" }}
                >
                  3D Model File (.glb, .gltf):
                </label>
                <input
                  type="file"
                  id="modelFile"
                  name="modelFile"
                  accept=".glb,.gltf"
                  onChange={handleModelUpload}
                  style={{ color: "var(--text-color)" }}
                />
                {modelPreviewUrl && modelViewerLoaded && (
                  <div className="mt-4 w-full" style={{ height: "300px" }}>
                    <model-viewer
                      ref={modelViewerRef}
                      src={modelPreviewUrl}
                      alt="3D model preview"
                      auto-rotate
                      camera-controls
                      style={{ width: "100%", height: "100%" }}
                    ></model-viewer>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-end gap-4">
                <button
                  type="button"
                  onClick={handleCancel}
                  className="btn"
                  style={{
                    backgroundColor: "var(--primary-color)",
                    color: "var(--text-color)",
                    border: "1px solid var(--border-color)",
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn"
                  style={{
                    backgroundColor: "var(--accent-color)",
                    color: "var(--text-color)",
                  }}
                  disabled={isLoading}
                >
                  {isEditing ? "Update Item" : "Add Item"}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Category and Subcategory Management */}
        <div className="card mb-8">
          <h2
            className="text-2xl font-bold mb-4"
            style={{ color: "var(--accent-color)" }}
          >
            Manage Categories & Subcategories
          </h2>
          <div className="mb-4">
            <h3
              className="text-xl font-semibold mb-2"
              style={{ color: "var(--text-color)" }}
            >
              Add New Category
            </h3>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="New Category Name"
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                className="flex-grow"
                style={{
                  backgroundColor: "var(--primary-color)",
                  color: "var(--text-color)",
                  border: "1px solid var(--border-color)",
                }}
              />
              <button
                onClick={handleAddCategory}
                className="btn"
                style={{
                  backgroundColor: "var(--accent-color)",
                  color: "var(--text-color)",
                }}
              >
                Add Category
              </button>
            </div>
          </div>
          <div className="mb-4">
            <h3
              className="text-xl font-semibold mb-2"
              style={{ color: "var(--text-color)" }}
            >
              Add New Subcategory
            </h3>
            <div className="flex flex-col sm:flex-row gap-2">
              <select
                value={selectedCategoryForSub}
                onChange={(e) => setSelectedCategoryForSub(e.target.value)}
                className="flex-grow sm:flex-grow-0"
                style={{
                  backgroundColor: "var(--primary-color)",
                  color: "var(--text-color)",
                  border: "1px solid var(--border-color)",
                }}
              >
                <option value="">Select Category</option>
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
              <input
                type="text"
                placeholder="New Subcategory Name"
                value={newSubcategoryName}
                onChange={(e) => setNewSubcategoryName(e.target.value)}
                className="flex-grow"
                style={{
                  backgroundColor: "var(--primary-color)",
                  color: "var(--text-color)",
                  border: "1px solid var(--border-color)",
                }}
              />
              <button
                onClick={handleAddSubcategory}
                className="btn"
                style={{
                  backgroundColor: "var(--accent-color)",
                  color: "var(--text-color)",
                }}
              >
                Add Subcategory
              </button>
            </div>
          </div>
        </div>

        {/* Food Items List */}
        <div className="card">
          <h2
            className="text-2xl font-bold mb-4"
            style={{ color: "var(--secondary-accent-color)" }}
          >
            Existing Food Items
          </h2>
          {foodItems.length > 0 ? (
            <ul className="space-y-4">
              {foodItems.map((item) => (
                <li
                  key={item.id}
                  className="border-b pb-4 last:pb-0 last:border-b-0"
                  style={{ borderColor: "var(--border-color)" }}
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <h3
                        className="text-xl font-semibold"
                        style={{ color: "var(--text-color)" }}
                      >
                        {capitalize(item.name)}
                      </h3>
                      <p
                        className="text-sm"
                        style={{ color: "var(--text-color)" }}
                      >
                        {item.category}{" "}
                        {item.subcategory && `(${item.subcategory})`}
                      </p>
                      <p
                        className="font-bold"
                        style={{ color: "var(--accent-color)" }}
                      >
                        {formatPrice(item.price)}
                      </p>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleEdit(item)}
                        className="btn py-1 px-3 text-sm"
                        style={{
                          backgroundColor: "var(--primary-color)",
                          color: "var(--text-color)",
                          border: "1px solid var(--border-color)",
                        }}
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="btn py-1 px-3 text-sm"
                        style={{
                          backgroundColor: "var(--danger-color)",
                          color: "var(--text-color)",
                        }}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-center" style={{ color: "var(--text-color)" }}>
              No food items added yet.
            </p>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="card p-6 rounded-lg shadow-xl">
            <h3
              className="text-xl font-bold mb-4"
              style={{ color: "var(--accent-color)" }}
            >
              Confirm Deletion
            </h3>
            <p className="mb-6" style={{ color: "var(--text-color)" }}>
              Are you sure you want to delete this item?
            </p>
            <div className="flex justify-end gap-4">
              <button
                onClick={cancelDelete}
                className="btn"
                style={{
                  backgroundColor: "var(--primary-color)",
                  color: "var(--text-color)",
                  border: "1px solid var(--border-color)",
                }}
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="btn"
                style={{
                  backgroundColor: "var(--danger-color)",
                  color: "var(--text-color)",
                }}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* AR Menu QR Code Modal */}
      {showMenuQrModal && menuQrCodeUrl && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="card p-6 rounded-lg shadow-xl flex flex-col items-center">
            <h3
              className="text-xl font-bold mb-4"
              style={{ color: "var(--accent-color)" }}
            >
              QR Code for AR Menu
            </h3>
            <div className="bg-white p-2 rounded-md mb-4">
              <QRCodeSVG value={menuQrCodeUrl} size={256} level="H" />
            </div>
            <p className="text-sm text-center text-gray-600 mb-4">
              Scan the QR code above to open the AR Menu on your device.
              <br />
              If using a phone on the same local network, you might need to
              replace
              <strong>localhost</strong> with your computer's local IP address
              in the URL below:
              <br />
              <span className="text-xs break-all">{menuQrCodeUrl}</span>
            </p>
            <button
              onClick={handleCloseMenuQrModal}
              className="btn"
              style={{
                backgroundColor: "var(--primary-color)",
                color: "var(--text-color)",
                border: "1px solid var(--border-color)",
              }}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPanel;
