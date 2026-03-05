"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function CompleteWorkerProfile() {
  const { data: session } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    category: "GENERAL",
    skills: "",
    experienceYears: "0",
    availability: "PART_TIME",
    minMonthlyPay: "",
    liveIn: false,
    bio: "",
    nationalId: "",
    passportNumber: "",
  });

  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [passportFile, setPassportFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string>("");
  const [passportPreview, setPassportPreview] = useState<string>("");

  if (!session) {
    router.push("/auth/signin");
    return null;
  }

  if (session.user.role !== "WORKER") {
    router.push("/dashboard");
    return null;
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    
    if (type === "checkbox") {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPhotoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handlePassportChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPassportFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPassportPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // Create FormData for file uploads
      const submitData = new FormData();
      
      // Add form fields
      Object.entries(formData).forEach(([key, value]) => {
        submitData.append(key, value.toString());
      });

      // Add files if they exist
      if (photoFile) {
        submitData.append("photo", photoFile);
      }
      if (passportFile) {
        submitData.append("passport", passportFile);
      }

      const response = await fetch("/api/profile/worker/complete", {
        method: "POST",
        body: submitData,
      });

      const result = await response.json();

      if (!response.ok) {
        setError(result.error || "Failed to update profile");
      } else {
        router.push("/dashboard?profile=completed");
      }
    } catch (error) {
      setError("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Complete Your Profile</h1>
            <p className="text-gray-600">
              Welcome to Kazi Home! Please complete your profile to start finding jobs.
            </p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg mb-6">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Profile Photo */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Profile Photo *
              </label>
              <div className="flex items-center space-x-6">
                <div className="shrink-0">
                  {photoPreview ? (
                    <img
                      src={photoPreview}
                      alt="Profile preview"
                      className="h-24 w-24 object-cover rounded-full border-4 border-gray-200"
                    />
                  ) : (
                    <div className="h-24 w-24 bg-gray-200 rounded-full border-4 border-gray-200 flex items-center justify-center">
                      <svg className="h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoChange}
                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    JPG, PNG or GIF. Max size 5MB.
                  </p>
                </div>
              </div>
            </div>

            {/* National ID */}
            <div>
              <label htmlFor="nationalId" className="block text-sm font-medium text-gray-700">
                National ID Number *
              </label>
              <input
                type="text"
                id="nationalId"
                name="nationalId"
                value={formData.nationalId}
                onChange={handleInputChange}
                required
                placeholder="Enter your national ID number"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Passport */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Passport Document *
              </label>
              <div className="flex items-center space-x-6">
                <div className="flex-1">
                  {passportPreview ? (
                    <img
                      src={passportPreview}
                      alt="Passport preview"
                      className="h-32 w-full object-cover rounded-lg border-2 border-gray-200"
                    />
                  ) : (
                    <div className="h-32 w-full bg-gray-200 rounded-lg border-2 border-gray-200 flex items-center justify-center">
                      <div className="text-center">
                        <svg className="h-12 w-12 text-gray-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <p className="text-sm text-gray-500">Upload passport</p>
                      </div>
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <input
                    type="file"
                    accept="image/*,.pdf"
                    onChange={handlePassportChange}
                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-green-50 file:text-green-700 hover:file:bg-green-100"
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    JPG, PNG, PDF. Max size 5MB.
                  </p>
                </div>
              </div>
            </div>

            {/* Passport Number */}
            <div>
              <label htmlFor="passportNumber" className="block text-sm font-medium text-gray-700">
                Passport Number *
              </label>
              <input
                type="text"
                id="passportNumber"
                name="passportNumber"
                value={formData.passportNumber}
                onChange={handleInputChange}
                required
                placeholder="Enter your passport number"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Category */}
            <div>
              <label htmlFor="category" className="block text-sm font-medium text-gray-700">
                Work Category *
              </label>
              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                required
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
              >
                <option value="NANNY">Nanny</option>
                <option value="COOK">Cook</option>
                <option value="CLEANER">Cleaner</option>
                <option value="GARDENER">Gardener</option>
                <option value="SECURITY">Security</option>
                <option value="DRIVER">Driver</option>
                <option value="LAUNDRY">Laundry</option>
                <option value="GENERAL">General</option>
              </select>
            </div>

            {/* Skills */}
            <div>
              <label htmlFor="skills" className="block text-sm font-medium text-gray-700">
                Skills
              </label>
              <textarea
                id="skills"
                name="skills"
                value={formData.skills}
                onChange={handleInputChange}
                rows={3}
                placeholder="Describe your skills (e.g., cooking, cleaning, child care)"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Experience */}
            <div>
              <label htmlFor="experienceYears" className="block text-sm font-medium text-gray-700">
                Years of Experience *
              </label>
              <select
                id="experienceYears"
                name="experienceYears"
                value={formData.experienceYears}
                onChange={handleInputChange}
                required
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
              >
                <option value="0">Less than 1 year</option>
                <option value="1">1-2 years</option>
                <option value="3">3-5 years</option>
                <option value="6">6-10 years</option>
                <option value="10">10+ years</option>
              </select>
            </div>

            {/* Availability */}
            <div>
              <label htmlFor="availability" className="block text-sm font-medium text-gray-700">
                Availability *
              </label>
              <select
                id="availability"
                name="availability"
                value={formData.availability}
                onChange={handleInputChange}
                required
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
              >
                <option value="FULL_TIME">Full Time</option>
                <option value="PART_TIME">Part Time</option>
                <option value="LIVE_IN">Live In</option>
                <option value="LIVE_OUT">Live Out</option>
                <option value="WEEKENDS">Weekends Only</option>
              </select>
            </div>

            {/* Monthly Pay */}
            <div>
              <label htmlFor="minMonthlyPay" className="block text-sm font-medium text-gray-700">
                Minimum Monthly Pay (RWF)
              </label>
              <input
                type="number"
                id="minMonthlyPay"
                name="minMonthlyPay"
                value={formData.minMonthlyPay}
                onChange={handleInputChange}
                placeholder="e.g., 50000"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Live In */}
            <div className="flex items-center">
              <input
                type="checkbox"
                id="liveIn"
                name="liveIn"
                checked={formData.liveIn}
                onChange={handleInputChange}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="liveIn" className="ml-2 block text-sm text-gray-700">
                Willing to live with employer
              </label>
            </div>

            {/* Bio */}
            <div>
              <label htmlFor="bio" className="block text-sm font-medium text-gray-700">
                About You
              </label>
              <textarea
                id="bio"
                name="bio"
                value={formData.bio}
                onChange={handleInputChange}
                rows={4}
                placeholder="Tell employers about yourself, your experience, and what makes you a great worker..."
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Submit Button */}
            <div className="pt-4">
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3 px-4 rounded-lg font-semibold hover:from-blue-700 hover:to-blue-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Saving Profile..." : "Complete Profile"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
