import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

interface FoodItem {
  id: number;
  name: string;
  description: string;
  price: string;
  modelUrl: string;
  markerId: number;
  category?: string;
  popularity?: number;
  tags?: string[];
}

interface UserPreference {
  category?: string;
  priceRange?: string;
  dietaryPreferences?: string[];
  previousOrders?: number[];
}

const AIRecommendationEngine: React.FC = () => {
  const [foodItems, setFoodItems] = useState<FoodItem[]>([]);
  const [userPreferences, setUserPreferences] = useState<UserPreference>({});
  const [recommendations, setRecommendations] = useState<FoodItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [dietaryPreferences, setDietaryPreferences] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  useEffect(() => {
    // Load food items from localStorage if available
    const savedItems = localStorage.getItem('foodItems');
    if (savedItems) {
      const items = JSON.parse(savedItems);
      // Add random popularity for demo purposes
      const itemsWithPopularity = items.map((item: FoodItem) => ({
        ...item,
        popularity: Math.floor(Math.random() * 100),
        tags: generateRandomTags(item)
      }));
      setFoodItems(itemsWithPopularity);
    } else {
      // Sample initial data with popularity and tags
      const initialItems: FoodItem[] = [
        {
          id: 1,
          name: "Margherita Pizza",
          description: "Classic pizza with tomato sauce, mozzarella, and fresh basil",
          price: "$12.99",
          modelUrl: "https://models.readyplayer.me/64fa0e8d7c2cbd23d77999d9.glb",
          markerId: 0,
          category: "Main Course",
          popularity: 85,
          tags: ["vegetarian", "italian", "cheese", "tomato"]
        },
        {
          id: 2,
          name: "Chocolate Cake",
          description: "Rich chocolate cake with ganache frosting",
          price: "$8.99",
          modelUrl: "https://models.readyplayer.me/64fa0e8d7c2cbd23d77999d9.glb",
          markerId: 1,
          category: "Dessert",
          popularity: 92,
          tags: ["sweet", "chocolate", "dessert"]
        },
        {
          id: 3,
          name: "Caesar Salad",
          description: "Fresh romaine lettuce with Caesar dressing, croutons, and parmesan",
          price: "$9.99",
          modelUrl: "https://models.readyplayer.me/64fa0e8d7c2cbd23d77999d9.glb",
          markerId: 2,
          category: "Starter",
          popularity: 78,
          tags: ["healthy", "salad", "cheese"]
        },
        {
          id: 4,
          name: "Beef Burger",
          description: "Juicy beef patty with lettuce, tomato, cheese, and special sauce",
          price: "$14.99",
          modelUrl: "https://models.readyplayer.me/64fa0e8d7c2cbd23d77999d9.glb",
          markerId: 3,
          category: "Main Course",
          popularity: 88,
          tags: ["meat", "burger", "american"]
        },
        {
          id: 5,
          name: "Vegetable Curry",
          description: "Mixed vegetables in a rich curry sauce with basmati rice",
          price: "$13.99",
          modelUrl: "https://models.readyplayer.me/64fa0e8d7c2cbd23d77999d9.glb",
          markerId: 4,
          category: "Main Course",
          popularity: 75,
          tags: ["vegetarian", "spicy", "curry", "indian"]
        }
      ];
      setFoodItems(initialItems);
      localStorage.setItem('foodItems', JSON.stringify(initialItems));
    }
    
    // Simulate loading delay
    setTimeout(() => {
      setLoading(false);
    }, 1000);
    
    // Load user preferences from localStorage if available
    const savedPreferences = localStorage.getItem('userPreferences');
    if (savedPreferences) {
      setUserPreferences(JSON.parse(savedPreferences));
    }
  }, []);

  // Generate random tags for demo purposes
  const generateRandomTags = (item: FoodItem): string[] => {
    const allTags = [
      "vegetarian", "vegan", "gluten-free", "dairy-free", "spicy", 
      "sweet", "savory", "healthy", "indulgent", "fresh", 
      "italian", "mexican", "asian", "american", "indian"
    ];
    
    // Generate 2-4 random tags
    const numTags = Math.floor(Math.random() * 3) + 2;
    const tags: string[] = [];
    
    // Add category-specific tags
    if (item.category === "Dessert") {
      tags.push("sweet");
    } else if (item.category === "Starter") {
      tags.push("appetizer");
    }
    
    // Add random tags
    while (tags.length < numTags) {
      const randomTag = allTags[Math.floor(Math.random() * allTags.length)];
      if (!tags.includes(randomTag)) {
        tags.push(randomTag);
      }
    }
    
    return tags;
  };

  // Update user preferences
  const updateUserPreferences = (newPreferences: Partial<UserPreference>) => {
    const updatedPreferences = { ...userPreferences, ...newPreferences };
    setUserPreferences(updatedPreferences);
    localStorage.setItem('userPreferences', JSON.stringify(updatedPreferences));
    
    // Generate new recommendations based on updated preferences
    generateRecommendations(updatedPreferences);
  };

  // Toggle dietary preference
  const toggleDietaryPreference = (preference: string) => {
    const currentPreferences = dietaryPreferences.includes(preference)
      ? dietaryPreferences.filter(p => p !== preference)
      : [...dietaryPreferences, preference];
    
    setDietaryPreferences(currentPreferences);
    updateUserPreferences({ dietaryPreferences: currentPreferences });
  };

  // Handle category change
  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
    if (category !== 'all') {
      updateUserPreferences({ category });
    } else {
      const { category, ...rest } = userPreferences;
      setUserPreferences(rest);
      localStorage.setItem('userPreferences', JSON.stringify(rest));
      generateRecommendations(rest);
    }
  };

  // Handle price range change
  const handlePriceRangeChange = (range: string) => {
    setPriceRange(range);
    updateUserPreferences({ priceRange: range });
  };

  // AI recommendation algorithm
  const generateRecommendations = (preferences: UserPreference) => {
    // Start with all food items
    let recommendedItems = [...foodItems];
    
    // Filter by category if specified
    if (preferences.category && preferences.category !== 'all') {
      recommendedItems = recommendedItems.filter(item => item.category === preferences.category);
    }
    
    // Filter by dietary preferences if specified
    if (preferences.dietaryPreferences && preferences.dietaryPreferences.length > 0) {
      recommendedItems = recommendedItems.filter(item => {
        // Check if item has all required dietary tags
        return preferences.dietaryPreferences!.every(pref => 
          item.tags && item.tags.some(tag => tag.toLowerCase().includes(pref.toLowerCase()))
        );
      });
    }
    
    // Filter by price range if specified
    if (preferences.priceRange && preferences.priceRange !== 'all') {
      recommendedItems = recommendedItems.filter(item => {
        const price = parseFloat(item.price.replace('$', ''));
        switch (preferences.priceRange) {
          case 'low':
            return price < 10;
          case 'medium':
            return price >= 10 && price < 15;
          case 'high':
            return price >= 15;
          default:
            return true;
        }
      });
    }
    
    // Sort by popularity and relevance
    recommendedItems.sort((a, b) => {
      // Prioritize previously ordered items
      const aOrdered = preferences.previousOrders?.includes(a.id) ? 1 : 0;
      const bOrdered = preferences.previousOrders?.includes(b.id) ? 1 : 0;
      
      if (aOrdered !== bOrdered) {
        return bOrdered - aOrdered;
      }
      
      // Then sort by popularity
      return (b.popularity || 0) - (a.popularity || 0);
    });
    
    // Take top 3 recommendations
    setRecommendations(recommendedItems.slice(0, 3));
  };

  // Simulate ordering an item
  const handleOrderItem = (itemId: number) => {
    const previousOrders = userPreferences.previousOrders || [];
    if (!previousOrders.includes(itemId)) {
      const updatedOrders = [...previousOrders, itemId];
      updateUserPreferences({ previousOrders: updatedOrders });
    }
    
    // Update item popularity
    const updatedItems = foodItems.map(item => {
      if (item.id === itemId) {
        return { ...item, popularity: (item.popularity || 0) + 1 };
      }
      return item;
    });
    
    setFoodItems(updatedItems);
    localStorage.setItem('foodItems', JSON.stringify(updatedItems));
    
    alert(`Item added to your order! In a real app, this would be added to a cart.`);
  };

  return (
    <div className="min-h-screen bg-amber-50">
      <div className="container mx-auto px-4 py-8">
        <header className="flex justify-between items-center mb-8">
          <Link to="/" className="text-amber-800 hover:text-amber-600">
            ← Back to Home
          </Link>
          <h1 className="text-3xl font-bold text-amber-800">AI Food Recommendations</h1>
          <div></div> {/* Empty div for flex spacing */}
        </header>

        <div className="max-w-4xl mx-auto">
          {loading ? (
            <div className="flex flex-col items-center justify-center h-64">
              <div className="w-16 h-16 border-4 border-amber-600 border-t-transparent rounded-full animate-spin mb-4"></div>
              <p className="text-amber-800">Loading recommendations...</p>
            </div>
          ) : (
            <>
              <div className="bg-white rounded-lg shadow-md p-6 mb-8">
                <h2 className="text-2xl font-semibold text-amber-800 mb-4">Your Preferences</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Category Selection */}
                  <div>
                    <label className="block text-gray-700 mb-2">Category</label>
                    <select
                      value={selectedCategory}
                      onChange={(e) => handleCategoryChange(e.target.value)}
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                    >
                      <option value="all">All Categories</option>
                      <option value="Starter">Starters</option>
                      <option value="Main Course">Main Courses</option>
                      <option value="Dessert">Desserts</option>
                      <option value="Beverage">Beverages</option>
                    </select>
                  </div>
                  
                  {/* Price Range */}
                  <div>
                    <label className="block text-gray-700 mb-2">Price Range</label>
                    <select
                      value={priceRange}
                      onChange={(e) => handlePriceRangeChange(e.target.value)}
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                    >
                      <option value="all">All Prices</option>
                      <option value="low">$ (Under $10)</option>
                      <option value="medium">$$ ($10-$15)</option>
                      <option value="high">$$$ (Over $15)</option>
                    </select>
                  </div>
                  
                  {/* Dietary Preferences */}
                  <div>
                    <label className="block text-gray-700 mb-2">Dietary Preferences</label>
                    <div className="flex flex-wrap gap-2">
                      {['vegetarian', 'vegan', 'gluten-free', 'spicy'].map(pref => (
                        <button
                          key={pref}
                          onClick={() => toggleDietaryPreference(pref)}
                          className={`px-3 py-1 rounded-full text-sm ${
                            dietaryPreferences.includes(pref)
                              ? 'bg-amber-600 text-white'
                              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                          }`}
                        >
                          {pref}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
              
              <h2 className="text-2xl font-semibold text-amber-800 mb-4">Recommended for You</h2>
              
              {recommendations.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                  {recommendations.map(item => (
                    <div key={item.id} className="bg-white rounded-lg shadow-md overflow-hidden">
                      <div className="h-48 bg-amber-200 flex items-center justify-center">
                        <div className="text-6xl">{item.category === 'Dessert' ? '🍰' : item.category === 'Starter' ? '🥗' : '🍽️'}</div>
                      </div>
                      <div className="p-4">
                        <h3 className="text-lg font-semibold text-amber-800">{item.name}</h3>
                        <p className="text-gray-600 text-sm mb-2">{item.description}</p>
                        <div className="flex justify-between items-center">
                          <span className="font-bold text-amber-600">{item.price}</span>
                          <button
                            onClick={() => handleOrderItem(item.id)}
                            className="bg-amber-600 hover:bg-amber-700 text-white px-3 py-1 rounded-lg text-sm"
                          >
                            Order Now
                          </button>
                        </div>
                        <div className="mt-2 flex flex-wrap gap-1">
                          {item.tags?.map(tag => (
                            <span key={tag} className="bg-amber-100 text-amber-800 text-xs px-2 py-1 rounded-full">
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-white rounded-lg shadow-md p-6 text-center">
                  <p className="text-gray-600">
                    No recommendations match your current preferences. Try adjusting your filters.
                  </p>
                </div>
              )}
              
              <h2 className="text-2xl font-semibold text-amber-800 mb-4">Popular Items</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {foodItems
                  .sort((a, b) => (b.popularity || 0) - (a.popularity || 0))
                  .slice(0, 3)
                  .map(item => (
                    <div key={item.id} className="bg-white rounded-lg shadow-md overflow-hidden">
                      <div className="h-48 bg-gray-200 flex items-center justify-center">
                        <div className="text-6xl">{item.category === 'Dessert' ? '🍰' : item.category === 'Starter' ? '🥗' : '🍽️'}</div>
                      </div>
                      <div className="p-4">
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="text-lg font-semibold text-amber-800">{item.name}</h3>
                          <span className="bg-amber-100 text-amber-800 text-xs px-2 py-1 rounded-full">
                            {item.popularity}% popular
                          </span>
                        </div>
                        <p className="text-gray-600 text-sm mb-2">{item.description}</p>
                        <div className="flex justify-between items-center">
                          <span className="font-bold text-amber-600">{item.price}</span>
                          <button
                            onClick={() => handleOrderItem(item.id)}
                            className="bg-amber-600 hover:bg-amber-700 text-white px-3 py-1 rounded-lg text-sm"
                          >
                            Order Now
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default AIRecommendationEngine;
