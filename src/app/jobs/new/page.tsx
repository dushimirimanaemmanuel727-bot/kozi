"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import DashboardLayout from "@/components/layout/dashboard-layout";
import { useToast } from "@/components/ui/toast";

export default function NewJobPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { data: session } = useSession();
  const { success, error } = useToast();
  const router = useRouter();

  useEffect(() => {
    if (session && session.user?.role?.toLowerCase() !== "employer") {
      error("Only employers can post jobs");
      router.push("/dashboard");
    }
  }, [session, router, error]);

  if (!session) {
    return (
      <DashboardLayout>
        <div className="p-6">
          <div className="text-center">
            <p>Please sign in to post a job.</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (session.user?.role?.toLowerCase() !== "employer") {
    return (
      <DashboardLayout>
        <div className="p-6">
          <div className="text-center">
            <p className="text-red-600">Only employers can post jobs.</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  async function createJob(formData: FormData) {
    setIsSubmitting(true);
    
    try {
      const body = {
        title: formData.get("title"),
        category: formData.get("category"),
        description: formData.get("description"),
        budget: formData.get("budget"),
        district: formData.get("district"),
        deadline: formData.get("deadline"),
      };
      
      console.log('Submitting job data:', body);
      
      const response = await fetch("/api/jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
        cache: "no-store",
      });

      console.log('Job creation response:', response.status, response.statusText);
      
      if (response.ok) {
        const result = await response.json();
        console.log('Job creation result:', result);
        success("Job posted successfully! Your job is now visible to workers.");
        // Redirect to my jobs page
        router.push("/jobs/my-jobs");
      } else {
        const errorText = await response.text();
        console.error('Job creation response status:', response.status, response.statusText);
        console.error('Job creation response text:', errorText);
        let errorData: { error?: string } = {};
        try {
          errorData = JSON.parse(errorText);
        } catch (e) {
          console.error('Failed to parse error response as JSON:', e);
        }
        console.error('Job creation error:', errorData);
        error(errorData.error || "Failed to post job. Please check your information and try again.");
      }
    } catch (err) {
      console.error("Job creation error:", err);
      error("Network error. Unable to connect to the server. Please check your internet connection and try again.");
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
                <label className="block text-sm font-medium text-gray-700 mb-2">Monthly Budget (FRW)</label>
                <input 
                  type="number" 
                  name="budget" 
                  placeholder="e.g., 50000" 
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Application Deadline</label>
                <input 
                  type="datetime-local" 
                  name="deadline" 
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
