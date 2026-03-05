"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import DashboardLayout from "@/components/layout/dashboard-layout";

interface Review {
  id: string;
  rating: number;
  comment: string | null;
  createdAt: string;
  reviewer: {
    id: string;
    name: string;
    phone: string;
  };
  reviewee: {
    id: string;
    name: string;
    phone: string;
  };
}

export default function Reviews() {
  const { data: session } = useSession();
  const router = useRouter();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState<"all" | "given" | "received">("all");

  useEffect(() => {
    if (session?.user.role !== "WORKER") {
      router.push("/dashboard");
      return;
    }

    const fetchReviews = async () => {
      try {
        const response = await fetch("/api/reviews");
        if (response.ok) {
          const data = await response.json();
          setReviews(data);
        } else {
          setError("Failed to load reviews");
        }
      } catch (error) {
        setError("An error occurred while loading reviews");
      } finally {
        setLoading(false);
      }
    };

    fetchReviews();
  }, [session, router]);

  const filteredReviews = reviews.filter(review => {
    if (!session?.user) return false;
    if (filter === "given") {
      return review.reviewer.id === session.user.id;
    } else if (filter === "received") {
      return review.reviewer.id !== session.user.id;
    }
    return true;
  });

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <svg
        key={i}
        className={`w-5 h-5 ${i < rating ? "text-yellow-400" : "text-gray-300"}`}
        fill="currentColor"
        viewBox="0 0 24 24"
      >
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 01.69.694l.33 1.108c.43.288.824.588 1.163.886l.215.125c.437.264.785.559 1.466.559.686 0 1.342-.108 1.787-.32l.189-.096c.147-.07.37-.141.632-.255.456-.083.873-.262 1.26-.425l.159-.052c.417-.137.806-.321 1.165-.688.357-.367.676-.774.93-1.207.332-.714.578-1.486.69-2.311.196-1.12.496-2.313.69-3.446.196-.894.496-1.785.69-2.313.69-1.342m0 0a1 1 0 001 1v3a1 1 0 001 1h1a1 1 0 001-1v-3a1 1 0 00-1-1H9a1 1 0 00-1 1v3a1 1 0 001 1h1" />
      </svg>
    ));
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const averageRating = reviews.length > 0 
    ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length 
    : 0;

  if (!session || session.user.role !== "WORKER") {
    return null;
  }

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto py-6 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Reviews</h1>
            <p className="text-gray-600">Manage your reputation and customer feedback</p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg mb-6">
              {error}
            </div>
          )}

          {/* Stats Overview */}
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-yellow-500 mb-2">
                  {averageRating.toFixed(1)}
                </div>
                <div className="text-sm text-gray-600">Average Rating</div>
                <div className="flex justify-center mt-2">
                  {renderStars(Math.round(averageRating))}
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600 mb-2">{reviews.length}</div>
                <div className="text-sm text-gray-600">Total Reviews</div>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600 mb-2">
                  {reviews.filter(r => r.rating >= 4).length}
                </div>
                <div className="text-sm text-gray-600">Positive Reviews</div>
              </div>
            </div>
          </div>

          {/* Filter Tabs */}
          <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
            <div className="flex space-x-1 border-b border-gray-200">
              <button
                onClick={() => setFilter("all")}
                className={`py-2 px-4 font-medium text-sm border-b-2 transition-colors ${
                  filter === "all"
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
              >
                All Reviews ({reviews.length})
              </button>
              <button
                onClick={() => setFilter("given")}
                className={`py-2 px-4 font-medium text-sm border-b-2 transition-colors ${
                  filter === "given"
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
              >
                Given ({reviews.filter(r => r.reviewer.id === session.user.id).length})
              </button>
              <button
                onClick={() => setFilter("received")}
                className={`py-2 px-4 font-medium text-sm border-b-2 transition-colors ${
                  filter === "received"
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
              >
                Received ({reviews.filter(r => r.reviewer.id !== session.user.id).length})
              </button>
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              <p className="ml-4 text-gray-600">Loading reviews...</p>
            </div>
          ) : filteredReviews.length === 0 ? (
            <div className="bg-white rounded-lg shadow-sm border p-12 text-center">
              <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h4.01M16 8v4m0 0l-4 4m4-4v4m0 0l-4 4" />
              </svg>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No Reviews Yet</h3>
              <p className="text-gray-600 mb-4">
                {filter === "given" 
                  ? "You haven't given any reviews yet. Complete jobs successfully to receive reviews!"
                  : "You haven't received any reviews yet. Keep up the great work!"
                }
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredReviews.map((review) => (
                <div key={review.id} className="bg-white rounded-lg shadow-sm border p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="flex items-center">
                        {renderStars(review.rating)}
                        <span className="ml-2 text-lg font-semibold text-gray-900">
                          {review.rating.toFixed(1)}
                        </span>
                      </div>
                      <div className="text-sm text-gray-600">
                        <div>by {review.reviewer.name}</div>
                        <div>{formatDate(review.createdAt)}</div>
                      </div>
                    </div>
                  </div>
                  <div className="text-gray-700 mb-3">
                    {review.comment && (
                      <p className="text-gray-600 italic">"{review.comment}"</p>
                    )}
                  </div>
                  <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                    <div className="text-sm text-gray-500">
                      {session?.user && review.reviewer.id === session.user.id 
                        ? "Review you gave"
                        : "Review you received"
                      }
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
