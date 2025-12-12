"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "../../context/authContext";
import { ProtectedRoute } from "../../context/protectedRoute";
import axiosInstance from "../../utils/ApiClient";

interface Table {
  _id: string;
  tableNumber: number;
  capacity: number;
  location: string;
  status?: string;
}

export default function StaffTablesPage() {
  const { user } = useAuth();
  const [tables, setTables] = useState<Table[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.role === "staff") {
      fetchTables();
    }
  }, [user]);

  const fetchTables = async () => {
    try {
      const response = await axiosInstance.get("/tables");
      setTables(response.data);
    } catch (error) {
      console.error("Failed to fetch tables:", error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status?: string) => {
    switch (status) {
      case "available":
        return "bg-green-100 text-green-800";
      case "reserved":
        return "bg-yellow-100 text-yellow-800";
      case "occupied":
        return "bg-red-100 text-red-800";
      case "unavailable":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-blue-100 text-blue-800";
    }
  };

  if (user?.role !== "staff") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-red-600">Access denied. Staff only.</p>
      </div>
    );
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white shadow">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center gap-4">
              <Link href="/staff" className="text-orange-600 hover:text-orange-700">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
              </Link>
              <h1 className="text-2xl font-bold text-gray-900">Table Management</h1>
            </div>
          </div>
        </header>

        {/* Tables Grid */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
              <p className="mt-4 text-gray-600">Loading tables...</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {tables.map((table) => (
                <div
                  key={table._id}
                  className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
                >
                  {/* Table Number */}
                  <div className="text-center mb-4">
                    <div className="w-20 h-20 mx-auto bg-gradient-to-br from-orange-100 to-orange-200 rounded-full flex items-center justify-center mb-2">
                      <span className="text-2xl font-bold text-orange-800">
                        {table.tableNumber}
                      </span>
                    </div>
                    <h3 className="text-sm font-medium text-gray-700">
                      Table #{table.tableNumber}
                    </h3>
                  </div>

                  {/* Table Info */}
                  <div className="space-y-2 text-sm text-gray-600 mb-4">
                    <div className="flex items-center justify-center gap-1">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                      <span>{table.capacity} seats</span>
                    </div>
                    <div className="flex items-center justify-center gap-1">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      <span>{table.location}</span>
                    </div>
                  </div>

                  {/* Status Badge */}
                  {table.status && (
                    <div className="text-center">
                      <span className={`inline-block px-3 py-1 text-xs font-medium rounded capitalize ${getStatusColor(table.status)}`}>
                        {table.status}
                      </span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Legend */}
          <div className="mt-8 bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Status Legend</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 text-xs font-medium bg-green-100 text-green-800 rounded">
                  Available
                </span>
                <span className="text-sm text-gray-600">Ready for booking</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 text-xs font-medium bg-yellow-100 text-yellow-800 rounded">
                  Reserved
                </span>
                <span className="text-sm text-gray-600">Booking confirmed</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 text-xs font-medium bg-red-100 text-red-800 rounded">
                  Occupied
                </span>
                <span className="text-sm text-gray-600">Currently in use</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded">
                  Unavailable
                </span>
                <span className="text-sm text-gray-600">Out of service</span>
              </div>
            </div>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}
