
import React from "react";
import { Button } from "@/components/ui/button";
import { 
  FileIcon, 
  VideoIcon, 
  AudioIcon,
  UploadCloudIcon
} from "@/components/Icons";

interface FileUploadProps {
  inputType: string;
  file: File | null;
  setFile: (file: File | null) => void;
  fileInputRef: React.RefObject<HTMLInputElement>;
}

export const FileUpload: React.FC<FileUploadProps> = ({ 
  inputType, 
  file, 
  setFile, 
  fileInputRef 
}) => {
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0] || null;
    setFile(selectedFile);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0]);
    }
  };

  const getAcceptedFileTypes = () => {
    switch (inputType) {
      case "BRD":
        return ".pdf,.docx,.txt";
      case "Video":
        return ".mp4,.avi,.mov";
      case "Audio":
        return ".mp3,.wav,.m4a";
      default:
        return "";
    }
  };

  const getFileTypeDescription = () => {
    switch (inputType) {
      case "BRD":
        return "PDF, DOCX, or TXT";
      case "Video":
        return "MP4, AVI, or MOV (max 25MB)";
      case "Audio":
        return "MP3, WAV, or M4A";
      default:
        return "";
    }
  };

  const getInputTypeIcon = () => {
    switch (inputType) {
      case "BRD":
        return <FileIcon className="h-10 w-10 text-muted-foreground/70" />;
      case "Video":
        return <VideoIcon className="h-10 w-10 text-muted-foreground/70" />;
      case "Audio":
        return <AudioIcon className="h-10 w-10 text-muted-foreground/70" />;
      default:
        return <FileIcon className="h-10 w-10 text-muted-foreground/70" />;
    }
  };

  return (
    <div>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept={getAcceptedFileTypes()}
        className="hidden"
      />
      
      {!file ? (
        <div
          className="border-2 border-dashed border-muted-foreground/20 rounded-lg p-6 text-center cursor-pointer hover:bg-muted/50 transition-colors"
          onClick={() => fileInputRef.current?.click()}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
        >
          <div className="flex flex-col items-center gap-3">
            {getInputTypeIcon()}
            <div className="space-y-1">
              <p className="text-sm font-medium">
                Drag & drop or click to upload
              </p>
              <p className="text-xs text-muted-foreground">
                {getFileTypeDescription()}
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="border rounded-lg p-3 bg-secondary/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {getInputTypeIcon()}
              <div className="overflow-hidden">
                <p className="text-sm font-medium truncate max-w-[180px]">{file.name}</p>
                <p className="text-xs text-muted-foreground">
                  {(file.size / (1024 * 1024)).toFixed(2)} MB
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
              >
                Change
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => setFile(null)}
              >
                Remove
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
