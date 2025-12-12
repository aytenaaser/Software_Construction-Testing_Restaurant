"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "../../context/authContext";
import { ProtectedRoute } from "../../context/protectedRoute";
import axiosInstance from "../../utils/ApiClient";

interface FeedbackStats {
  totalFeedback: number;
  averageRating: number;
  averageFoodQuality: number;
  averageServiceQuality: number;
  averageAmbience: number;
  averageValueForMoney: number;
  recommendationRate: number;
}

export default function AdminAnalyticsPage() {
  const { user } = useAuth();
  const [feedbackStats, setFeedbackStats] = useState<FeedbackStats | null>(null);
  const [reservationCount, setReservationCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.role === "admin") {
      fetchAnalytics();
    }
  }, [user]);

  const fetchAnalytics = async () => {
    try {
      const [feedbackResponse, reservationsResponse] = await Promise.all([
        axiosInstance.get("/feedback/stats"),
        axiosInstance.get("/reservations"),
      ]);
      
      setFeedbackStats(feedbackResponse.data);
      setReservationCount(reservationsResponse.data.length);
    } catch (error) {
      console.error("Failed to fetch analytics:", error);
    } finally {
      setLoading(false);
    }
  };

  if (user?.role !== "admin") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-red-600">Access denied. Admin only.</p>
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
              <Link href="/admin" className="text-orange-600 hover:text-orange-700">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
              </Link>
              <h1 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h1>
            </div>
          </div>
        </header>

        {/* Analytics */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
              <p className="mt-4 text-gray-600">Loading analytics...</p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Overview Stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg shadow-lg p-6 text-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-blue-100 text-sm font-medium">Total Reservations</p>
                      <p className="text-3xl font-bold mt-2">{reservationCount}</p>
                    </div>
                    <svg className="w-12 h-12 text-blue-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg shadow-lg p-6 text-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-orange-100 text-sm font-medium">Total Feedback</p>
                      <p className="text-3xl font-bold mt-2">{feedbackStats?.totalFeedback || 0}</p>
                    </div>
                    <svg className="w-12 h-12 text-orange-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                    </svg>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg shadow-lg p-6 text-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-green-100 text-sm font-medium">Average Rating</p>
                      <p className="text-3xl font-bold mt-2">
                        {feedbackStats?.averageRating?.toFixed(1) || "N/A"}
                        <span className="text-lg">/5.0</span>
                      </p>
                    </div>
                    <svg className="w-12 h-12 text-green-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Detailed Ratings */}
              {feedbackStats && (
                <div className="bg-white rounded-lg shadow-md p-6">
                  <h2 className="text-xl font-bold text-gray-900 mb-6">Detailed Ratings</h2>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium text-gray-700">Food Quality</span>
                        <span className="text-sm font-bold text-gray-900">
                          {feedbackStats.averageFoodQuality.toFixed(1)}/5.0
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-orange-600 h-2 rounded-full"
                          style={{ width: `${(feedbackStats.averageFoodQuality / 5) * 100}%` }}
                        ></div>
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium text-gray-700">Service Quality</span>
                        <span className="text-sm font-bold text-gray-900">
                          {feedbackStats.averageServiceQuality.toFixed(1)}/5.0
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full"
                          style={{ width: `${(feedbackStats.averageServiceQuality / 5) * 100}%` }}
                        ></div>
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium text-gray-700">Ambience</span>
                        <span className="text-sm font-bold text-gray-900">
                          {feedbackStats.averageAmbience.toFixed(1)}/5.0
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-purple-600 h-2 rounded-full"
                          style={{ width: `${(feedbackStats.averageAmbience / 5) * 100}%` }}
                        ></div>
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium text-gray-700">Value for Money</span>
                        <span className="text-sm font-bold text-gray-900">
                          {feedbackStats.averageValueForMoney.toFixed(1)}/5.0
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-green-600 h-2 rounded-full"
                          style={{ width: `${(feedbackStats.averageValueForMoney / 5) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Recommendation Rate */}
              {feedbackStats && (
                <div className="bg-white rounded-lg shadow-md p-6">
                  <h2 className="text-xl font-bold text-gray-900 mb-4">Customer Recommendation</h2>
                  <div className="flex items-center justify-center">
                    <div className="text-center">
                      <div className="text-5xl font-bold text-green-600 mb-2">
                        {feedbackStats.recommendationRate.toFixed(1)}%
                      </div>
                      <p className="text-gray-600">of customers would recommend us</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </main>
      </div>
    </ProtectedRoute>
  );
}
