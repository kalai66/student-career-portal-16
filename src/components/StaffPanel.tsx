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
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Plus, Edit, Trash, Search, X, CheckCircle, XCircle, FileText } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import NavBar from './NavBar';
import CompanyManager from './CompanyManager';
import { profilesDB, studentsDB } from '@/lib/dbHelpers';
import { Profile } from '@/lib/auth';
import { Student } from '@/lib/dbHelpers';

const StaffPanel: React.FC = () => {
  const { toast } = useToast();
  const [students, setStudents] = useState<(Student & { profile?: Profile })[]>([]);
  const [filteredStudents, setFilteredStudents] = useState<(Student & { profile?: Profile })[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isAddStudentDialogOpen, setIsAddStudentDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [currentStudent, setCurrentStudent] = useState<(Student & { profile?: Profile }) | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    registration_number: '',
  });
  const [activeTab, setActiveTab] = useState('students');
  const [pendingResumes, setPendingResumes] = useState<(Student & { profile?: Profile })[]>([]);

  const fetchStudents = async () => {
    try {
      setIsLoading(true);

      // Backend already populates user_id with profile data
      const studentRecords = await studentsDB.getAll();

      // Map user_id (which is already populated) to profile for consistency
      const studentsWithProfiles = studentRecords.map(student => ({
        ...student,
        profile: (student.user_id as any as Profile) || null
      }));

      setStudents(studentsWithProfiles);
      setFilteredStudents(studentsWithProfiles);
    } catch (error) {
      console.error('Error fetching students:', error);
      toast({ title: "Error", description: "Failed to fetch students", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  useEffect(() => {
    const pending = students.filter(s => s.resume_url && s.resume_status === 'pending');
    setPendingResumes(pending);
  }, [students]);

  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredStudents(students);
      return;
    }

    const filtered = students.filter(student =>
      student.profile?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.profile?.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.registration_number?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    setFilteredStudents(filtered);
  }, [searchTerm, students]);

  const handleAddStudent = () => {
    setCurrentStudent(null);
    setFormData({ name: '', email: '', password: '', registration_number: '' });
    setIsAddStudentDialogOpen(true);
  };

  const handleEditStudent = (student: Student & { profile?: Profile }) => {
    setCurrentStudent(student);
    setFormData({
      name: student.profile?.name || '',
      email: student.profile?.email || '',
      password: '',
      registration_number: student.registration_number || '',
    });
    setIsAddStudentDialogOpen(true);
  };

  const handleDeleteStudent = (student: Student & { profile?: Profile }) => {
    setCurrentStudent(student);
    setIsDeleteDialogOpen(true);
  };

  const resetFormState = () => {
    setCurrentStudent(null);
    setFormData({ name: '', email: '', password: '', registration_number: '' });
    setIsAddStudentDialogOpen(false);
    setIsDeleteDialogOpen(false);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim() || !formData.email.trim()) {
      toast({
        title: "Error",
        description: "Name and email are required",
        variant: "destructive"
      });
      return;
    }

    if (!currentStudent && !formData.password) {
      toast({
        title: "Error",
        description: "Password is required for new students",
        variant: "destructive"
      });
      return;
    }

    try {
      if (currentStudent) {
        // Update existing student
        if (currentStudent.profile) {
          await profilesDB.update(currentStudent.profile._id, {
            name: formData.name,
            email: formData.email,
          });

          if (formData.password) {
            const { updatePassword } = await import('@/lib/auth');
            await updatePassword(currentStudent.profile._id, formData.password);
          }
        }

        await studentsDB.update(currentStudent._id, {
          registration_number: formData.registration_number,
        });

        toast({
          title: "Student Updated",
          description: `${formData.name}'s profile has been updated.`,
        });
      } else {
        // Create new student
        const newProfile = await profilesDB.create({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          role: 'student',
        });

        await studentsDB.create({
          user_id: newProfile._id,
          registration_number: formData.registration_number,
          resume_url: null,
          resume_status: 'pending',
        });

        toast({
          title: "Student Created",
          description: `${formData.name} has been added as a student.`,
        });
      }

      resetFormState();
      fetchStudents();
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive"
      });
    }
  };

  const confirmDeleteStudent = async () => {
    if (!currentStudent) return;

    try {
      await studentsDB.delete(currentStudent._id);

      if (currentStudent.profile) {
        await profilesDB.delete(currentStudent.profile._id);
      }

      toast({
        title: "Student Deleted",
        description: `${currentStudent.profile?.name} has been removed.`,
        variant: "destructive"
      });

      resetFormState();
      fetchStudents();
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

  const handleResumeVerification = async (studentId: string, status: 'approved' | 'rejected') => {
    try {
      await studentsDB.update(studentId, { resume_status: status });

      toast({
        title: "Success",
        description: `Resume ${status} successfully`,
      });

      fetchStudents();
    } catch (error) {
      console.error('Error updating resume status:', error);
      toast({
        title: "Error",
        description: "Failed to update resume status",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="panel-container">
      <NavBar title="Campus Recruitment - Staff Panel" />

      <div className="container mx-auto py-8 space-y-6">
        <h1 className="text-3xl font-bold">Staff Dashboard</h1>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full md:w-auto grid-cols-3">
            <TabsTrigger value="students">Student Management</TabsTrigger>
            <TabsTrigger value="resumes">
              Resume Verification
              {pendingResumes.length > 0 && (
                <span className="ml-2 px-2 py-0.5 bg-red-500 text-white text-xs rounded-full">
                  {pendingResumes.length}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="companies">Company Management</TabsTrigger>
          </TabsList>

          <div className="mt-6">
            <TabsContent value="students">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle>Students</CardTitle>
                    <CardDescription>Manage student registrations and records</CardDescription>
                  </div>
                  <Button onClick={handleAddStudent} variant="default" size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Student
                  </Button>
                </CardHeader>

                <CardContent>
                  <div className="mb-4 flex items-center gap-2">
                    <div className="relative flex-grow">
                      <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        placeholder="Search students by name, email, or registration number..."
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
                  ) : filteredStudents.length === 0 ? (
                    <div className="text-center py-4 text-muted-foreground">
                      {searchTerm ? 'No students found matching your search.' : 'No students found. Add some!'}
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Name</TableHead>
                            <TableHead>Email</TableHead>
                            <TableHead>Registration No.</TableHead>
                            <TableHead>Resume Status</TableHead>
                            <TableHead>Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {filteredStudents.map((student) => (
                            <TableRow key={student._id}>
                              <TableCell className="font-medium">{student.profile?.name}</TableCell>
                              <TableCell>{student.profile?.email}</TableCell>
                              <TableCell>{student.registration_number || 'N/A'}</TableCell>
                              <TableCell>
                                <span className={`px-2 py-1 rounded text-xs ${student.resume_status === 'approved' ? 'bg-green-100 text-green-800' :
                                  student.resume_status === 'rejected' ? 'bg-red-100 text-red-800' :
                                    'bg-yellow-100 text-yellow-800'
                                  }`}>
                                  {student.resume_status || 'pending'}
                                </span>
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center gap-2">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleEditStudent(student)}
                                  >
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleDeleteStudent(student)}
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

            <TabsContent value="resumes">
              <Card>
                <CardHeader>
                  <CardTitle>Resume Verification</CardTitle>
                  <CardDescription>Review and approve/reject student resumes</CardDescription>
                </CardHeader>
                <CardContent>
                  {pendingResumes.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <FileText className="h-12 w-12 mx-auto mb-2 opacity-50" />
                      <p>No pending resumes to verify</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {pendingResumes.map((student) => (
                        <Card key={student._id} className="border-2">
                          <CardContent className="pt-6">
                            <div className="flex items-start justify-between">
                              <div className="space-y-2 flex-1">
                                <div>
                                  <h3 className="font-semibold text-lg">{student.profile?.name}</h3>
                                  <p className="text-sm text-muted-foreground">{student.profile?.email}</p>
                                  <p className="text-sm text-muted-foreground">Reg: {student.registration_number || 'N/A'}</p>
                                </div>

                                <div className="pt-2">
                                  <a
                                    href={student.resume_url || '#'}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-primary hover:underline text-sm flex items-center gap-1"
                                  >
                                    <FileText className="h-4 w-4" />
                                    View Resume
                                  </a>
                                </div>
                              </div>

                              <div className="flex gap-2">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="border-green-500 text-green-700 hover:bg-green-50"
                                  onClick={() => handleResumeVerification(student._id, 'approved')}
                                >
                                  <CheckCircle className="h-4 w-4 mr-1" />
                                  Approve
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="border-red-500 text-red-700 hover:bg-red-50"
                                  onClick={() => handleResumeVerification(student._id, 'rejected')}
                                >
                                  <XCircle className="h-4 w-4 mr-1" />
                                  Reject
                                </Button>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Approved Resumes */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-green-700">Approved Resumes</CardTitle>
                  <CardDescription>Resumes that have been approved</CardDescription>
                </CardHeader>
                <CardContent>
                  {students.filter(s => s.resume_status === 'approved').length === 0 ? (
                    <div className="text-center py-6 text-muted-foreground">
                      No approved resumes yet
                    </div>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Name</TableHead>
                          <TableHead>Email</TableHead>
                          <TableHead>Registration</TableHead>
                          <TableHead>Resume</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {students.filter(s => s.resume_status === 'approved').map((student) => (
                          <TableRow key={student._id}>
                            <TableCell className="font-medium">{student.profile?.name}</TableCell>
                            <TableCell>{student.profile?.email}</TableCell>
                            <TableCell>{student.registration_number || 'N/A'}</TableCell>
                            <TableCell>
                              <a
                                href={student.resume_url || '#'}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-primary hover:underline text-sm flex items-center gap-1"
                              >
                                <FileText className="h-4 w-4" />
                                View
                              </a>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </CardContent>
              </Card>

              {/* Rejected Resumes */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-red-700">Rejected Resumes</CardTitle>
                  <CardDescription>Resumes that have been rejected</CardDescription>
                </CardHeader>
                <CardContent>
                  {students.filter(s => s.resume_status === 'rejected').length === 0 ? (
                    <div className="text-center py-6 text-muted-foreground">
                      No rejected resumes
                    </div>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Name</TableHead>
                          <TableHead>Email</TableHead>
                          <TableHead>Registration</TableHead>
                          <TableHead>Resume</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {students.filter(s => s.resume_status === 'rejected').map((student) => (
                          <TableRow key={student._id}>
                            <TableCell className="font-medium">{student.profile?.name}</TableCell>
                            <TableCell>{student.profile?.email}</TableCell>
                            <TableCell>{student.registration_number || 'N/A'}</TableCell>
                            <TableCell>
                              <a
                                href={student.resume_url || '#'}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-primary hover:underline text-sm flex items-center gap-1"
                              >
                                <FileText className="h-4 w-4" />
                                View
                              </a>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="companies">
              <CompanyManager />
            </TabsContent>
          </div>
        </Tabs>

        {/* Add/Edit Student Dialog */}
        <Dialog open={isAddStudentDialogOpen} onOpenChange={setIsAddStudentDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {currentStudent ? 'Edit Student' : 'Add New Student'}
              </DialogTitle>
              <DialogDescription>
                {currentStudent
                  ? 'Update student information'
                  : 'Enter the details for the new student'}
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
                    placeholder="Enter student name"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="Enter student email"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="registration_number">Registration Number</Label>
                  <Input
                    id="registration_number"
                    value={formData.registration_number}
                    onChange={(e) => setFormData({ ...formData, registration_number: e.target.value })}
                    placeholder="e.g., STU2024001"
                  />
                </div>

                <div>
                  <Label htmlFor="password">
                    {currentStudent ? "Password (leave blank to keep current)" : "Password"}
                  </Label>
                  <Input
                    id="password"
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    placeholder={currentStudent ? "••••••••" : "Enter password"}
                    required={!currentStudent}
                  />
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
                  {currentStudent ? 'Update' : 'Add'}
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
                Are you sure you want to delete student {currentStudent?.profile?.name}? This action cannot be undone.
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
                onClick={confirmDeleteStudent}
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

export default StaffPanel;
