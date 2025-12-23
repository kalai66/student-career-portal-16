import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Edit, Trash } from "lucide-react";
import { Company } from '@/lib/dbHelpers';

interface CompanyDisplayProps {
  companies: Company[];
  onEdit?: (company: Company) => void;
  onDelete?: (id: string) => void;
}

const CompanyDisplay: React.FC<CompanyDisplayProps> = ({
  companies,
  onEdit,
  onDelete
}) => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }).format(date);
  };

  if (companies.length === 0) {
    return <div className="text-center py-4 text-muted-foreground">No companies found.</div>;
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Company Name</TableHead>
            <TableHead>Location</TableHead>
            <TableHead>Deadline</TableHead>
            <TableHead>Positions</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {companies.map((company) => (
            <TableRow key={company._id}>
              <TableCell className="font-medium">{company.name}</TableCell>
              <TableCell>{company.location}</TableCell>
              <TableCell>{formatDate(company.deadline)}</TableCell>
              <TableCell>{company.positions.length} position(s)</TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  {onEdit && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onEdit(company)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                  )}
                  {onDelete && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onDelete(company._id)}
                    >
                      <Trash className="h-4 w-4 text-red-500" />
                    </Button>
                  )}
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default CompanyDisplay;
