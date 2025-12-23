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
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Search, X, Building2, MapPin, Calendar, Briefcase, Upload, CheckCircle, XCircle, Clock, FileText } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import NavBar from './NavBar';
import { companiesDB, studentsDB, applicationsDB, Company } from '@/lib/dbHelpers';
import { useAuth } from '@/contexts/AuthContext';

const StudentPanel: React.FC = () => {
  const { currentUser } = useAuth();
  const { toast } = useToast();
  const [companies, setCompanies] = useState<Company[]>([]);
  const [filteredCompanies, setFilteredCompanies] = useState<Company[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [studentInfo, setStudentInfo] = useState<any>(null);
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [resumeUrl, setResumeUrl] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [myApplications, setMyApplications] = useState<any[]>([]);
  const [appliedCompanyIds, setAppliedCompanyIds] = useState<Set<string>>(new Set());

  const fetchCompanies = async () => {
    try {
      setIsLoading(true);
      const allCompanies = await companiesDB.getAll();
      console.log('Fetched companies for students:', allCompanies);
      setCompanies(allCompanies);
      setFilteredCompanies(allCompanies);
    } catch (error) {
      console.error('Error fetching companies:', error);
      toast({
        title: "Error",
        description: "Failed to fetch companies",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchStudentInfo = async () => {
    if (!currentUser) return;

    try {
      const student = await studentsDB.getByUserId(currentUser._id);
      setStudentInfo(student);

      // Fetch applications if student exists
      if (student) {
        fetchMyApplications(student._id);
      }
    } catch (error) {
      console.error('Error fetching student info:', error);
    }
  };

  const fetchMyApplications = async (studentId: string) => {
    try {
      const applications = await applicationsDB.getByStudent(studentId);
      setMyApplications(applications);

      // Create a set of applied company IDs for quick lookup
      const appliedIds = new Set(applications.map((app: any) => app.company_id));
      setAppliedCompanyIds(appliedIds);
    } catch (error) {
      console.error('Error fetching applications:', error);
    }
  };

  const handleApplyNow = async (companyId: string) => {
    if (!studentInfo) {
      toast({
        title: "Error",
        description: "Student information not found. Please refresh the page.",
        variant: "destructive"
      });
      return;
    }

    try {
      await applicationsDB.create({
        student_id: studentInfo._id,
        company_id: companyId
      });

      toast({
        title: "Application Submitted!",
        description: "Your application has been submitted successfully."
      });

      // Refresh applications
      fetchMyApplications(studentInfo._id);

      // Close dialog
      setSelectedCompany(null);
    } catch (error: any) {
      toast({
        title: "Application Failed",
        description: error.message || "Failed to submit application",
        variant: "destructive"
      });
    }
  };

  useEffect(() => {
    fetchCompanies();
    fetchStudentInfo();
  }, [currentUser]);

  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredCompanies(companies);
      return;
    }

    const filtered = companies.filter(company =>
      company.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      company.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
      company.description.toLowerCase().includes(searchTerm.toLowerCase())
    );

    setFilteredCompanies(filtered);
  }, [searchTerm, companies]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).format(date);
  };

  const isDeadlinePassed = (deadline: string) => {
    return new Date(deadline) < new Date();
  };

  const handleResumeUpload = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!resumeUrl.trim()) {
      toast({
        title: "Error",
        description: "Please enter a resume URL",
        variant: "destructive"
      });
      return;
    }

    if (!studentInfo) {
      toast({
        title: "Error",
        description: "Student record not found",
        variant: "destructive"
      });
      return;
    }

    try {
      setIsUploading(true);
      await studentsDB.update(studentInfo._id, {
        resume_url: resumeUrl,
        resume_status: 'pending'
      });

      toast({
        title: "Success",
        description: "Resume uploaded successfully! Awaiting staff verification."
      });

      // Refresh student info
      fetchStudentInfo();
      setResumeUrl('');
    } catch (error) {
      console.error('Error uploading resume:', error);
      toast({
        title: "Error",
        description: "Failed to upload resume",
        variant: "destructive"
      });
    } finally {
      setIsUploading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'rejected':
        return <XCircle className="h-4 w-4 text-red-600" />;
      default:
        return <Clock className="h-4 w-4 text-yellow-600" />;
    }
  };

  return (
    <div className="panel-container">
      <NavBar title="Campus Recruitment - Student Portal" />

      <div className="container mx-auto py-8 space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Welcome, {currentUser?.name}!</h1>
            <p className="text-muted-foreground mt-1">
              {studentInfo?.registration_number ? `Registration: ${studentInfo.registration_number}` : 'Student Portal'}
            </p>
          </div>
        </div>

        <Tabs defaultValue="companies" className="w-full">
          <TabsList className="grid w-full md:w-auto grid-cols-2">
            <TabsTrigger value="companies">Available Companies</TabsTrigger>
            <TabsTrigger value="profile">My Profile</TabsTrigger>
          </TabsList>

          <div className="mt-6">
            <TabsContent value="companies">
              <Card>
                <CardHeader>
                  <CardTitle>Job Opportunities</CardTitle>
                  <CardDescription>Browse and explore companies hiring on campus</CardDescription>
                </CardHeader>

                <CardContent>
                  <div className="mb-6 flex items-center gap-2">
                    <div className="relative flex-grow">
                      <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        placeholder="Search companies by name, location, or description..."
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
                    <div className="text-center py-8">Loading companies...</div>
                  ) : filteredCompanies.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      {searchTerm ? 'No companies found matching your search.' : 'No companies available at the moment.'}
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {filteredCompanies.map((company) => (
                        <Card key={company._id} className="hover:shadow-lg transition-shadow">
                          <CardHeader>
                            <div className="flex items-start justify-between">
                              <div className="flex items-center gap-2">
                                <Building2 className="h-5 w-5 text-primary" />
                                <CardTitle className="text-lg">{company.name}</CardTitle>
                              </div>
                              {isDeadlinePassed(company.deadline) && (
                                <span className="text-xs px-2 py-1 bg-red-100 text-red-800 rounded">
                                  Closed
                                </span>
                              )}
                            </div>
                            <CardDescription className="line-clamp-2">
                              {company.description}
                            </CardDescription>
                          </CardHeader>
                          <CardContent className="space-y-3">
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <MapPin className="h-4 w-4" />
                              <span>{company.location}</span>
                            </div>

                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <Calendar className="h-4 w-4" />
                              <span>Deadline: {formatDate(company.deadline)}</span>
                            </div>

                            <div className="flex items-start gap-2 text-sm">
                              <Briefcase className="h-4 w-4 mt-0.5 text-muted-foreground" />
                              <div className="flex-1">
                                <p className="font-medium mb-1">Positions:</p>
                                <div className="flex flex-wrap gap-1">
                                  {company.positions.map((position, idx) => (
                                    <span
                                      key={idx}
                                      className="text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded"
                                    >
                                      {position}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            </div>

                            <div className="pt-2">
                              <p className="text-sm font-medium mb-2">Requirements:</p>
                              <ul className="text-xs space-y-1 text-muted-foreground">
                                {company.requirements.slice(0, 3).map((req, idx) => (
                                  <li key={idx} className="flex items-start gap-1">
                                    <span className="text-primary">•</span>
                                    <span>{req}</span>
                                  </li>
                                ))}
                                {company.requirements.length > 3 && (
                                  <li className="text-primary">+{company.requirements.length - 3} more</li>
                                )}
                              </ul>
                            </div>

                            <Button
                              className="w-full mt-4"
                              variant={isDeadlinePassed(company.deadline) ? "outline" : "default"}
                              disabled={isDeadlinePassed(company.deadline)}
                              onClick={() => setSelectedCompany(company)}
                            >
                              {isDeadlinePassed(company.deadline) ? 'Applications Closed' : 'View Details'}
                            </Button>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="profile">
              <Card>
                <CardHeader>
                  <CardTitle>My Profile</CardTitle>
                  <CardDescription>Your student information and application status</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Student Information */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 bg-muted rounded-lg">
                      <p className="text-sm text-muted-foreground mb-1">Full Name</p>
                      <p className="font-semibold text-lg">{currentUser?.name || 'N/A'}</p>
                    </div>
                    <div className="p-4 bg-muted rounded-lg">
                      <p className="text-sm text-muted-foreground mb-1">Email Address</p>
                      <p className="font-semibold text-lg">{currentUser?.email || 'N/A'}</p>
                    </div>
                    <div className="p-4 bg-muted rounded-lg">
                      <p className="text-sm text-muted-foreground mb-1">Registration Number</p>
                      <p className="font-semibold text-lg">{studentInfo?.registration_number || 'Not assigned'}</p>
                    </div>
                    <div className="p-4 bg-muted rounded-lg">
                      <p className="text-sm text-muted-foreground mb-1">Resume Status</p>
                      <span className={`inline-block px-3 py-1.5 rounded-md text-sm font-medium ${studentInfo?.resume_status === 'approved' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' :
                        studentInfo?.resume_status === 'rejected' ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400' :
                          'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
                        }`}>
                        {studentInfo?.resume_status === 'approved' ? '✓ Approved' :
                          studentInfo?.resume_status === 'rejected' ? '✗ Rejected' :
                            '⏳ Pending'}
                      </span>
                    </div>
                  </div>

                  {/* Resume Section */}
                  <div className="pt-4 border-t">
                    <p className="font-semibold mb-3">Resume</p>
                    {studentInfo?.resume_url ? (
                      <div className="mb-4 p-4 bg-green-50 dark:bg-green-900/20 border-2 border-green-200 dark:border-green-800 rounded-lg">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-green-100 dark:bg-green-900/40 rounded-full">
                              <FileText className="h-6 w-6 text-green-600 dark:text-green-400" />
                            </div>
                            <div>
                              <p className="font-semibold text-green-900 dark:text-green-100">Resume Uploaded</p>
                              <p className="text-sm text-green-700 dark:text-green-300">Click to view your resume</p>
                            </div>
                          </div>
                          <Button
                            asChild
                            className="bg-green-600 hover:bg-green-700 text-white"
                          >
                            <a
                              href={studentInfo.resume_url}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              <FileText className="h-4 w-4 mr-2" />
                              View Resume
                            </a>
                          </Button>
                        </div>
                        <p className="text-xs text-green-600 dark:text-green-400 mt-3">
                          You can update your resume by submitting a new URL below
                        </p>
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground mb-4">No resume uploaded yet</p>
                    )}

                    {/* Resume Upload Form */}
                    <div className="p-4 bg-muted/30 rounded-lg border">
                      <Label htmlFor="resume-url" className="text-sm font-medium mb-2 block">
                        Resume URL
                      </Label>
                      <div className="flex gap-2">
                        <Input
                          id="resume-url"
                          type="url"
                          placeholder="https://drive.google.com/... or https://dropbox.com/..."
                          value={resumeUrl}
                          onChange={(e) => setResumeUrl(e.target.value)}
                          className="flex-1"
                        />
                        <Button
                          onClick={handleResumeUpload}
                          disabled={isUploading || !resumeUrl.trim()}
                        >
                          <Upload className="h-4 w-4 mr-2" />
                          {isUploading ? 'Uploading...' : 'Upload'}
                        </Button>
                      </div>
                      <p className="text-xs text-muted-foreground mt-2">
                        📌 Upload your resume by pasting a shareable link (e.g., Google Drive, Dropbox)
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </div>
        </Tabs>

        {/* Company Details Dialog */}
        {selectedCompany && (
          <Dialog open={!!selectedCompany} onOpenChange={() => setSelectedCompany(null)}>
            <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="text-2xl">{selectedCompany.name}</DialogTitle>
                <DialogDescription>{selectedCompany.location}</DialogDescription>
              </DialogHeader>

              <div className="space-y-6 py-4">
                {/* Description */}
                <div>
                  <h3 className="font-semibold mb-2">About the Company</h3>
                  <p className="text-sm text-muted-foreground">{selectedCompany.description}</p>
                </div>

                {/* Deadline */}
                <div className="flex items-center gap-2 p-4 bg-muted rounded-lg">
                  <Calendar className="h-5 w-5 text-primary" />
                  <div>
                    <p className="text-sm font-medium">Application Deadline</p>
                    <p className="text-lg font-semibold">{formatDate(selectedCompany.deadline)}</p>
                    {isDeadlinePassed(selectedCompany.deadline) && (
                      <span className="text-xs text-red-600 font-medium">Applications Closed</span>
                    )}
                  </div>
                </div>

                {/* Positions */}
                <div>
                  <h3 className="font-semibold mb-3 flex items-center gap-2">
                    <Briefcase className="h-4 w-4" />
                    Available Positions
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedCompany.positions.map((position, idx) => (
                      <span
                        key={idx}
                        className="px-3 py-1.5 bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 rounded-md text-sm font-medium"
                      >
                        {position}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Requirements */}
                <div>
                  <h3 className="font-semibold mb-3">Requirements & Qualifications</h3>
                  <ul className="space-y-2">
                    {selectedCompany.requirements.map((req, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="text-primary mt-1">✓</span>
                        <span className="text-sm">{req}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Location */}
                <div className="flex items-center gap-2 p-4 bg-muted rounded-lg">
                  <MapPin className="h-5 w-5 text-primary" />
                  <div>
                    <p className="text-sm font-medium">Location</p>
                    <p className="font-semibold">{selectedCompany.location}</p>
                  </div>
                </div>
              </div>

              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setSelectedCompany(null)}
                >
                  Close
                </Button>
                <Button
                  disabled={isDeadlinePassed(selectedCompany.deadline) || appliedCompanyIds.has(selectedCompany._id)}
                  onClick={() => handleApplyNow(selectedCompany._id)}
                >
                  {appliedCompanyIds.has(selectedCompany._id) ? 'Already Applied' : isDeadlinePassed(selectedCompany.deadline) ? 'Applications Closed' : 'Apply Now'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </div>
  );
};

export default StudentPanel;
