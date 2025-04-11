
import React from 'react';
import { User } from '@/types/user.types';
import { TableRow, TableCell } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Edit, Trash2, Check, Clock } from 'lucide-react';

interface UserTableRowProps {
  user: User;
  onEdit: (user: User) => void;
  onDelete: (user: User) => void;
}

const UserTableRow: React.FC<UserTableRowProps> = ({ user, onEdit, onDelete }) => {
  return (
    <TableRow className="transition-colors hover:bg-gray-50">
      <TableCell>{user.id}</TableCell>
      <TableCell>
        {user.firstName} {user.lastName}
      </TableCell>
      <TableCell>{user.email}</TableCell>
      <TableCell>{user.position}</TableCell>
      <TableCell>{user.department}</TableCell>
      <TableCell>
        <div className="flex items-center gap-1">
          {user.status === 'active' ? (
            <>
              <Check className="h-4 w-4 text-green-500" />
              <span className="text-green-600">Actif</span>
            </>
          ) : (
            <>
              <Clock className="h-4 w-4 text-amber-500" />
              <span className="text-amber-600">En attente</span>
            </>
          )}
        </div>
      </TableCell>
      <TableCell>
        {new Date(user.dateCreated).toLocaleDateString()}
      </TableCell>
      <TableCell className="text-right">
        <div className="flex justify-end gap-2">
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => onEdit(user)}
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => onDelete(user)}
          >
            <Trash2 className="h-4 w-4 text-red-500" />
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );
};

export default UserTableRow;
