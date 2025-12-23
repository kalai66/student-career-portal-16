
import React, { useState, useEffect } from 'react';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Plus, Edit, Trash, Search, X } from "lucide-react";
import { useAuth } from '@/contexts/AuthContext';
import NavBar from './NavBar';
import AdminPanel from './AdminPanel';
import SuperAdminDashboard from './SuperAdminDashboard';
import CompanyManager from './CompanyManager';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { profilesDB } from '@/lib/dbHelpers';
import { Profile } from '@/lib/auth';

const SuperAdminPanel: React.FC = () => {
  const { currentUser } = useAuth();
  const { toast } = useToast();
  const [adminUsers, setAdminUsers] = useState<Profile[]>([]);
  const [filteredAdmins, setFilteredAdmins] = useState<Profile[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isAddAdminDialogOpen, setIsAddAdminDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [currentAdmin, setCurrentAdmin] = useState<Profile | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
  });
  const [activeTab, setActiveTab] = useState('dashboard');

  const fetchAdmins = async () => {
    try {
      setIsLoading(true);
      const admins = await profilesDB.getByRole('admin');
      setAdminUsers(admins);
      setFilteredAdmins(admins);
    } catch (error) {
      console.error('Error fetching admins:', error);
      toast({
        title: "Error",
        description: "Failed to fetch admin users",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  React.useEffect(() => {
    fetchAdmins();
  }, []);

  // Filter admins based on search term
  React.useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredAdmins(adminUsers);
      return;
    }

    const filtered = adminUsers.filter(admin =>
      admin.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (admin.email && admin.email.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    setFilteredAdmins(filtered);
  }, [searchTerm, adminUsers]);

  const handleAddAdmin = () => {
    setCurrentAdmin(null);
    setFormData({ name: '', email: '', password: '' });
    setIsAddAdminDialogOpen(true);
  };

  const handleEditAdmin = (admin: Profile) => {
    setCurrentAdmin(admin);
    setFormData({
      name: admin.name,
      email: admin.email || '',
      password: ''
    });
    setIsAddAdminDialogOpen(true);
  };

  const handleDeleteAdmin = (admin: Profile) => {
    setCurrentAdmin(admin);
    setIsDeleteDialogOpen(true);
  };

  const resetFormState = () => {
    setCurrentAdmin(null);
    setFormData({ name: '', email: '', password: '' });
    setIsAddAdminDialogOpen(false);
    setIsDeleteDialogOpen(false);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      toast({
        title: "Error",
        description: "Name is required",
        variant: "destructive"
      });
      return;
    }

    // Email validation
    if (!formData.email || !formData.email.includes('@')) {
      toast({
        title: "Error",
        description: "Valid email is required",
        variant: "destructive"
      });
      return;
    }

    // Password validation when creating a new user
    if (!currentAdmin && (!formData.password || formData.password.length < 6)) {
      toast({
        title: "Error",
        description: "Password must be at least 6 characters",
        variant: "destructive"
      });
      return;
    }

    try {
      // If editing an existing admin
      if (currentAdmin) {
        // Update the profile
        await profilesDB.update(currentAdmin._id, {
          name: formData.name,
          email: formData.email
        });

        // If password is provided, update it
        if (formData.password) {
          const { updatePassword } = await import('@/lib/auth');
          await updatePassword(currentAdmin._id, formData.password);
        }

        toast({
          title: "Admin Updated",
          description: `${formData.name}'s profile has been updated.`,
        });
      } else {
        // Create a new admin user
        await profilesDB.create({
          email: formData.email,
          password: formData.password,
          name: formData.name,
          role: 'admin'
        });

        toast({
          title: "Admin Created",
          description: `${formData.name} has been added as an admin.`,
        });
      }

      // Close the form and reset state
      resetFormState();

      // Refresh admin list
      fetchAdmins();

    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive"
      });
    }
  };

  const confirmDeleteAdmin = async () => {
    if (!currentAdmin) return;

    try {
      await profilesDB.delete(currentAdmin._id);

      toast({
        title: "Admin Deleted",
        description: `${currentAdmin.name} has been removed.`,
        variant: "destructive"
      });

      // Close the dialog and reset state
      resetFormState();

      // Refresh admin list
      fetchAdmins();

    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive"
      });
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }).format(date);
  };

  return (
    <div className="panel-container">
      <NavBar title="Campus Recruitment - Super Admin Panel" />

      <div className="container mx-auto py-8 space-y-6">
        <h1 className="text-3xl font-bold">Super Admin Dashboard</h1>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full md:w-auto grid-cols-4">
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="admins">Admin Management</TabsTrigger>
            <TabsTrigger value="companies">Company Management</TabsTrigger>
            <TabsTrigger value="staff">Staff Management</TabsTrigger>
          </TabsList>

          <div className="mt-6">
            <TabsContent value="dashboard">
              <Card>
                <CardHeader>
                  <CardTitle>Dashboard Overview</CardTitle>
                  <CardDescription>
                    Key metrics and platform analytics
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <SuperAdminDashboard />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="admins">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle>Admin Users</CardTitle>
                  <Button onClick={handleAddAdmin} variant="default" size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Admin
                  </Button>
                </CardHeader>

                <CardContent>
                  <div className="mb-4 flex items-center gap-2">
                    <div className="relative flex-grow">
                      <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        placeholder="Search admins by name or email..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-8"
                      />
                      {searchTerm && (
                        <button
                          className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                          onClick={() => setSearchTerm('')}
                        >
                          <X className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </div>

                  {isLoading ? (
                    <div className="text-center py-4">Loading...</div>
                  ) : filteredAdmins.length === 0 ? (
                    <div className="text-center py-4 text-muted-foreground">
                      {searchTerm ? 'No admins found matching your search.' : 'No admin users found. Add some!'}
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Name</TableHead>
                            <TableHead>Email</TableHead>
                            <TableHead>Created</TableHead>
                            <TableHead>Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {filteredAdmins.map((admin) => (
                            <TableRow key={admin._id}>
                              <TableCell className="font-medium">{admin.name}</TableCell>
                              <TableCell>{admin.email}</TableCell>
                              <TableCell>{admin.created_at ? formatDate(admin.created_at) : 'N/A'}</TableCell>
                              <TableCell>
                                <div className="flex items-center gap-2">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleEditAdmin(admin)}
                                  >
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleDeleteAdmin(admin)}
                                  >
                                    <Trash className="h-4 w-4 text-red-500" />
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="companies">
              <CompanyManager />
            </TabsContent>

            <TabsContent value="staff">
              <Card>
                <CardHeader>
                  <CardTitle>Staff Management</CardTitle>
                  <CardDescription>
                    Manage staff accounts and permissions
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <AdminPanel />
                </CardContent>
              </Card>
            </TabsContent>
          </div>
        </Tabs>

        {/* Add Admin Dialog */}
        <Dialog open={isAddAdminDialogOpen} onOpenChange={setIsAddAdminDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {currentAdmin ? 'Edit Admin' : 'Add New Admin'}
              </DialogTitle>
              <DialogDescription>
                {currentAdmin
                  ? 'Update admin information'
                  : 'Enter the details for the new admin user'}
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleFormSubmit}>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Enter admin name"
                  />
                </div>

                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="Enter admin email"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="password">
                    {currentAdmin ? "Password (leave blank to keep current)" : "Password"}
                  </Label>
                  <Input
                    id="password"
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    placeholder={currentAdmin ? "••••••••" : "Enter password"}
                    required={!currentAdmin}
                  />
                  {!currentAdmin && (
                    <p className="text-xs text-muted-foreground mt-1">
                      Password must be at least 6 characters
                    </p>
                  )}
                </div>
              </div>

              <DialogFooter className="mt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={resetFormState}
                >
                  Cancel
                </Button>
                <Button type="submit">
                  {currentAdmin ? 'Update' : 'Add'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Confirm Deletion</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete admin {currentAdmin?.name}? This action cannot be undone.
              </DialogDescription>
            </DialogHeader>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={resetFormState}
              >
                Cancel
              </Button>
              <Button
                type="button"
                variant="destructive"
                onClick={confirmDeleteAdmin}
              >
                Delete
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default SuperAdminPanel;
