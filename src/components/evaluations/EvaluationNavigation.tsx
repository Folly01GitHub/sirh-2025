
import React from 'react';
import { CriteriaGroup } from '@/types/evaluation.types';
import { ChevronLeft, ChevronRight, FileText } from 'lucide-react';
import { 
  Sidebar, 
  SidebarContent, 
  SidebarHeader, 
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton
} from '@/components/ui/sidebar';
import { Progress } from '@/components/ui/progress';

interface EvaluationNavigationProps {
  criteriaGroups: CriteriaGroup[] | undefined;
  currentGroupId: number;
  onGroupChange: (groupId: number) => void;
  onPreviousGroup: () => void;
  onNextGroup: () => void;
  progress: number;
}

const EvaluationNavigation: React.FC<EvaluationNavigationProps> = ({
  criteriaGroups,
  currentGroupId,
  onGroupChange,
  onPreviousGroup,
  onNextGroup,
  progress
}) => {
  return (
    <Sidebar>
      <SidebarHeader className="p-4 pb-0">
        <h3 className="text-lg font-medium mb-2">Évaluation</h3>
        <Progress value={progress} className="h-2 mb-4" />
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu>
          {criteriaGroups?.map((group) => (
            <SidebarMenuItem key={group.id}>
              <SidebarMenuButton 
                isActive={currentGroupId === group.id}
                onClick={() => onGroupChange(group.id)}
                tooltip={group.name}
                className={`
                  ${currentGroupId === group.id 
                    ? 'bg-primary/10 text-primary font-semibold border-l-4 border-primary' 
                    : 'hover:bg-gray-100'}
                  transition-all duration-200 ease-in-out
                `}
              >
                <FileText className="h-5 w-5" />
                <span>{group.name}</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
    </Sidebar>
  );
};

export default EvaluationNavigation;
