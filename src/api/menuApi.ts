// API service for menu operations
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export interface FoodItem {
  id: string | number;
  name: string;
  description: string;
  price: string;
  image: string;
  modelUrl: string;
  category: string;
  subcategory: string;
  imageUrl?: string;
}

// Get all menu items
export const getMenuItems = async (): Promise<FoodItem[]> => {
  try {
    const response = await fetch(`${API_URL}/menu`);
    if (!response.ok) {
      throw new Error("Failed to fetch menu items");
    }
    return await response.json();
  } catch (error) {
    console.error("Error fetching menu items:", error);
    // Fallback to localStorage if API fails
    const storedItems = localStorage.getItem("foodItems");
    return storedItems ? JSON.parse(storedItems) : [];
  }
};

// Add a new menu item
export const addMenuItem = async (
  item: Partial<FoodItem>,
  modelFile?: File
): Promise<FoodItem> => {
  try {
    const formData = new FormData();

    // Add all item properties to form data
    Object.entries(item).forEach(([key, value]) => {
      formData.append(key, value?.toString() || "");
    });

    // Add model file if provided
    if (modelFile) {
      formData.append("modelFile", modelFile);
    }

    const response = await fetch(`${API_URL}/menu`, {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      throw new Error("Failed to add menu item");
    }

    const result = await response.json();
    return result.item;
  } catch (error) {
    console.error("Error adding menu item:", error);
    throw error;
  }
};

// Update an existing menu item
export const updateMenuItem = async (
  id: string | number,
  item: Partial<FoodItem>,
  modelFile?: File
): Promise<FoodItem> => {
  try {
    const formData = new FormData();

    // Add all item properties to form data
    Object.entries(item).forEach(([key, value]) => {
      formData.append(key, value?.toString() || "");
    });

    // Add model file if provided
    if (modelFile) {
      formData.append("modelFile", modelFile);
    }

    const response = await fetch(`${API_URL}/menu/${id}`, {
      method: "PUT",
      body: formData,
    });

    if (!response.ok) {
      throw new Error("Failed to update menu item");
    }

    const result = await response.json();
    return result.item;
  } catch (error) {
    console.error("Error updating menu item:", error);
    throw error;
  }
};

// Delete a menu item
export const deleteMenuItem = async (id: string | number): Promise<void> => {
  try {
    const response = await fetch(`${API_URL}/menu/${id}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      throw new Error("Failed to delete menu item");
    }
  } catch (error) {
    console.error("Error deleting menu item:", error);
    throw error;
  }
};

// Upload a file (image or 3D model)
export const uploadFile = async (file: File): Promise<string> => {
  try {
    const formData = new FormData();
    formData.append("file", file);

    const response = await fetch(`${API_URL}/upload`, {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      throw new Error("Failed to upload file");
    }

    const result = await response.json();
    return result.url;
  } catch (error) {
    console.error("Error uploading file:", error);
    throw error;
  }
};

// Fetch all categories
export const getCategories = async (): Promise<string[]> => {
  const response = await fetch(`${API_URL}/categories`);
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  const data = await response.json();
  return data;
};

// Add a new category
export const addCategory = async (categoryName: string): Promise<string> => {
  const response = await fetch(`${API_URL}/categories`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ name: categoryName }),
  });
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  const data = await response.json();
  return data.category; // Assuming the backend returns the added category name
};

// Delete a category
export const deleteCategory = async (categoryName: string): Promise<void> => {
  const response = await fetch(
    `${API_URL}/categories/${encodeURIComponent(categoryName)}`,
    {
      method: "DELETE",
    }
  );
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  // Assuming backend returns success status, no need to process body for this example
};

// Fetch all subcategories
export const getSubcategories = async (): Promise<{
  [key: string]: string[];
}> => {
  const response = await fetch(`${API_URL}/subcategories`);
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  const data = await response.json();
  return data; // Assuming backend returns an object like { category: [subcategory1, subcategory2] }
};

// Add a new subcategory
export const addSubcategory = async (
  categoryName: string,
  subcategoryName: string
): Promise<string> => {
  const response = await fetch(`${API_URL}/subcategories`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ category: categoryName, name: subcategoryName }),
  });
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  const data = await response.json();
  return data.subcategory; // Assuming backend returns the added subcategory name
};

// Delete a subcategory
export const deleteSubcategory = async (
  categoryName: string,
  subcategoryName: string
): Promise<void> => {
  const response = await fetch(
    `${API_URL}/subcategories/${encodeURIComponent(
      categoryName
    )}/${encodeURIComponent(subcategoryName)}`,
    {
      method: "DELETE",
    }
  );
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  // Assuming backend returns success status
};
