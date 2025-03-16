
import React, { useState, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { toast } from "@/components/ui/use-toast";
import { FileUpload } from "@/components/FileUpload";
import { OutputTable } from "@/components/OutputTable";
import { 
  FileIcon, 
  VideoIcon, 
  AudioIcon, 
  ClipboardIcon, 
  UserIcon, 
  GapIcon, 
  ArrowRightIcon, 
  InfoIcon 
} from "@/components/Icons";

const systemOptions = ["Oracle ERP", "D365 F&O", "Salesforce", "D365 CE"];

export const RequirementExplorer = () => {
  const [inputType, setInputType] = useState<string>("BRD");
  const [sourceSystem, setSourceSystem] = useState<string>(systemOptions[0]);
  const [destSystem, setDestSystem] = useState<string>(systemOptions[1]);
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [activeTab, setActiveTab] = useState("requirements");
  const [generatedContent, setGeneratedContent] = useState<any>({
    requirements: null,
    userStories: null,
    fitGap: null
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleProcessing = (type: string) => {
    if (!file) {
      toast({
        title: "No file selected",
        description: "Please upload a file to continue",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    setProgress(0);
    
    // Simulate processing with progress updates
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 95) {
          clearInterval(progressInterval);
          return 95;
        }
        return prev + Math.random() * 10;
      });
    }, 500);

    // Simulate API call with mock data
    setTimeout(() => {
      clearInterval(progressInterval);
      setProgress(100);
      
      let mockData;
      if (type === "requirements") {
        mockData = generateMockRequirements();
      } else if (type === "userStories") {
        mockData = generateMockUserStories();
      } else {
        mockData = generateMockFitGap();
      }
      
      setGeneratedContent(prev => ({
        ...prev,
        [type]: mockData
      }));
      
      setActiveTab(type);
      
      setTimeout(() => {
        setIsProcessing(false);
        toast({
          title: "Processing complete",
          description: `${type.charAt(0).toUpperCase() + type.slice(1)} have been generated successfully.`,
        });
      }, 500);
    }, 3000);
  };

  const generateMockRequirements = () => {
    return [
      { id: "REQ-001", description: "System must support multi-currency transactions", priority: "High", source: "BRD p.12" },
      { id: "REQ-002", description: "Approval workflows for purchases above $10,000", priority: "Medium", source: "BRD p.15" },
      { id: "REQ-003", description: "Integration with existing payment gateway", priority: "High", source: "BRD p.8" },
      { id: "REQ-004", description: "Role-based access control for financial reports", priority: "Medium", source: "BRD p.23" },
      { id: "REQ-005", description: "Support for tax calculations across multiple jurisdictions", priority: "High", source: "BRD p.17" },
    ];
  };

  const generateMockUserStories = () => {
    return [
      { id: "US-001", story: "As a Finance Manager, I want to process transactions in multiple currencies so that I can support our global operations", priority: "High", related: "REQ-001" },
      { id: "US-002", story: "As a Department Head, I want approval workflows for large purchases so that I can maintain budget control", priority: "Medium", related: "REQ-002" },
      { id: "US-003", story: "As a Customer, I want to use my existing payment methods so that I don't have to update my payment information", priority: "High", related: "REQ-003" },
      { id: "US-004", story: "As a CFO, I want role-based access to financial reports so that sensitive information is protected", priority: "Medium", related: "REQ-004" },
      { id: "US-005", story: "As a Tax Accountant, I want automated tax calculations for multiple regions so that I can ensure compliance", priority: "High", related: "REQ-005" },
    ];
  };

  const generateMockFitGap = () => {
    return [
      { requirement: "REQ-001", source: sourceSystem, destination: destSystem, fit: "Partial", gap: "Currency conversion logic needs customization", effort: "Medium" },
      { requirement: "REQ-002", source: sourceSystem, destination: destSystem, fit: "Yes", gap: "Standard functionality available", effort: "Low" },
      { requirement: "REQ-003", source: sourceSystem, destination: destSystem, fit: "No", gap: "Custom integration required", effort: "High" },
      { requirement: "REQ-004", source: sourceSystem, destination: destSystem, fit: "Partial", gap: "Basic roles available, custom roles needed", effort: "Medium" },
      { requirement: "REQ-005", source: sourceSystem, destination: destSystem, fit: "Yes", gap: "Configuration required", effort: "Medium" },
    ];
  };

  const getInputIcon = () => {
    switch (inputType) {
      case "BRD":
        return <FileIcon className="h-6 w-6" />;
      case "Video":
        return <VideoIcon className="h-6 w-6" />;
      case "Audio":
        return <AudioIcon className="h-6 w-6" />;
      default:
        return <FileIcon className="h-6 w-6" />;
    }
  };

  return (
    <div className="min-h-screen bg-background animate-fade-in">
      <div className="container max-w-6xl px-4 py-12 mx-auto">
        <div className="space-y-8">
          <div className="space-y-2 text-center">
            <h1 className="text-4xl font-semibold tracking-tight">Requirement Journey Explorer</h1>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Extract, analyze, and transform requirements into actionable insights for your migration projects
            </p>
          </div>

          <Card className="backdrop-blur-sm bg-white/70 border-0 shadow-sm overflow-hidden animate-slide-up">
            <CardContent className="p-6 lg:p-8">
              <div className="grid gap-8 md:grid-cols-12">
                <div className="md:col-span-5 space-y-6">
                  <div className="space-y-4">
                    <div>
                      <h2 className="text-lg font-medium">Input Configuration</h2>
                      <p className="text-sm text-muted-foreground">Select your source document type and systems</p>
                    </div>

                    <div className="space-y-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Input Type</label>
                        <Select value={inputType} onValueChange={setInputType}>
                          <SelectTrigger className="w-full">
                            <div className="flex items-center gap-2">
                              {getInputIcon()}
                              <SelectValue placeholder="Select input type" />
                            </div>
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="BRD">
                              <div className="flex items-center gap-2">
                                <FileIcon className="h-4 w-4" />
                                <span>Business Requirement Document</span>
                              </div>
                            </SelectItem>
                            <SelectItem value="Video">
                              <div className="flex items-center gap-2">
                                <VideoIcon className="h-4 w-4" />
                                <span>Teams Recorded Video</span>
                              </div>
                            </SelectItem>
                            <SelectItem value="Audio">
                              <div className="flex items-center gap-2">
                                <AudioIcon className="h-4 w-4" />
                                <span>Audio Transcript</span>
                              </div>
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="text-sm font-medium">Source System</label>
                          <Select value={sourceSystem} onValueChange={setSourceSystem}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select source" />
                            </SelectTrigger>
                            <SelectContent>
                              {systemOptions.map((system) => (
                                <SelectItem key={system} value={system}>
                                  {system}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <label className="text-sm font-medium">Destination System</label>
                          <Select value={destSystem} onValueChange={setDestSystem}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select destination" />
                            </SelectTrigger>
                            <SelectContent>
                              {systemOptions.map((system) => (
                                <SelectItem key={system} value={system}>
                                  {system}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div className="pt-2">
                        <FileUpload 
                          inputType={inputType} 
                          file={file} 
                          setFile={setFile} 
                          fileInputRef={fileInputRef}
                        />
                      </div>
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-4">
                    <div>
                      <h2 className="text-lg font-medium">Generate Analysis</h2>
                      <p className="text-sm text-muted-foreground">Transform your inputs into structured insights</p>
                    </div>

                    <div className="grid grid-cols-1 gap-3">
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button 
                              onClick={() => handleProcessing("requirements")} 
                              disabled={isProcessing || !file}
                              className="w-full justify-start"
                            >
                              <ClipboardIcon className="mr-2 h-4 w-4" />
                              Extract Requirements
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Extract detailed business requirements from your document</p>
                          </TooltipContent>
                        </Tooltip>

                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button 
                              onClick={() => handleProcessing("userStories")} 
                              disabled={isProcessing || !file}
                              variant="outline"
                              className="w-full justify-start"
                            >
                              <UserIcon className="mr-2 h-4 w-4" />
                              Generate User Stories
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Convert requirements into user stories</p>
                          </TooltipContent>
                        </Tooltip>

                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button 
                              onClick={() => handleProcessing("fitGap")} 
                              disabled={isProcessing || !file}
                              variant="outline"
                              className="w-full justify-start"
                            >
                              <GapIcon className="mr-2 h-4 w-4" />
                              Perform Fit-Gap Analysis
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Analyze requirements against source and destination systems</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>

                    {isProcessing && (
                      <div className="space-y-2">
                        <div className="flex justify-between items-center text-xs">
                          <span>Processing {file?.name}</span>
                          <span>{Math.round(progress)}%</span>
                        </div>
                        <Progress value={progress} className="h-1.5" />
                      </div>
                    )}
                  </div>
                </div>

                <div className="md:col-span-7">
                  <div className="bg-secondary/50 rounded-lg p-4 h-full">
                    <Tabs 
                      value={activeTab} 
                      onValueChange={setActiveTab}
                      className="h-full flex flex-col"
                    >
                      <div className="flex items-center justify-between mb-4">
                        <TabsList className="grid grid-cols-3">
                          <TabsTrigger value="requirements" className="text-xs sm:text-sm">
                            Requirements
                          </TabsTrigger>
                          <TabsTrigger value="userStories" className="text-xs sm:text-sm">
                            User Stories
                          </TabsTrigger>
                          <TabsTrigger value="fitGap" className="text-xs sm:text-sm">
                            Fit-Gap Analysis
                          </TabsTrigger>
                        </TabsList>
                        <div className="text-muted-foreground text-xs flex items-center">
                          <InfoIcon className="h-3.5 w-3.5 mr-1" />
                          <span>Data for demo purposes</span>
                        </div>
                      </div>

                      <div className="flex-grow overflow-auto">
                        <TabsContent value="requirements" className="m-0 h-full">
                          <OutputTable 
                            type="requirements"
                            data={generatedContent.requirements}
                            isLoading={isProcessing && activeTab === "requirements"}
                          />
                        </TabsContent>
                        
                        <TabsContent value="userStories" className="m-0 h-full">
                          <OutputTable 
                            type="userStories"
                            data={generatedContent.userStories}
                            isLoading={isProcessing && activeTab === "userStories"}
                          />
                        </TabsContent>
                        
                        <TabsContent value="fitGap" className="m-0 h-full">
                          <OutputTable 
                            type="fitGap"
                            data={generatedContent.fitGap}
                            isLoading={isProcessing && activeTab === "fitGap"}
                          />
                        </TabsContent>
                      </div>
                    </Tabs>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex items-center justify-center space-x-2 text-sm text-muted-foreground animate-fade-in">
            <span>Designed for seamless migration journeys</span>
            <Separator orientation="vertical" className="h-4" />
            <span>Version 1.0</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RequirementExplorer;
