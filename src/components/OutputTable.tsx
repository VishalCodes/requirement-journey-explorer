
import React from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

interface OutputTableProps {
  type: "requirements" | "userStories" | "fitGap";
  data: any[] | null;
  isLoading: boolean;
}

export const OutputTable: React.FC<OutputTableProps> = ({ type, data, isLoading }) => {
  if (isLoading) {
    return <TableSkeleton type={type} />;
  }

  if (!data) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-center p-8">
        <div className="text-muted-foreground/70">
          <p className="text-lg font-medium mb-2">No data available</p>
          <p className="text-sm max-w-md">
            {type === "requirements" && "Upload a file and click 'Extract Requirements' to analyze your document"}
            {type === "userStories" && "Generate requirements first, then convert them to user stories"}
            {type === "fitGap" && "Analyze systems compatibility after extracting requirements"}
          </p>
        </div>
      </div>
    );
  }

  if (type === "requirements") {
    return (
      <div className="rounded-md border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[90px]">ID</TableHead>
              <TableHead>Description</TableHead>
              <TableHead className="w-[110px]">Priority</TableHead>
              <TableHead className="w-[100px]">Source</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((req) => (
              <TableRow key={req.id}>
                <TableCell className="font-mono text-xs">{req.id}</TableCell>
                <TableCell>{req.description}</TableCell>
                <TableCell>
                  <PriorityBadge priority={req.priority} />
                </TableCell>
                <TableCell className="text-xs text-muted-foreground">{req.source}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    );
  }

  if (type === "userStories") {
    return (
      <div className="rounded-md border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[90px]">ID</TableHead>
              <TableHead>User Story</TableHead>
              <TableHead className="w-[110px]">Priority</TableHead>
              <TableHead className="w-[100px]">Related Req</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((story) => (
              <TableRow key={story.id}>
                <TableCell className="font-mono text-xs">{story.id}</TableCell>
                <TableCell>{story.story}</TableCell>
                <TableCell>
                  <PriorityBadge priority={story.priority} />
                </TableCell>
                <TableCell className="font-mono text-xs">{story.related}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    );
  }

  if (type === "fitGap") {
    return (
      <div className="rounded-md border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[90px]">Req ID</TableHead>
              <TableHead className="w-[110px]">Fit</TableHead>
              <TableHead>Gap Description</TableHead>
              <TableHead className="w-[100px]">Effort</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((analysis) => (
              <TableRow key={analysis.requirement}>
                <TableCell className="font-mono text-xs">{analysis.requirement}</TableCell>
                <TableCell>
                  <FitBadge fit={analysis.fit} />
                </TableCell>
                <TableCell>{analysis.gap}</TableCell>
                <TableCell>
                  <EffortBadge effort={analysis.effort} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    );
  }

  return null;
};

const PriorityBadge: React.FC<{ priority: string }> = ({ priority }) => {
  const variant = 
    priority === "High" 
      ? "destructive" 
      : priority === "Medium" 
        ? "default" 
        : "secondary";
  
  return <Badge variant={variant}>{priority}</Badge>;
};

const FitBadge: React.FC<{ fit: string }> = ({ fit }) => {
  const variant = 
    fit === "Yes" 
      ? "default" 
      : fit === "Partial" 
        ? "secondary" 
        : "destructive";
  
  return <Badge variant={variant}>{fit}</Badge>;
};

const EffortBadge: React.FC<{ effort: string }> = ({ effort }) => {
  const variant = 
    effort === "Low" 
      ? "outline" 
      : effort === "Medium" 
        ? "secondary" 
        : "destructive";
  
  return <Badge variant={variant}>{effort}</Badge>;
};

const TableSkeleton: React.FC<{ type: string }> = ({ type }) => {
  return (
    <div className="space-y-3">
      <div className="flex items-center space-x-4">
        <Skeleton className="h-8 w-40" />
        <Skeleton className="h-8 w-24" />
      </div>
      
      <div className="space-y-2">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex items-center space-x-3">
            <Skeleton className="h-6 w-[10%]" />
            <Skeleton className="h-6 w-[60%]" />
            <Skeleton className="h-6 w-[15%]" />
            <Skeleton className="h-6 w-[15%]" />
          </div>
        ))}
      </div>
    </div>
  );
};
