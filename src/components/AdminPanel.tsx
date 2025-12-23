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
import { Plus, Edit, Trash, Search, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import NavBar from './NavBar';
import { profilesDB, studentsDB, applicationsDB, companiesDB } from '@/lib/dbHelpers';
import { Profile } from '@/lib/auth';
import { Student } from '@/lib/dbHelpers';

const AdminPanel: React.FC = () => {
  const { toast } = useToast();

  // Staff state
  const [staffUsers, setStaffUsers] = useState<Profile[]>([]);
  const [filteredStaff, setFilteredStaff] = useState<Profile[]>([]);
  const [staffSearchTerm, setStaffSearchTerm] = useState('');

  // Student state
  const [students, setStudents] = useState<(Student & { profile?: Profile })[]>([]);
  const [filteredStudents, setFilteredStudents] = useState<(Student & { profile?: Profile })[]>([]);
  const [studentSearchTerm, setStudentSearchTerm] = useState('');

  // Applications state
  const [applications, setApplications] = useState<any[]>([]);
  const [selectedCompanyFilter, setSelectedCompanyFilter] = useState<string>('all');
  const [companies, setCompanies] = useState<any[]>([]);

  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('staff');

  // Dialog states
  const [isAddStaffDialogOpen, setIsAddStaffDialogOpen] = useState(false);
  const [isDeleteStaffDialogOpen, setIsDeleteStaffDialogOpen] = useState(false);
  const [currentStaff, setCurrentStaff] = useState<Profile | null>(null);

  const [isAddStudentDialogOpen, setIsAddStudentDialogOpen] = useState(false);
  const [isDeleteStudentDialogOpen, setIsDeleteStudentDialogOpen] = useState(false);
  const [currentStudent, setCurrentStudent] = useState<(Student & { profile?: Profile }) | null>(null);

  // Form data
  const [staffFormData, setStaffFormData] = useState({ name: '', email: '', password: '' });
  const [studentFormData, setStudentFormData] = useState({ name: '', email: '', password: '', registration_number: '' });

  // Fetch staff
  const fetchStaff = async () => {
    try {
      setIsLoading(true);
      const staff = await profilesDB.getByRole('staff');
      setStaffUsers(staff);
      setFilteredStaff(staff);
    } catch (error) {
      console.error('Error fetching staff:', error);
      toast({ title: "Error", description: "Failed to fetch staff", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch students
  const fetchStudents = async () => {
    try {
      setIsLoading(true);

      // Backend already populates user_id with profile data
      const studentRecords = await studentsDB.getAll();

      // Map user_id (which is already populated) to profile for consistency
      const studentsWithProfiles = studentRecords.map((student) => ({
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

  // Fetch applications
  const fetchApplications = async () => {
    try {
      const apps = await applicationsDB.getAll();
      setApplications(apps);
    } catch (error) {
      console.error('Error fetching applications:', error);
    }
  };

  // Fetch companies
  const fetchCompanies = async () => {
    try {
      const comps = await companiesDB.getAll();
      setCompanies(comps);
    } catch (error) {
      console.error('Error fetching companies:', error);
    }
  };

  useEffect(() => {
    fetchStaff();
    fetchStudents();
    fetchApplications();
    fetchCompanies();
  }, []);

  // Staff search
  useEffect(() => {
    if (staffSearchTerm.trim() === '') {
      setFilteredStaff(staffUsers);
      return;
    }
    const filtered = staffUsers.filter(staff =>
      staff.name.toLowerCase().includes(staffSearchTerm.toLowerCase()) ||
      staff.email.toLowerCase().includes(staffSearchTerm.toLowerCase())
    );
    setFilteredStaff(filtered);
  }, [staffSearchTerm, staffUsers]);

  // Student search
  useEffect(() => {
    if (studentSearchTerm.trim() === '') {
      setFilteredStudents(students);
      return;
    }
    const filtered = students.filter(student =>
      student.profile?.name.toLowerCase().includes(studentSearchTerm.toLowerCase()) ||
      student.profile?.email.toLowerCase().includes(studentSearchTerm.toLowerCase()) ||
      student.registration_number?.toLowerCase().includes(studentSearchTerm.toLowerCase())
    );
    setFilteredStudents(filtered);
  }, [studentSearchTerm, students]);

  // Staff handlers
  const handleAddStaff = () => {
    setCurrentStaff(null);
    setStaffFormData({ name: '', email: '', password: '' });
    setIsAddStaffDialogOpen(true);
  };

  const handleEditStaff = (staff: Profile) => {
    setCurrentStaff(staff);
    setStaffFormData({ name: staff.name, email: staff.email, password: '' });
    setIsAddStaffDialogOpen(true);
  };

  const handleDeleteStaff = (staff: Profile) => {
    setCurrentStaff(staff);
    setIsDeleteStaffDialogOpen(true);
  };

  const handleStaffFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!staffFormData.name.trim() || !staffFormData.email.trim()) {
      toast({ title: "Error", description: "Name and email are required", variant: "destructive" });
      return;
    }
    if (!currentStaff && !staffFormData.password) {
      toast({ title: "Error", description: "Password is required for new staff", variant: "destructive" });
      return;
    }

    try {
      if (currentStaff) {
        await profilesDB.update(currentStaff._id, { name: staffFormData.name, email: staffFormData.email });
        if (staffFormData.password) {
          const { updatePassword } = await import('@/lib/auth');
          await updatePassword(currentStaff._id, staffFormData.password);
        }
        toast({ title: "Success", description: `${staffFormData.name} updated successfully` });
      } else {
        await profilesDB.create({ ...staffFormData, role: 'staff' });
        toast({ title: "Success", description: `${staffFormData.name} added as staff` });
      }

      // Close dialog and reset state
      setIsAddStaffDialogOpen(false);
      setCurrentStaff(null);
      setStaffFormData({ name: '', email: '', password: '' });

      // Fetch updated data
      await fetchStaff();
    } catch (error) {
      console.error('Error saving staff:', error);
      toast({ title: "Error", description: "Failed to save staff member", variant: "destructive" });
    }
  };

  const confirmDeleteStaff = async () => {
    if (!currentStaff) return;
    try {
      await profilesDB.delete(currentStaff._id);
      toast({ title: "Success", description: `${currentStaff.name} deleted` });
      setIsDeleteStaffDialogOpen(false);
      fetchStaff();
    } catch (error) {
      toast({ title: "Error", description: "Failed to delete staff member", variant: "destructive" });
    }
  };

  // Student handlers
  const handleAddStudent = () => {
    setCurrentStudent(null);
    setStudentFormData({ name: '', email: '', password: '', registration_number: '' });
    setTimeout(() => {
      setIsAddStudentDialogOpen(true);
    }, 0);
  };

  const handleEditStudent = (student: Student & { profile?: Profile }) => {
    setCurrentStudent(student);
    setStudentFormData({
      name: student.profile?.name || '',
      email: student.profile?.email || '',
      password: '',
      registration_number: student.registration_number || '',
    });
    setIsAddStudentDialogOpen(true);
  };

  const handleDeleteStudent = (student: Student & { profile?: Profile }) => {
    setCurrentStudent(student);
    setIsDeleteStudentDialogOpen(true);
  };

  const handleStudentFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentFormData.name.trim() || !studentFormData.email.trim()) {
      toast({ title: "Error", description: "Name and email are required", variant: "destructive" });
      return;
    }
    if (!currentStudent && !studentFormData.password) {
      toast({ title: "Error", description: "Password is required for new students", variant: "destructive" });
      return;
    }

    try {
      if (currentStudent) {
        if (currentStudent.profile) {
          await profilesDB.update(currentStudent.profile._id, { name: studentFormData.name, email: studentFormData.email });
          if (studentFormData.password) {
            const { updatePassword } = await import('@/lib/auth');
            await updatePassword(currentStudent.profile._id, studentFormData.password);
          }
        }
        await studentsDB.update(currentStudent._id, { registration_number: studentFormData.registration_number });
        toast({ title: "Success", description: `${studentFormData.name} updated successfully` });
      } else {
        const newProfile = await profilesDB.create({ name: studentFormData.name, email: studentFormData.email, password: studentFormData.password, role: 'student' });
        await studentsDB.create({ user_id: newProfile._id, registration_number: studentFormData.registration_number, resume_url: null, resume_status: 'pending' });
        toast({ title: "Success", description: `${studentFormData.name} added as student` });
      }

      // Close dialog first
      setIsAddStudentDialogOpen(false);
      setCurrentStudent(null);
      setStudentFormData({ name: '', email: '', password: '', registration_number: '' });

      // Then fetch updated data
      await fetchStudents();
    } catch (error) {
      console.error('Error saving student:', error);
      toast({ title: "Error", description: "Failed to save student", variant: "destructive" });
    }
  };

  const confirmDeleteStudent = async () => {
    if (!currentStudent) return;
    try {
      await studentsDB.delete(currentStudent._id);
      if (currentStudent.profile) await profilesDB.delete(currentStudent.profile._id);
      toast({ title: "Success", description: `${currentStudent.profile?.name} deleted` });
      setIsDeleteStudentDialogOpen(false);
      fetchStudents();
    } catch (error) {
      toast({ title: "Error", description: "Failed to delete student", variant: "destructive" });
    }
  };

  return (
    <div className="panel-container">
      <NavBar title="Campus Recruitment - Admin Panel" />

      <div className="container mx-auto py-8 space-y-6">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full md:w-auto grid-cols-3">
            <TabsTrigger value="staff">Staff Management</TabsTrigger>
            <TabsTrigger value="students">Student Management</TabsTrigger>
            <TabsTrigger value="applications">Applications</TabsTrigger>
          </TabsList>

          <div className="mt-6">
            {/* Staff Management Tab */}
            <TabsContent value="staff">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle>Staff Members</CardTitle>
                    <CardDescription>Manage staff accounts and permissions</CardDescription>
                  </div>
                  <Button onClick={handleAddStaff} size="sm">
                    <Plus className="h-4 w-4 mr-2" /> Add Staff
                  </Button>
                </CardHeader>
                <CardContent>
                  <div className="mb-4">
                    <div className="relative">
                      <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input placeholder="Search staff..." value={staffSearchTerm} onChange={(e) => setStaffSearchTerm(e.target.value)} className="pl-8" />
                      {staffSearchTerm && <button className="absolute right-2 top-1/2 -translate-y-1/2" onClick={() => setStaffSearchTerm('')}><X className="h-4 w-4" /></button>}
                    </div>
                  </div>

                  {isLoading ? <div className="text-center py-4">Loading...</div> : filteredStaff.length === 0 ? (
                    <div className="text-center py-4 text-muted-foreground">No staff members found</div>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Name</TableHead>
                          <TableHead>Email</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredStaff.map((staff) => (
                          <TableRow key={staff._id}>
                            <TableCell className="font-medium">{staff.name}</TableCell>
                            <TableCell>{staff.email}</TableCell>
                            <TableCell>
                              <div className="flex gap-2">
                                <Button variant="ghost" size="sm" onClick={() => handleEditStaff(staff)}><Edit className="h-4 w-4" /></Button>
                                <Button variant="ghost" size="sm" onClick={() => handleDeleteStaff(staff)}><Trash className="h-4 w-4 text-red-500" /></Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Student Management Tab */}
            <TabsContent value="students">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle>Students</CardTitle>
                    <CardDescription>Manage student registrations</CardDescription>
                  </div>
                  <Button onClick={handleAddStudent} size="sm">
                    <Plus className="h-4 w-4 mr-2" /> Add Student
                  </Button>
                </CardHeader>
                <CardContent>
                  <div className="mb-4">
                    <div className="relative">
                      <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input placeholder="Search students..." value={studentSearchTerm} onChange={(e) => setStudentSearchTerm(e.target.value)} className="pl-8" />
                      {studentSearchTerm && <button className="absolute right-2 top-1/2 -translate-y-1/2" onClick={() => setStudentSearchTerm('')}><X className="h-4 w-4" /></button>}
                    </div>
                  </div>

                  {isLoading ? <div className="text-center py-4">Loading...</div> : filteredStudents.length === 0 ? (
                    <div className="text-center py-4 text-muted-foreground">No students found</div>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Name</TableHead>
                          <TableHead>Email</TableHead>
                          <TableHead>Registration No.</TableHead>
                          <TableHead>Resume Status</TableHead>
                          <TableHead>Company Applied</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredStudents.map((student) => {
                          // Find companies this student has applied to
                          const studentApplications = applications.filter(
                            (app: any) => app.student_id?._id === student._id
                          );
                          const appliedCompanies = studentApplications.map((app: any) => {
                            return app.company_id?.name || 'Unknown';
                          });

                          return (
                            <TableRow key={student._id}>
                              <TableCell className="font-medium">{student.profile?.name || 'No name'}</TableCell>
                              <TableCell>{student.profile?.email || 'No email'}</TableCell>
                              <TableCell>{student.registration_number || 'N/A'}</TableCell>
                              <TableCell>
                                <span className={`px-2 py-1 rounded text-xs ${student.resume_status === 'approved' ? 'bg-green-100 text-green-800' : student.resume_status === 'rejected' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'}`}>
                                  {student.resume_status || 'pending'}
                                </span>
                              </TableCell>
                              <TableCell>
                                {appliedCompanies.length > 0 ? (
                                  <div className="flex flex-wrap gap-1">
                                    {appliedCompanies.map((companyName, idx) => (
                                      <span key={idx} className="px-2 py-1 rounded text-xs bg-blue-100 text-blue-800">
                                        {companyName}
                                      </span>
                                    ))}
                                  </div>
                                ) : (
                                  <span className="text-xs text-muted-foreground">Not applied</span>
                                )}
                              </TableCell>
                              <TableCell>
                                <div className="flex gap-2">
                                  <Button variant="ghost" size="sm" onClick={() => handleEditStudent(student)}><Edit className="h-4 w-4" /></Button>
                                  <Button variant="ghost" size="sm" onClick={() => handleDeleteStudent(student)}><Trash className="h-4 w-4 text-red-500" /></Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Applications Tab */}
            <TabsContent value="applications">
              <div className="space-y-6">
                {/* Statistics Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <Card>
                    <CardHeader className="pb-3">
                      <CardDescription>Total Students</CardDescription>
                      <CardTitle className="text-3xl">{students.length}</CardTitle>
                    </CardHeader>
                  </Card>
                  <Card>
                    <CardHeader className="pb-3">
                      <CardDescription>Students Applied</CardDescription>
                      <CardTitle className="text-3xl text-green-600">
                        {new Set(applications.map((app: any) => app.student_id?._id).filter(Boolean)).size}
                      </CardTitle>
                    </CardHeader>
                  </Card>
                  <Card>
                    <CardHeader className="pb-3">
                      <CardDescription>Students Not Applied</CardDescription>
                      <CardTitle className="text-3xl text-orange-600">
                        {students.length - new Set(applications.map((app: any) => app.student_id?._id).filter(Boolean)).size}
                      </CardTitle>
                    </CardHeader>
                  </Card>
                  <Card>
                    <CardHeader className="pb-3">
                      <CardDescription>Total Applications</CardDescription>
                      <CardTitle className="text-3xl text-blue-600">{applications.length}</CardTitle>
                    </CardHeader>
                  </Card>
                </div>

                {/* Company Filter */}
                <Card>
                  <CardHeader>
                    <CardTitle>Filter Applications</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-4">
                      <Label htmlFor="company-filter">Company:</Label>
                      <select
                        id="company-filter"
                        className="w-full md:w-64 p-2 border rounded-md"
                        value={selectedCompanyFilter}
                        onChange={(e) => setSelectedCompanyFilter(e.target.value)}
                      >
                        <option value="all">All Companies</option>
                        {companies.map((company) => (
                          <option key={company._id} value={company._id}>
                            {company.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </CardContent>
                </Card>

                {/* Applied Students List */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-green-700">Applied Students</CardTitle>
                    <CardDescription>
                      Students who have applied to companies
                      {selectedCompanyFilter !== 'all' && ` (Filtered by ${companies.find(c => c._id === selectedCompanyFilter)?.name})`}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {applications.filter((app: any) =>
                      selectedCompanyFilter === 'all' || app.company_id === selectedCompanyFilter
                    ).length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">
                        No applications found
                      </div>
                    ) : (
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Student Name</TableHead>
                            <TableHead>Email</TableHead>
                            <TableHead>Registration No.</TableHead>
                            <TableHead>Company</TableHead>
                            <TableHead>Applied Date</TableHead>
                            <TableHead>Status</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {applications
                            .filter((app: any) =>
                              selectedCompanyFilter === 'all' || app.company_id?._id === selectedCompanyFilter
                            )
                            .map((app: any) => {
                              // Backend populates student_id with full Student object including user_id (Profile)
                              const studentProfile = app.student_id?.user_id;
                              const companyName = app.company_id?.name;
                              return (
                                <TableRow key={app._id}>
                                  <TableCell className="font-medium">
                                    {studentProfile?.name || 'Unknown'}
                                  </TableCell>
                                  <TableCell>{studentProfile?.email || 'N/A'}</TableCell>
                                  <TableCell>{app.student_id?.registration_number || 'N/A'}</TableCell>
                                  <TableCell>{companyName || 'Unknown'}</TableCell>
                                  <TableCell>
                                    {new Date(app.applied_at).toLocaleDateString()}
                                  </TableCell>
                                  <TableCell>
                                    <span className={`px-2 py-1 rounded text-xs ${app.status === 'accepted' ? 'bg-green-100 text-green-800' :
                                      app.status === 'rejected' ? 'bg-red-100 text-red-800' :
                                        'bg-yellow-100 text-yellow-800'
                                      }`}>
                                      {app.status}
                                    </span>
                                  </TableCell>
                                </TableRow>
                              );
                            })}
                        </TableBody>
                      </Table>
                    )}
                  </CardContent>
                </Card>

                {/* Not Applied Students List */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-orange-700">Students Not Applied</CardTitle>
                    <CardDescription>Students who haven't applied to any company yet</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {(() => {
                      // Since backend populates student_id, extract the _id
                      const appliedStudentIds = new Set(
                        applications.map((app: any) => app.student_id?._id).filter(Boolean)
                      );
                      const notAppliedStudents = students.filter(
                        (student: any) => !appliedStudentIds.has(student._id)
                      );

                      return notAppliedStudents.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">
                          All students have applied!
                        </div>
                      ) : (
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Student Name</TableHead>
                              <TableHead>Email</TableHead>
                              <TableHead>Registration No.</TableHead>
                              <TableHead>Resume Status</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {notAppliedStudents.map((student: any) => (
                              <TableRow key={student._id}>
                                <TableCell className="font-medium">
                                  {student.profile?.name || 'No name'}
                                </TableCell>
                                <TableCell>{student.profile?.email || 'No email'}</TableCell>
                                <TableCell>{student.registration_number || 'N/A'}</TableCell>
                                <TableCell>
                                  <span className={`px-2 py-1 rounded text-xs ${student.resume_status === 'approved' ? 'bg-green-100 text-green-800' :
                                    student.resume_status === 'rejected' ? 'bg-red-100 text-red-800' :
                                      'bg-yellow-100 text-yellow-800'
                                    }`}>
                                    {student.resume_status || 'pending'}
                                  </span>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      );
                    })()}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </div>
        </Tabs>

        {/* Staff Dialogs */}
        <Dialog open={isAddStaffDialogOpen} onOpenChange={setIsAddStaffDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{currentStaff ? 'Edit Staff Member' : 'Add New Staff Member'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleStaffFormSubmit} className="space-y-4">
              <div>
                <Label>Name</Label>
                <Input value={staffFormData.name} onChange={(e) => setStaffFormData({ ...staffFormData, name: e.target.value })} required />
              </div>
              <div>
                <Label>Email</Label>
                <Input type="email" value={staffFormData.email} onChange={(e) => setStaffFormData({ ...staffFormData, email: e.target.value })} required />
              </div>
              <div>
                <Label>{currentStaff ? 'Password (leave blank to keep current)' : 'Password'}</Label>
                <Input type="password" value={staffFormData.password} onChange={(e) => setStaffFormData({ ...staffFormData, password: e.target.value })} required={!currentStaff} />
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsAddStaffDialogOpen(false)}>Cancel</Button>
                <Button type="submit">{currentStaff ? 'Update' : 'Add'}</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        <Dialog open={isDeleteStaffDialogOpen} onOpenChange={setIsDeleteStaffDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Confirm Deletion</DialogTitle>
              <DialogDescription>Are you sure you want to delete {currentStaff?.name}?</DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDeleteStaffDialogOpen(false)}>Cancel</Button>
              <Button variant="destructive" onClick={confirmDeleteStaff}>Delete</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Student Dialogs */}
        <Dialog open={isAddStudentDialogOpen} onOpenChange={setIsAddStudentDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{currentStudent ? 'Edit Student' : 'Add New Student'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleStudentFormSubmit} className="space-y-4">
              <div>
                <Label>Name</Label>
                <Input value={studentFormData.name} onChange={(e) => setStudentFormData({ ...studentFormData, name: e.target.value })} required />
              </div>
              <div>
                <Label>Email</Label>
                <Input type="email" value={studentFormData.email} onChange={(e) => setStudentFormData({ ...studentFormData, email: e.target.value })} required />
              </div>
              <div>
                <Label>Registration Number</Label>
                <Input value={studentFormData.registration_number} onChange={(e) => setStudentFormData({ ...studentFormData, registration_number: e.target.value })} />
              </div>
              <div>
                <Label>{currentStudent ? 'Password (leave blank to keep current)' : 'Password'}</Label>
                <Input type="password" value={studentFormData.password} onChange={(e) => setStudentFormData({ ...studentFormData, password: e.target.value })} required={!currentStudent} />
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsAddStudentDialogOpen(false)}>Cancel</Button>
                <Button type="submit">{currentStudent ? 'Update' : 'Add'}</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        <Dialog open={isDeleteStudentDialogOpen} onOpenChange={setIsDeleteStudentDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Confirm Deletion</DialogTitle>
              <DialogDescription>Are you sure you want to delete {currentStudent?.profile?.name}?</DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDeleteStudentDialogOpen(false)}>Cancel</Button>
              <Button variant="destructive" onClick={confirmDeleteStudent}>Delete</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default AdminPanel;
