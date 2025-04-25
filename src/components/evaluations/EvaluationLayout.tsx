
import React from 'react';
import { Sidebar, SidebarContent, SidebarHeader, SidebarMenu, SidebarMenuItem, SidebarMenuButton } from '@/components/ui/sidebar';
import { Progress } from '@/components/ui/progress';
import { FileText } from 'lucide-react';
import { CriteriaGroup } from '@/types/evaluation.types';
import HRISNavbar from '@/components/hris/HRISNavbar';

interface EvaluationLayoutProps {
  children: React.ReactNode;
  criteriaGroups?: CriteriaGroup[];
  currentGroupId: number;
  progress: number;
  onGroupChange: (groupId: number) => void;
}

export const EvaluationLayout = ({
  children,
  criteriaGroups,
  currentGroupId,
  progress,
  onGroupChange
}: EvaluationLayoutProps) => {
  return (
    <div className="flex flex-col min-h-screen w-full bg-[#f8f9fc]">
      <HRISNavbar />
      
      <div className="flex flex-1 h-full overflow-hidden">
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

        <div className="flex flex-col h-full w-full overflow-auto">
          {children}
        </div>
      </div>
    </div>
  );
};
