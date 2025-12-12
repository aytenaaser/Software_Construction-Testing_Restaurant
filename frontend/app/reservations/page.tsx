"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "../context/authContext";
import { ProtectedRoute } from "../context/protectedRoute";
import axiosInstance from "../utils/ApiClient";

interface Reservation {
  _id: string;
  date: string;
  time: string;
  partySize: number;
  status: string;
  specialRequests?: string;
  tableId?: {
    _id: string;
    tableNumber: number;
    capacity: number;
  };
  userId?: {
    _id: string;
    name: string;
    email: string;
  };
}

export default function ReservationsPage() {
  const { user } = useAuth();
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("all");

  useEffect(() => {
    fetchReservations();
  }, []);

  const fetchReservations = async () => {
    try {
      const endpoint = user?.role === "customer" 
        ? "/reservations/my-reservations"
        : "/reservations";
      const response = await axiosInstance.get(endpoint);
      setReservations(response.data);
    } catch (error) {
      console.error("Failed to fetch reservations:", error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      case "rejected":
        return "bg-red-100 text-red-800";
      case "completed":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const filteredReservations = reservations.filter(reservation => {
    if (filter === "all") return true;
    return reservation.status === filter;
  });

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white shadow">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-4">
                <Link href="/dashboard" className="text-orange-600 hover:text-orange-700">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                  </svg>
                </Link>
                <h1 className="text-2xl font-bold text-gray-900">My Reservations</h1>
              </div>
              <Link
                href="/reservations/new"
                className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors font-medium"
              >
                New Reservation
              </Link>
            </div>
          </div>
        </header>

        {/* Filter Bar */}
        <div className="bg-white border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex gap-2 overflow-x-auto">
              {["all", "pending", "confirmed", "cancelled", "completed"].map((status) => (
                <button
                  key={status}
                  onClick={() => setFilter(status)}
                  className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-colors capitalize ${
                    filter === status
                      ? "bg-orange-600 text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  {status}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Reservations List */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
              <p className="mt-4 text-gray-600">Loading reservations...</p>
            </div>
          ) : filteredReservations.length === 0 ? (
            <div className="text-center py-12">
              <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <p className="text-gray-600 mb-4">No reservations found</p>
              <Link
                href="/reservations/new"
                className="inline-block px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors font-medium"
              >
                Create Your First Reservation
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredReservations.map((reservation) => (
                <div
                  key={reservation._id}
                  className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
                >
                  <div className="p-6">
                    {/* Status Badge */}
                    <div className="flex justify-between items-start mb-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${getStatusColor(reservation.status)}`}>
                        {reservation.status}
                      </span>
                      {reservation.tableId && (
                        <span className="text-sm text-gray-600">
                          Table #{reservation.tableId.tableNumber}
                        </span>
                      )}
                    </div>

                    {/* Date and Time */}
                    <div className="mb-4">
                      <div className="flex items-center gap-2 text-gray-700 mb-2">
                        <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <span className="font-medium">
                          {new Date(reservation.date).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-700">
                        <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span className="font-medium">{reservation.time}</span>
                      </div>
                    </div>

                    {/* Party Size */}
                    <div className="flex items-center gap-2 text-gray-700 mb-4">
                      <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                      <span>{reservation.partySize} guests</span>
                    </div>

                    {/* Special Requests */}
                    {reservation.specialRequests && (
                      <div className="text-sm text-gray-600 mb-4">
                        <p className="font-medium">Special Requests:</p>
                        <p className="mt-1">{reservation.specialRequests}</p>
                      </div>
                    )}

                    {/* User Info (for admin/staff) */}
                    {user?.role !== "customer" && reservation.userId && (
                      <div className="text-sm text-gray-600 mb-4 border-t pt-4">
                        <p className="font-medium">{reservation.userId.name}</p>
                        <p className="text-xs">{reservation.userId.email}</p>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex gap-2">
                      <Link
                        href={`/reservations/${reservation._id}`}
                        className="flex-1 text-center px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors font-medium"
                      >
                        View Details
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>
    </ProtectedRoute>
  );
}
