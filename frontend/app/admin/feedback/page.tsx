"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "../../context/authContext";
import { ProtectedRoute } from "../../context/protectedRoute";
import axiosInstance from "../../utils/ApiClient";

interface Feedback {
  _id: string;
  rating: number;
  foodQuality: number;
  serviceQuality: number;
  ambience: number;
  valueForMoney: number;
  title: string;
  review: string;
  wouldRecommend: boolean;
  status: string;
  userId?: {
    name: string;
    email: string;
  };
  createdAt: string;
}

export default function AdminFeedbackPage() {
  const { user } = useAuth();
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("all");

  useEffect(() => {
    if (user?.role === "admin") {
      fetchFeedbacks();
    }
  }, [user]);

  const fetchFeedbacks = async () => {
    try {
      const response = await axiosInstance.get("/feedback");
      setFeedbacks(response.data);
    } catch (error) {
      console.error("Failed to fetch feedbacks:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleModerate = async (id: string, status: string) => {
    try {
      await axiosInstance.put(`/feedback/${id}/moderate`, { status });
      fetchFeedbacks();
    } catch (error) {
      console.error("Failed to moderate feedback:", error);
    }
  };

  const StarDisplay = ({ rating }: { rating: number }) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <svg
            key={star}
            className={`w-4 h-4 ${star <= rating ? "text-yellow-400 fill-current" : "text-gray-300"}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
            />
          </svg>
        ))}
      </div>
    );
  };

  const filteredFeedbacks = feedbacks.filter(feedback => {
    if (filter === "all") return true;
    return feedback.status === filter;
  });

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
              <h1 className="text-2xl font-bold text-gray-900">Feedback Management</h1>
            </div>
          </div>
        </header>

        {/* Filter Bar */}
        <div className="bg-white border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex gap-2 overflow-x-auto">
              {["all", "pending", "approved", "rejected"].map((status) => (
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

        {/* Feedback List */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
              <p className="mt-4 text-gray-600">Loading feedback...</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredFeedbacks.map((feedback) => (
                <div key={feedback._id} className="bg-white rounded-lg shadow-md p-6">
                  {/* Header */}
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg font-bold text-gray-900">{feedback.title}</h3>
                      <p className="text-sm text-gray-600">
                        By {feedback.userId?.name || "Anonymous"} • {new Date(feedback.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <span className={`px-3 py-1 text-xs font-medium rounded capitalize ${
                      feedback.status === "approved" ? "bg-green-100 text-green-800" :
                      feedback.status === "rejected" ? "bg-red-100 text-red-800" :
                      "bg-yellow-100 text-yellow-800"
                    }`}>
                      {feedback.status}
                    </span>
                  </div>

                  {/* Ratings */}
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-4">
                    <div>
                      <p className="text-xs text-gray-600 mb-1">Overall</p>
                      <StarDisplay rating={feedback.rating} />
                    </div>
                    <div>
                      <p className="text-xs text-gray-600 mb-1">Food</p>
                      <StarDisplay rating={feedback.foodQuality} />
                    </div>
                    <div>
                      <p className="text-xs text-gray-600 mb-1">Service</p>
                      <StarDisplay rating={feedback.serviceQuality} />
                    </div>
                    <div>
                      <p className="text-xs text-gray-600 mb-1">Ambience</p>
                      <StarDisplay rating={feedback.ambience} />
                    </div>
                    <div>
                      <p className="text-xs text-gray-600 mb-1">Value</p>
                      <StarDisplay rating={feedback.valueForMoney} />
                    </div>
                  </div>

                  {/* Review */}
                  <p className="text-gray-700 mb-4">{feedback.review}</p>

                  {/* Recommendation */}
                  {feedback.wouldRecommend && (
                    <div className="flex items-center gap-2 text-green-600 mb-4">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span className="text-sm font-medium">Would recommend</span>
                    </div>
                  )}

                  {/* Actions */}
                  {feedback.status === "pending" && (
                    <div className="flex gap-2 pt-4 border-t">
                      <button
                        onClick={() => handleModerate(feedback._id, "approved")}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => handleModerate(feedback._id, "rejected")}
                        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
                      >
                        Reject
                      </button>
                    </div>
                  )}
                </div>
              ))}
              {filteredFeedbacks.length === 0 && (
                <div className="text-center py-12">
                  <p className="text-gray-600">No feedback found</p>
                </div>
              )}
            </div>
          )}
        </main>
      </div>
    </ProtectedRoute>
  );
}
