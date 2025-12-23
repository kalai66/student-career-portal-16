import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { companiesDB } from '@/lib/dbHelpers';
import { Company } from '@/lib/dbHelpers';

interface CompanyFormProps {
  onClose: () => void;
  company?: Company | null;
}

const CompanyForm: React.FC<CompanyFormProps> = ({ onClose, company }) => {
  const { currentUser } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    location: '',
    deadline: new Date().toISOString().split('T')[0],
  });
  const [newPosition, setNewPosition] = useState('');
  const [newRequirement, setNewRequirement] = useState('');
  const [positions, setPositions] = useState<string[]>([]);
  const [requirements, setRequirements] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (company) {
      setFormData({
        name: company.name,
        description: company.description,
        location: company.location,
        deadline: company.deadline,
      });
      setPositions(company.positions || []);
      setRequirements(company.requirements || []);
    }
  }, [company]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleAddPosition = () => {
    if (newPosition.trim()) {
      setPositions([...positions, newPosition.trim()]);
      setNewPosition('');
    }
  };

  const handleAddRequirement = () => {
    if (newRequirement.trim()) {
      setRequirements([...requirements, newRequirement.trim()]);
      setNewRequirement('');
    }
  };

  const handleRemovePosition = (index: number) => {
    setPositions(positions.filter((_, i) => i !== index));
  };

  const handleRemoveRequirement = (index: number) => {
    setRequirements(requirements.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.description || !formData.location || !formData.deadline) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    if (positions.length === 0) {
      toast({
        title: "Error",
        description: "Please add at least one position",
        variant: "destructive"
      });
      return;
    }

    if (requirements.length === 0) {
      toast({
        title: "Error",
        description: "Please add at least one requirement",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const companyData = {
        ...formData,
        positions,
        requirements,
        posted_by: currentUser?._id || '',
      };

      if (company) {
        // Update existing company
        await companiesDB.update(company._id, companyData);
        toast({
          title: "Success",
          description: "Company updated successfully"
        });
      } else {
        // Create new company
        await companiesDB.create(companyData);
        toast({
          title: "Success",
          description: "Company created successfully"
        });
      }

      onClose();
    } catch (error) {
      console.error('Error saving company:', error);
      toast({
        title: "Error",
        description: "Failed to save company",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-4">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">Company Name *</Label>
          <Input
            id="name"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="location">Location *</Label>
          <Input
            id="location"
            name="location"
            value={formData.location}
            onChange={handleInputChange}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Description *</Label>
          <Textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            rows={3}
            required
          />
        </div>

        <div className="space-y-2">
          <Label>Positions *</Label>
          <div className="flex gap-2">
            <Input
              value={newPosition}
              onChange={(e) => setNewPosition(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddPosition())}
              placeholder="Add a position"
            />
            <Button type="button" onClick={handleAddPosition}>Add</Button>
          </div>
          <div className="mt-2 flex flex-wrap gap-2">
            {positions.map((position, index) => (
              <div key={index} className="bg-secondary px-3 py-1 rounded-md flex items-center gap-2">
                {position}
                <button
                  type="button"
                  onClick={() => handleRemovePosition(index)}
                  className="hover:text-destructive"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <Label>Requirements *</Label>
          <div className="flex gap-2">
            <Input
              value={newRequirement}
              onChange={(e) => setNewRequirement(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddRequirement())}
              placeholder="Add a requirement"
            />
            <Button type="button" onClick={handleAddRequirement}>Add</Button>
          </div>
          <div className="mt-2 flex flex-col gap-2">
            {requirements.map((requirement, index) => (
              <div key={index} className="bg-secondary px-3 py-1 rounded-md flex items-center justify-between">
                <span>{requirement}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveRequirement(index)}
                  className="hover:text-destructive"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="deadline">Application Deadline *</Label>
          <Input
            id="deadline"
            name="deadline"
            type="date"
            value={formData.deadline}
            onChange={handleInputChange}
            required
          />
        </div>

        <div className="flex justify-end gap-2 pt-4">
          <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Saving..." : company ? 'Update Company' : 'Add Company'}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default CompanyForm;
