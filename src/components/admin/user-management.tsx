"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Users,
  Search,
  Filter,
  Download,
  Eye,
  Edit,
  Ban,
  Shield,
  Star,
  Briefcase,
  Calendar,
  Phone,
  Mail,
  MoreHorizontal,
  UserX,
  UserCheck,
  Building,
  Loader2,
  Trash2
} from "lucide-react";
import { useNotifications } from "@/components/ui/notification-toast";

interface UserManagementProps {
  session: any;
  users: any[];
  stats: any[];
}

export function UserManagement({ session, users, stats }: UserManagementProps) {
  const { showNotification } = useNotifications();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRole, setSelectedRole] = useState("ALL");
  const [selectedStatus, setSelectedStatus] = useState("ALL");
  const [viewingUser, setViewingUser] = useState<any>(null);
  const [editingUser, setEditingUser] = useState<any>(null);
  const [suspendingUserId, setSuspendingUserId] = useState<string | null>(null);
  const [deletingUserId, setDeletingUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [suspendReason, setSuspendReason] = useState("");
  const [editForm, setEditForm] = useState({ name: "", email: "", phone: "", role: "" });

  // Filter users based on search and filters
  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.phone.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = selectedRole === "ALL" || user.role?.toLowerCase() === selectedRole.toLowerCase();
    
    return matchesSearch && matchesRole;
  });

  // Calculate statistics
  const totalUsers = users.length;
  const totalWorkers = users.filter(u => u.role?.toLowerCase() === 'worker').length;
  const totalEmployers = users.filter(u => u.role?.toLowerCase() === 'employer').length;
  const totalAdmins = users.filter(u => u.role?.toLowerCase() === 'admin' || u.role?.toLowerCase() === 'superadmin').length;

  const getRoleColor = (role: string) => {
    switch (role?.toLowerCase()) {
      case 'worker': return 'bg-blue-50 text-blue-700 border-blue-100';
      case 'employer': return 'bg-green-50 text-green-700 border-green-100';
      case 'admin': return 'bg-purple-50 text-purple-700 border-purple-100';
      case 'superadmin': return 'bg-red-50 text-red-700 border-red-100';
      default: return 'bg-gray-50 text-gray-700 border-gray-100';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  // Action handlers
  const handleViewUser = async (userId: string) => {
    try {
      setLoading(true);
      const response = await fetch(`/api/admin/users/${userId}`);
      if (response.ok) {
        const data = await response.json();
        setViewingUser(data.user);
      }
    } catch (error) {
      console.error("Error fetching user:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleEditUser = (user: any) => {
    setEditingUser(user);
    setEditForm({
      name: user.name,
      email: user.email || "",
      phone: user.phone,
      role: user.role
    });
  };

  const handleSaveUser = async () => {
    if (!editingUser) return;
    
    try {
      setLoading(true);
      const response = await fetch(`/api/admin/users/${editingUser.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editForm)
      });
      
      if (response.ok) {
        setEditingUser(null);
        window.location.reload(); // Simple refresh for now
      }
    } catch (error) {
      console.error("Error updating user:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSuspendUser = async (userId: string, suspended: boolean) => {
    try {
      setLoading(true);
      const response = await fetch(`/api/admin/users/${userId}/suspend`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          suspended, 
          reason: suspended ? suspendReason : null 
        })
      });
      
      const data = await response.json();

      if (response.ok) {
        showNotification({
          type: "success",
          title: suspended ? "User Suspended" : "User Reactivated",
          message: data.message || `User has been ${suspended ? 'suspended' : 'reactivated'}.`
        });
        setSuspendingUserId(null);
        setSuspendReason("");
        window.location.reload();
      } else {
        showNotification({
          type: "error",
          title: "Operation Failed",
          message: data.error || "Failed to update user status."
        });
      }
    } catch (error) {
      console.error("Error suspending user:", error);
      showNotification({
        type: "error",
        title: "Error",
        message: "An unexpected error occurred."
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    try {
      setLoading(true);
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: "DELETE"
      });
      
      const data = await response.json();

      if (response.ok) {
        showNotification({
          type: "success",
          title: "User Deleted",
          message: data.message || "User has been removed from the system."
        });
        setDeletingUserId(null);
        window.location.reload();
      } else {
        showNotification({
          type: "error",
          title: "Delete Failed",
          message: data.error || "Failed to delete user."
        });
      }
    } catch (error) {
      console.error("Error deleting user:", error);
      showNotification({
        type: "error",
        title: "Error",
        message: "An unexpected error occurred."
      });
    } finally {
      setLoading(false);
    }
  };

  const handleExportUsers = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/users?export=true');
      
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `users-export-${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      } else {
        console.error("Export failed");
      }
    } catch (error) {
      console.error("Error exporting users:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 p-4 md:p-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">User Management</h1>
          <p className="text-gray-500 mt-1 font-medium">Manage and monitor all registered users in the system</p>
        </div>
        <div className="flex space-x-3">
          <Button variant="outline" onClick={handleExportUsers} className="rounded-xl border-gray-200 hover:bg-gray-50">
            <Download className="w-4 h-4 mr-2" />
            Export Users
          </Button>
          <Button className="rounded-xl bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-100">
            <Users className="w-4 h-4 mr-2" />
            Add User
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="border-none shadow-sm ring-1 ring-gray-100 rounded-2xl overflow-hidden">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-gray-400 uppercase tracking-wider">Total Users</p>
                <p className="text-3xl font-extrabold text-gray-900 mt-2">{totalUsers}</p>
              </div>
              <div className="p-4 bg-blue-50 rounded-2xl">
                <Users className="w-7 h-7 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-none shadow-sm ring-1 ring-gray-100 rounded-2xl overflow-hidden">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-gray-400 uppercase tracking-wider">Workers</p>
                <p className="text-3xl font-extrabold text-gray-900 mt-2">{totalWorkers}</p>
              </div>
              <div className="p-4 bg-green-50 rounded-2xl">
                <Briefcase className="w-7 h-7 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-none shadow-sm ring-1 ring-gray-100 rounded-2xl overflow-hidden">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-gray-400 uppercase tracking-wider">Employers</p>
                <p className="text-3xl font-extrabold text-gray-900 mt-2">{totalEmployers}</p>
              </div>
              <div className="p-4 bg-purple-50 rounded-2xl">
                <Building className="w-7 h-7 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-none shadow-sm ring-1 ring-gray-100 rounded-2xl overflow-hidden">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-gray-400 uppercase tracking-wider">Admins</p>
                <p className="text-3xl font-extrabold text-gray-900 mt-2">{totalAdmins}</p>
              </div>
              <div className="p-4 bg-orange-50 rounded-2xl">
                <Shield className="w-7 h-7 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Card */}
      <Card className="border-none shadow-sm ring-1 ring-gray-100 rounded-2xl overflow-hidden">
        <CardHeader className="border-b border-gray-50 pb-6 pt-8 px-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <CardTitle className="text-xl font-bold text-gray-800">User Directory</CardTitle>
            <div className="flex flex-col md:flex-row gap-4 flex-1 max-w-2xl">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Search by name, phone or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 rounded-xl border-gray-100 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div className="flex gap-2">
                <select
                  value={selectedRole}
                  onChange={(e) => setSelectedRole(e.target.value)}
                  className="px-4 py-2 bg-white border border-gray-100 rounded-xl text-sm font-semibold text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
                >
                  <option value="ALL">All Roles</option>
                  <option value="WORKER">Workers</option>
                  <option value="EMPLOYER">Employers</option>
                  <option value="ADMIN">Admins</option>
                </select>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-gray-50/50">
                <TableRow className="hover:bg-transparent border-gray-50">
                  <TableHead className="py-4 px-8 font-bold text-gray-400 uppercase tracking-wider text-[10px]">User</TableHead>
                  <TableHead className="py-4 font-bold text-gray-400 uppercase tracking-wider text-[10px]">Role</TableHead>
                  <TableHead className="py-4 font-bold text-gray-400 uppercase tracking-wider text-[10px]">Contact</TableHead>
                  <TableHead className="py-4 font-bold text-gray-400 uppercase tracking-wider text-[10px]">Joined</TableHead>
                  <TableHead className="py-4 font-bold text-gray-400 uppercase tracking-wider text-[10px]">Status</TableHead>
                  <TableHead className="py-4 px-8 text-right font-bold text-gray-400 uppercase tracking-wider text-[10px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.length > 0 ? (
                  filteredUsers.map((user) => (
                    <TableRow key={user.id} className="group hover:bg-gray-50/50 border-gray-50 transition-colors">
                      <TableCell className="py-5 px-8">
                        <div className="flex items-center space-x-4">
                          <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center flex-shrink-0 ring-4 ring-gray-50 group-hover:ring-blue-50 transition-all">
                            <span className="text-sm font-bold text-blue-600">
                              {user.name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div>
                            <p className="text-sm font-bold text-gray-900 group-hover:text-blue-600 transition-colors">{user.name}</p>
                            <p className="text-xs font-medium text-gray-400 mt-0.5">{user.district || 'Location not set'}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={cn("rounded-lg border px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider", getRoleColor(user.role))}>
                          {user.role}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="flex items-center text-xs font-bold text-gray-600">
                            <Phone className="w-3 h-3 mr-2 text-gray-400" />
                            {user.phone}
                          </div>
                          {user.email && (
                            <div className="flex items-center text-xs font-medium text-gray-400">
                              <Mail className="w-3 h-3 mr-2 text-gray-300" />
                              {user.email}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center text-xs font-bold text-gray-600">
                          <Calendar className="w-3 h-3 mr-2 text-gray-400" />
                          {formatDate(user.createdAt)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={cn(
                          "rounded-lg border px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider",
                          user.suspended ? "bg-red-50 text-red-700 border-red-100" : "bg-green-50 text-green-700 border-green-100"
                        )}>
                          {user.suspended ? "Suspended" : "Active"}
                        </Badge>
                      </TableCell>
                      <TableCell className="py-5 px-8 text-right">
                        <div className="flex items-center justify-end space-x-2">
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={() => handleViewUser(user.id)}
                            className="w-8 h-8 rounded-lg hover:bg-blue-50 hover:text-blue-600 transition-all"
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={() => handleEditUser(user)}
                            className="w-8 h-8 rounded-lg hover:bg-purple-50 hover:text-purple-600 transition-all"
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="w-8 h-8 rounded-lg hover:bg-gray-100 transition-all">
                                <MoreHorizontal className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="rounded-xl border-gray-100 shadow-xl p-2">
                              <DropdownMenuLabel className="text-[10px] font-bold uppercase text-gray-400 px-3 py-2">Account Safety</DropdownMenuLabel>
                              <DropdownMenuItem 
                                onClick={() => setSuspendingUserId(user.id)}
                                className={cn(
                                  "rounded-lg px-3 py-2 text-sm font-semibold transition-colors",
                                  user.suspended ? "text-green-600 hover:bg-green-50" : "text-orange-600 hover:bg-orange-50"
                                )}
                              >
                                {user.suspended ? (
                                  <><UserCheck className="w-4 h-4 mr-2" /> Reactivate</>
                                ) : (
                                  <><Ban className="w-4 h-4 mr-2" /> Suspend User</>
                                )}
                              </DropdownMenuItem>
                              <DropdownMenuSeparator className="bg-gray-50" />
                              <DropdownMenuItem 
                                onClick={() => setDeletingUserId(user.id)}
                                className="rounded-lg px-3 py-2 text-sm font-semibold text-red-600 hover:bg-red-50 transition-colors"
                              >
                                <UserX className="w-4 h-4 mr-2" /> Delete Account
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="h-64 text-center">
                      <div className="flex flex-col items-center justify-center space-y-3">
                        <div className="p-4 bg-gray-50 rounded-2xl">
                          <UserX className="w-8 h-8 text-gray-300" />
                        </div>
                        <p className="text-gray-500 font-bold">No users found</p>
                        <p className="text-xs text-gray-400">Try adjusting your filters or search term</p>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* View User Dialog */}
      <Dialog open={!!viewingUser} onOpenChange={() => setViewingUser(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>User Details</DialogTitle>
            <DialogDescription>
              Complete information about {viewingUser?.name}
            </DialogDescription>
          </DialogHeader>
          {viewingUser && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">Name</Label>
                  <p className="text-sm text-gray-600">{viewingUser.name}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Phone</Label>
                  <p className="text-sm text-gray-600">{viewingUser.phone}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Email</Label>
                  <p className="text-sm text-gray-600">{viewingUser.email || "Not provided"}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Role</Label>
                  <Badge className={getRoleColor(viewingUser.role)}>
                    {viewingUser.role}
                  </Badge>
                </div>
                <div>
                  <Label className="text-sm font-medium">Status</Label>
                  <Badge 
                    variant={viewingUser.suspended ? "destructive" : "outline"}
                    className={viewingUser.suspended ? "bg-red-50 text-red-800" : "bg-green-50 text-green-800"}
                  >
                    {viewingUser.suspended ? "Suspended" : "Active"}
                  </Badge>
                </div>
                <div>
                  <Label className="text-sm font-medium">Joined</Label>
                  <p className="text-sm text-gray-600">{formatDate(viewingUser.createdAt)}</p>
                </div>
              </div>
              
              {viewingUser.suspended && (
                <div>
                  <Label className="text-sm font-medium">Suspension Reason</Label>
                  <p className="text-sm text-red-600">{viewingUser.suspensionReason || "No reason provided"}</p>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setViewingUser(null)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit User Dialog */}
      <Dialog open={!!editingUser} onOpenChange={() => setEditingUser(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
            <DialogDescription>
              Update user information for {editingUser?.name}
            </DialogDescription>
          </DialogHeader>
          {editingUser && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={editForm.email}
                  onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  value={editForm.phone}
                  onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                />
              </div>
              {session.user.role?.toLowerCase() === "superadmin" && (
                <div>
                  <Label htmlFor="role">Role</Label>
                  <select
                    id="role"
                    value={editForm.role}
                    onChange={(e) => setEditForm({ ...editForm, role: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  >
                    <option value="WORKER">Worker</option>
                    <option value="EMPLOYER">Employer</option>
                    <option value="ADMIN">Admin</option>
                    <option value="SUPERADMIN">Super Admin</option>
                  </select>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingUser(null)}>
              Cancel
            </Button>
            <Button onClick={handleSaveUser} disabled={loading}>
              {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Suspend User Dialog */}
      <Dialog open={!!suspendingUserId} onOpenChange={() => setSuspendingUserId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {users.find(u => u.id === suspendingUserId)?.suspended ? "Unsuspend User" : "Suspend User"}
            </DialogTitle>
            <DialogDescription>
              {users.find(u => u.id === suspendingUserId)?.suspended 
                ? "Are you sure you want to unsuspend this user? They will be able to access the platform again."
                : "Are you sure you want to suspend this user? They will not be able to access the platform."
              }
            </DialogDescription>
          </DialogHeader>
          
          {!users.find(u => u.id === suspendingUserId)?.suspended && (
            <div>
              <Label htmlFor="reason">Reason for suspension</Label>
              <Textarea
                id="reason"
                placeholder="Please provide a reason for suspending this user..."
                value={suspendReason}
                onChange={(e) => setSuspendReason(e.target.value)}
              />
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setSuspendingUserId(null)}>
              Cancel
            </Button>
            <Button 
              onClick={() => {
                const user = users.find(u => u.id === suspendingUserId);
                handleSuspendUser(suspendingUserId!, !user?.suspended);
              }}
              disabled={loading || (!users.find(u => u.id === suspendingUserId)?.suspended && !suspendReason.trim())}
              variant={users.find(u => u.id === suspendingUserId)?.suspended ? "default" : "destructive"}
            >
              {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {users.find(u => u.id === suspendingUserId)?.suspended ? "Unsuspend" : "Suspend"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete User Dialog */}
      <AlertDialog open={!!deletingUserId} onOpenChange={() => setDeletingUserId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete User</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this user? This action cannot be undone and will permanently remove all their data from the platform.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => handleDeleteUser(deletingUserId!)}
              disabled={loading}
              className="bg-red-600 hover:bg-red-700"
            >
              {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Delete User
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
