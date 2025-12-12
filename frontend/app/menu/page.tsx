"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "../context/authContext";
import axiosInstance from "../utils/ApiClient";

interface MenuItem {
  _id: string;
  name: string;
  description: string;
  category: string;
  price: number;
  image?: string;
  available: boolean;
  preparationTime?: number;
  allergens?: string[];
  tags?: string[];
  isPopular?: boolean;
}

export default function MenuPage() {
  const { user } = useAuth();
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [filteredItems, setFilteredItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

  const categories = [
    { value: "all", label: "All Items" },
    { value: "appetizer", label: "Appetizers" },
    { value: "main", label: "Main Course" },
    { value: "dessert", label: "Desserts" },
    { value: "beverage", label: "Beverages" },
    { value: "special", label: "Specials" },
  ];

  useEffect(() => {
    fetchMenuItems();
  }, []);

  useEffect(() => {
    filterMenuItems();
  }, [selectedCategory, searchQuery, menuItems]);

  const fetchMenuItems = async () => {
    try {
      const response = await axiosInstance.get("/menu");
      setMenuItems(response.data);
      setFilteredItems(response.data);
    } catch (error) {
      console.error("Failed to fetch menu items:", error);
    } finally {
      setLoading(false);
    }
  };

  const filterMenuItems = () => {
    let filtered = menuItems;

    if (selectedCategory !== "all") {
      filtered = filtered.filter(item => item.category === selectedCategory);
    }

    if (searchQuery) {
      filtered = filtered.filter(item =>
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredItems(filtered);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <Link href="/" className="text-orange-600 hover:text-orange-700">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
              </Link>
              <h1 className="text-2xl font-bold text-gray-900">Our Menu</h1>
            </div>
            {user && (
              <Link
                href="/dashboard"
                className="px-4 py-2 text-gray-700 hover:text-orange-600 font-medium"
              >
                Dashboard
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* Search and Filter Bar */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <input
                type="text"
                placeholder="Search menu items..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>

            {/* Category Filter */}
            <div className="flex gap-2 overflow-x-auto">
              {categories.map((category) => (
                <button
                  key={category.value}
                  onClick={() => setSelectedCategory(category.value)}
                  className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-colors ${
                    selectedCategory === category.value
                      ? "bg-orange-600 text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  {category.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Menu Items */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
            <p className="mt-4 text-gray-600">Loading menu...</p>
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="text-center py-12">
            <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-gray-600">No menu items found</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredItems.map((item) => (
              <div
                key={item._id}
                className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
              >
                {/* Item Image Placeholder */}
                <div className="h-48 bg-gradient-to-br from-orange-100 to-orange-200 flex items-center justify-center">
                  {item.image ? (
                    <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                  ) : (
                    <svg className="w-16 h-16 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                  )}
                </div>

                <div className="p-6">
                  {/* Tags */}
                  <div className="flex gap-2 mb-2">
                    {item.isPopular && (
                      <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs font-medium rounded">
                        Popular
                      </span>
                    )}
                    {!item.available && (
                      <span className="px-2 py-1 bg-red-100 text-red-800 text-xs font-medium rounded">
                        Unavailable
                      </span>
                    )}
                    <span className="px-2 py-1 bg-gray-100 text-gray-800 text-xs font-medium rounded capitalize">
                      {item.category}
                    </span>
                  </div>

                  {/* Item Name & Price */}
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-lg font-bold text-gray-900">{item.name}</h3>
                    <span className="text-lg font-bold text-orange-600">${item.price.toFixed(2)}</span>
                  </div>

                  {/* Description */}
                  <p className="text-gray-600 text-sm mb-4">{item.description}</p>

                  {/* Meta Info */}
                  <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
                    {item.preparationTime && (
                      <div className="flex items-center gap-1">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span>{item.preparationTime} min</span>
                      </div>
                    )}
                  </div>

                  {/* Allergens */}
                  {item.allergens && item.allergens.length > 0 && (
                    <div className="text-xs text-gray-500 mb-4">
                      <span className="font-medium">Allergens:</span> {item.allergens.join(", ")}
                    </div>
                  )}

                  {/* Action Button */}
                  {item.available && (
                    <button className="block w-full text-center px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors font-medium">
                      Add to Pre-Order
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
