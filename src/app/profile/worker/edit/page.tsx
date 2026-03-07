"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import DashboardLayout from "@/components/layout/dashboard-layout";

const calculateProfileCompletion = (profile: any) => {
  const fields = [
    { field: 'category', weight: 15 },
    { field: 'skills', weight: 15 },
    { field: 'experienceYears', weight: 10 },
    { field: 'availability', weight: 10 },
    { field: 'minMonthlyPay', weight: 10 },
    { field: 'bio', weight: 10 },
    { field: 'nationalId', weight: 15 },
    { field: 'passportNumber', weight: 10 },
    { field: 'photoUrl', weight: 10 },
    { field: 'passportUrl', weight: 5 }
  ];

  let completedWeight = 0;
  let totalWeight = 0;

  fields.forEach(({ field, weight }) => {
    totalWeight += weight;
    if (profile[field] && profile[field] !== '' && profile[field] !== null && profile[field] !== undefined) {
      completedWeight += weight;
    }
  });

  return Math.round((completedWeight / totalWeight) * 100);
};

export default function EditWorkerProfile() {
  const { data: session } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
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
  const [photoPreview, setPhotoPreview] = useState<string>("");
  const [currentPhoto, setCurrentPhoto] = useState<string>("");
  const [passportFile, setPassportFile] = useState<File | null>(null);
  const [passportPreview, setPassportPreview] = useState<string>("");
  const [currentPassport, setCurrentPassport] = useState<string>("");
  const [profileCompletion, setProfileCompletion] = useState<number>(0);

  useEffect(() => {
    if (session?.user.role !== "WORKER") {
      router.push("/dashboard");
      return;
    }

    // Load current profile data
    const loadProfile = async () => {
      try {
        const response = await fetch("/api/profile/worker/current");
        if (response.ok) {
          const data = await response.json();
          setFormData({
            category: data.category || "GENERAL",
            skills: data.skills || "",
            experienceYears: data.experienceYears?.toString() || "0",
            availability: data.availability || "PART_TIME",
            minMonthlyPay: data.minMonthlyPay?.toString() || "",
            liveIn: data.liveIn || false,
            bio: data.bio || "",
            nationalId: data.nationalId || "",
            passportNumber: data.passportNumber || "",
          });
          setCurrentPhoto(data.photoUrl || "");
          setCurrentPassport(data.passportUrl || "");
          
          // Calculate profile completion
          const completion = calculateProfileCompletion({
            category: data.category,
            skills: data.skills,
            experienceYears: data.experienceYears,
            availability: data.availability,
            minMonthlyPay: data.minMonthlyPay,
            bio: data.bio,
            nationalId: data.nationalId,
            passportNumber: data.passportNumber,
            photoUrl: data.photoUrl,
            passportUrl: data.passportUrl,
          });
          setProfileCompletion(completion);
        }
      } catch (error) {
        console.error("Failed to load profile:", error);
      }
    };

    loadProfile();
  }, [session, router]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    
    if (type === "checkbox") {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  // Update profile completion whenever form data or files change
  useEffect(() => {
    const completion = calculateProfileCompletion({
      ...formData,
      photoUrl: photoPreview || currentPhoto,
      passportUrl: passportPreview || currentPassport,
    });
    setProfileCompletion(completion);
  }, [formData, photoPreview, currentPhoto, passportPreview, currentPassport]);

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
    setSuccess("");
    setLoading(true);

    try {
      const submitData = new FormData();
      
      // Add form fields
      Object.entries(formData).forEach(([key, value]) => {
        submitData.append(key, value.toString());
      });

      // Add photo if changed
      if (photoFile) {
        submitData.append("photo", photoFile);
      }

      // Add passport if changed
      if (passportFile) {
        submitData.append("passport", passportFile);
      }

      const response = await fetch("/api/profile/worker/update", {
        method: "PUT",
        body: submitData,
      });

      const result = await response.json();

      if (!response.ok) {
        setError(result.error || "Failed to update profile");
      } else {
        setSuccess("Profile updated successfully!");
        // Clear previews after successful update
        setPhotoPreview("");
        setPassportPreview("");
        setPhotoFile(null);
        setPassportFile(null);
      }
    } catch (error) {
      setError("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (!session || session.user.role !== "WORKER") {
    return null;
  }

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto py-6 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Edit Profile</h1>
            <p className="text-gray-600">Update your skills, availability, and preferences</p>
            
            {/* Profile Completion Indicator */}
            <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-blue-900">Profile Completion</span>
                <span className={`text-sm font-bold ${
                  profileCompletion === 100 ? 'text-green-600' : 
                  profileCompletion >= 75 ? 'text-blue-600' : 
                  profileCompletion >= 50 ? 'text-yellow-600' : 'text-red-600'
                }`}>
                  {profileCompletion}%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full transition-all duration-300 ${
                    profileCompletion === 100 ? 'bg-green-500' : 
                    profileCompletion >= 75 ? 'bg-blue-500' : 
                    profileCompletion >= 50 ? 'bg-yellow-500' : 'bg-red-500'
                  }`} 
                  style={{ width: `${profileCompletion}%` }}
                ></div>
              </div>
              <p className="text-xs text-blue-700 mt-2">
                {profileCompletion === 100 ? '🎉 Excellent! Your profile is complete.' :
                 profileCompletion >= 75 ? 'Great! Almost there. Add a few more details.' :
                 profileCompletion >= 50 ? 'Good progress. Keep adding your information.' :
                 'Getting started. Please complete your profile details.'}
              </p>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg mb-6">
              {error}
            </div>
          )}

          {success && (
            <div className="bg-green-50 border border-green-200 text-green-600 px-4 py-3 rounded-lg mb-6">
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Profile Photo */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Profile Photo</h3>
              <div className="flex items-center space-x-6">
                <div className="shrink-0">
                  {(photoPreview || currentPhoto) ? (
                    <img
                      src={photoPreview || currentPhoto}
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
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    JPG, PNG or GIF. Max size 5MB. Leave empty to keep current photo.
                  </p>
                </div>
              </div>
            </div>

            {/* Identification Documents */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Identification Documents</h3>
              
              {/* National ID */}
              <div className="mb-6">
                <label htmlFor="nationalId" className="block text-sm font-medium text-gray-700 mb-2">
                  National ID Number
                </label>
                <input
                  type="text"
                  id="nationalId"
                  name="nationalId"
                  value={formData.nationalId}
                  onChange={handleInputChange}
                  placeholder="Enter your national ID number"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Passport Upload */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Passport Document
                </label>
                <div className="space-y-4">
                  {(passportPreview || currentPassport) ? (
                    <img
                      src={passportPreview || currentPassport}
                      alt="Passport document"
                      className="h-32 w-full object-cover rounded-lg border-2 border-gray-200"
                    />
                  ) : (
                    <div className="h-32 w-full bg-gray-200 rounded-lg border-2 border-gray-200 flex items-center justify-center">
                      <div className="text-center">
                        <svg className="h-12 w-12 text-gray-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <p className="text-sm text-gray-500">No passport document uploaded</p>
                      </div>
                    </div>
                  )}
                  <input
                    type="file"
                    accept="image/*,.pdf"
                    onChange={handlePassportChange}
                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-green-50 file:text-green-700 hover:file:bg-green-100"
                  />
                  <p className="text-xs text-gray-500">
                    JPG, PNG, PDF. Max size 5MB. Leave empty to keep current document.
                  </p>
                </div>
              </div>

              {/* Passport Number */}
              <div>
                <label htmlFor="passportNumber" className="block text-sm font-medium text-gray-700 mb-2">
                  Passport Number
                </label>
                <input
                  type="text"
                  id="passportNumber"
                  name="passportNumber"
                  value={formData.passportNumber}
                  onChange={handleInputChange}
                  placeholder="Enter your passport number"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Work Information */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Work Information</h3>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
                    Work Category *
                  </label>
                  <select
                    id="category"
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
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

                <div>
                  <label htmlFor="experienceYears" className="block text-sm font-medium text-gray-700 mb-2">
                    Years of Experience *
                  </label>
                  <select
                    id="experienceYears"
                    name="experienceYears"
                    value={formData.experienceYears}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                  >
                    <option value="0">Less than 1 year</option>
                    <option value="1">1-2 years</option>
                    <option value="3">3-5 years</option>
                    <option value="6">6-10 years</option>
                    <option value="10">10+ years</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="availability" className="block text-sm font-medium text-gray-700 mb-2">
                    Availability *
                  </label>
                  <select
                    id="availability"
                    name="availability"
                    value={formData.availability}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                  >
                    <option value="FULL_TIME">Full Time</option>
                    <option value="PART_TIME">Part Time</option>
                    <option value="LIVE_IN">Live In</option>
                    <option value="LIVE_OUT">Live Out</option>
                    <option value="WEEKENDS">Weekends Only</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="minMonthlyPay" className="block text-sm font-medium text-gray-700 mb-2">
                    Minimum Monthly Pay (FRW)
                  </label>
                  <input
                    type="number"
                    id="minMonthlyPay"
                    name="minMonthlyPay"
                    value={formData.minMonthlyPay}
                    onChange={handleInputChange}
                    placeholder="e.g., 50000"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

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
              </div>
            </div>

            {/* Skills and Bio */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Skills & Description</h3>
              <div className="space-y-4">
                <div>
                  <label htmlFor="skills" className="block text-sm font-medium text-gray-700 mb-2">
                    Skills
                  </label>
                  <textarea
                    id="skills"
                    name="skills"
                    value={formData.skills}
                    onChange={handleInputChange}
                    rows={4}
                    placeholder="Tell employers about yourself, your experience, and what makes you a great worker..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={loading}
                className="bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3 px-8 rounded-lg font-semibold hover:from-blue-700 hover:to-blue-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Updating Profile..." : "Update Profile"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </DashboardLayout>
  );
}
