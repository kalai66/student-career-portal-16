
import React, { useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "@/components/ui/use-toast";
import { Plus, Search, X } from "lucide-react";
import { supabase } from '@/integrations/supabase/client';
import CompanyForm from './CompanyForm';
import CompanyDisplay from './CompanyDisplay';

interface Company {
  id: string;
  name: string;
  industry?: string;
  location: string;
  website?: string;
  created_at: string;
  description: string;
  positions: string[];
  deadline: string;
  requirements: string[];
  posted_by: string;
}

const CompanyManager: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isCompanyFormOpen, setIsCompanyFormOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [currentCompany, setCurrentCompany] = useState<Company | null>(null);
  
  const handleAddCompany = () => {
    setCurrentCompany(null);
    setIsCompanyFormOpen(true);
  };
  
  const handleEditCompany = (company: Company) => {
    setCurrentCompany(company);
    setIsCompanyFormOpen(true);
  };
  
  const handleDeleteCompany = (company: Company) => {
    setCurrentCompany(company);
    setIsDeleteDialogOpen(true);
  };
  
  const confirmDeleteCompany = async () => {
    if (!currentCompany) return;
    
    try {
      const { error } = await supabase
        .from('companies')
        .delete()
        .eq('id', currentCompany.id);
        
      if (error) {
        console.error('Error deleting company:', error);
        toast({
          title: "Error",
          description: `Failed to delete company. ${error.message}`,
          variant: "destructive"
        });
        return;
      }
      
      toast({
        title: "Company Deleted",
        description: `${currentCompany.name} has been removed.`,
      });
      
      setIsDeleteDialogOpen(false);
      setCurrentCompany(null);
      
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive"
      });
    }
  };

  const handleCompanyFormSuccess = () => {
    setIsCompanyFormOpen(false);
    setCurrentCompany(null);
    // Data will be refreshed via the real-time subscription
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Companies</CardTitle>
          <Button onClick={handleAddCompany} variant="default" size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Add Company
          </Button>
        </CardHeader>
        
        <CardContent>
          <div className="mb-4 flex items-center gap-2">
            <div className="relative flex-grow">
              <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search companies by name, industry or location..."
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
          
          <CompanyDisplay isAdmin={true} onEdit={handleEditCompany} />
        </CardContent>
      </Card>
      
      {/* Company Form Dialog */}
      <Dialog open={isCompanyFormOpen} onOpenChange={setIsCompanyFormOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {currentCompany ? 'Edit Company' : 'Add New Company'}
            </DialogTitle>
            <DialogDescription>
              {currentCompany 
                ? 'Update company information'
                : 'Enter the details for the new company'}
            </DialogDescription>
          </DialogHeader>
          
          <CompanyForm 
            company={currentCompany} 
            onClose={() => setIsCompanyFormOpen(false)}
            isOpen={isCompanyFormOpen}
            onSave={handleCompanyFormSuccess}
          />
        </DialogContent>
      </Dialog>
      
      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete {currentCompany?.name}? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          
          <DialogFooter>
            <Button 
              type="button"
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button 
              type="button" 
              variant="destructive" 
              onClick={confirmDeleteCompany}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CompanyManager;
