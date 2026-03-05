"use client";

import { useState } from "react";
import DashboardLayout from "@/components/layout/dashboard-layout";
import { useNotifications } from "@/components/ui/notification-toast";

export default function NewJobPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { showNotification } = useNotifications();

  async function createJob(formData: FormData) {
    setIsSubmitting(true);
    
    try {
      const body = {
        employerPhone: formData.get("employerPhone"),
        title: formData.get("title"),
        category: formData.get("category"),
        description: formData.get("description"),
        budget: formData.get("budget"),
        district: formData.get("district"),
      };
      
      const response = await fetch("/api/jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
        cache: "no-store",
      });

      if (response.ok) {
        showNotification({
          type: "success",
          title: "Job Posted Successfully!",
          message: "Your job has been posted and is now visible to workers.",
          duration: 5000
        });
        // Reset form
        const form = document.getElementById("job-form") as HTMLFormElement;
        if (form) form.reset();
      } else {
        const errorData = await response.json().catch(() => ({}));
        showNotification({
          type: "error",
          title: "Failed to Post Job",
          message: errorData.error || "Please check your information and try again.",
          duration: 6000
        });
      }
    } catch (error) {
      showNotification({
        type: "error",
        title: "Network Error",
        message: "Unable to connect to the server. Please check your internet connection and try again.",
        duration: 6000
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto py-6 px-6">
        <h1 className="mb-4 text-2xl font-bold text-gray-900">Post a New Job</h1>
        <p className="text-gray-600 mb-6">Create a job posting to find talented workers</p>
        
        <form id="job-form" onSubmit={(e) => { e.preventDefault(); createJob(new FormData(e.currentTarget)); }} className="space-y-6">
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Job Details</h3>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Job Title *</label>
                <input 
                  required 
                  name="title" 
                  placeholder="e.g., House Cleaner, Cook, Driver" 
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Category *</label>
                <select required name="category" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                  <option value="">Select a category</option>
                  <option value="NANNY">Nanny</option>
                  <option value="COOK">Cook</option>
                  <option value="CLEANER">Cleaner</option>
                  <option value="GARDENER">Gardener</option>
                  <option value="SECURITY">Security</option>
                  <option value="DRIVER">Driver</option>
                  <option value="LAUNDRY">Laundry</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Monthly Budget (RWF)</label>
                <input 
                  type="number" 
                  name="budget" 
                  placeholder="e.g., 50000" 
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">District *</label>
                <select required name="district" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                  <option value="">Select a district</option>
                  <option value="GASABO">Gasabo</option>
                  <option value="KICUKIRO">Kicukiro</option>
                  <option value="NYARUGENGE">Nyarugenge</option>
                </select>
              </div>
            </div>
            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">Job Description *</label>
              <textarea 
                required 
                name="description" 
                rows={4}
                placeholder="Describe the job requirements, responsibilities, and any other relevant details..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isSubmitting}
              className="bg-blue-600 text-white px-8 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? "Posting..." : "Post Job"}
            </button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
}
