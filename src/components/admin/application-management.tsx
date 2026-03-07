"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Search,
  Filter,
  Download,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  FileText,
  User,
  Briefcase,
  MoreHorizontal,
  Calendar,
  Mail,
  Phone,
  Star,
  Building,
  TrendingUp,
  DollarSign
} from "lucide-react";

interface ApplicationManagementProps {
  session: any;
  applications: any[];
  stats: {
    pending: number;
    accepted: number;
    rejected: number;
    total: number;
  };
}

export function ApplicationManagement({ session, applications, stats }: ApplicationManagementProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("ALL");
  const [selectedCategory, setSelectedCategory] = useState("ALL");

  // Filter applications based on search and filters
  const filteredApplications = applications.filter(application => {
    const matchesSearch = 
      application.worker.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      application.worker.phone.toLowerCase().includes(searchTerm.toLowerCase()) ||
      application.worker.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      application.job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      application.job.employer.name.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = selectedStatus === "ALL" || application.status === selectedStatus;
    const matchesCategory = selectedCategory === "ALL" || application.job.category === selectedCategory;
    
    return matchesSearch && matchesStatus && matchesCategory;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING': return 'bg-yellow-100 text-yellow-800';
      case 'ACCEPTED': return 'bg-green-100 text-green-800';
      case 'REJECTED': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const getCategoryColor = (category: string) => {
    const colors = {
      'HOUSEKEEPING': 'bg-blue-100 text-blue-800',
      'COOKING': 'bg-green-100 text-green-800',
      'DRIVING': 'bg-purple-100 text-purple-800',
      'GARDENING': 'bg-yellow-100 text-yellow-800',
      'CHILD_CARE': 'bg-pink-100 text-pink-800',
      'ELDER_CARE': 'bg-indigo-100 text-indigo-800',
      'SECURITY': 'bg-red-100 text-red-800',
      'CLEANING': 'bg-cyan-100 text-cyan-800',
      'LAUNDRY': 'bg-orange-100 text-orange-800',
      'MAINTENANCE': 'bg-gray-100 text-gray-800'
    };
    return colors[category as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Application Management</h1>
          <p className="text-gray-600 mt-1">Review and manage job applications</p>
        </div>
        <div className="flex space-x-3">
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export Data
          </Button>
          <Button>
            <CheckCircle className="w-4 h-4 mr-2" />
            Bulk Actions
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-50 rounded-lg">
                <FileText className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Applications</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-50 rounded-lg">
                <Clock className="w-6 h-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Pending</p>
                <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-50 rounded-lg">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Accepted</p>
                <p className="text-2xl font-bold text-green-600">{stats.accepted}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-red-50 rounded-lg">
                <XCircle className="w-6 h-6 text-red-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Rejected</p>
                <p className="text-2xl font-bold text-red-600">{stats.rejected}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search by worker, employer, or job title..."
                  value={searchTerm}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md bg-white text-sm"
              >
                <option value="ALL">All Status</option>
                <option value="PENDING">Pending</option>
                <option value="ACCEPTED">Accepted</option>
                <option value="REJECTED">Rejected</option>
              </select>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md bg-white text-sm"
              >
                <option value="ALL">All Categories</option>
                <option value="HOUSEKEEPING">Housekeeping</option>
                <option value="COOKING">Cooking</option>
                <option value="DRIVING">Driving</option>
                <option value="GARDENING">Gardening</option>
                <option value="CHILD_CARE">Child Care</option>
                <option value="ELDER_CARE">Elder Care</option>
                <option value="SECURITY">Security</option>
                <option value="CLEANING">Cleaning</option>
                <option value="LAUNDRY">Laundry</option>
                <option value="MAINTENANCE">Maintenance</option>
              </select>
              <Button variant="outline">
                <Filter className="w-4 h-4 mr-2" />
                More Filters
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Applications Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Job Applications ({filteredApplications.length})</span>
            <Button variant="outline" size="sm">
              <Eye className="w-4 h-4 mr-2" />
              View Details
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Worker</TableHead>
                <TableHead>Job</TableHead>
                <TableHead>Employer</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Applied</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredApplications.slice(0, 10).map((application) => (
                <TableRow key={application.id}>
                  <TableCell>
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center mr-3">
                        <User className="w-4 h-4 text-gray-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">{application.worker.name}</p>
                        <p className="text-xs text-gray-500">ID: {application.worker.id.slice(0, 8)}</p>
                        <div className="flex items-center text-xs text-gray-500 mt-1">
                          <Phone className="w-3 h-3 mr-1" />
                          {application.worker.phone}
                        </div>
                        {application.worker.email && (
                          <div className="flex items-center text-xs text-gray-500">
                            <Mail className="w-3 h-3 mr-1" />
                            {application.worker.email}
                          </div>
                        )}
                        {application.worker.workerProfile && (
                          <div className="flex items-center text-xs text-gray-500 mt-1">
                            <Star className="w-3 h-3 mr-1 text-yellow-500" />
                            {application.worker.workerProfile.rating.toFixed(1)} 
                            ({application.worker.workerProfile.reviewCount} reviews)
                          </div>
                        )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="text-sm font-medium">{application.job.title}</p>
                      <p className="text-xs text-gray-500">{application.job.category}</p>
                      {application.job.budget && (
                        <div className="flex items-center text-xs text-green-600 mt-1">
                          <DollarSign className="w-3 h-3 mr-1" />
                          {application.job.budget.toLocaleString()} RWF
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center mr-3">
                        <Building className="w-4 h-4 text-gray-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">{application.job.employer.name}</p>
                        {application.job.employer.employerProfile?.organization && (
                          <p className="text-xs text-gray-500">
                            {application.job.employer.employerProfile.organization}
                          </p>
                        )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={getCategoryColor(application.job.category)}>
                      {application.job.category}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(application.status)}>
                      {application.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <div className="flex items-center">
                        <Calendar className="w-3 h-3 mr-1 text-gray-400" />
                        {formatDate(application.createdAt)}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem>
                          <Eye className="w-4 h-4 mr-2" />
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <User className="w-4 h-4 mr-2" />
                          View Worker Profile
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Briefcase className="w-4 h-4 mr-2" />
                          View Job Details
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-green-600">
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Accept Application
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-red-600">
                          <XCircle className="w-4 h-4 mr-2" />
                          Reject Application
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
