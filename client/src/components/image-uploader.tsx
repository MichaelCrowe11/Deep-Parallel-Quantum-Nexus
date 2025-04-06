import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Upload, X, Image as ImageIcon, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface UploadedImage {
  name: string;
  path: string;
  url: string;
  type: string;
}

interface ImageUploaderProps {
  onImageUploaded?: (imagePath: string) => void;
  className?: string;
  showGallery?: boolean;
}

export function ImageUploader({ 
  onImageUploaded, 
  className = '', 
  showGallery = true 
}: ImageUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: imagesData } = useQuery<{ success: boolean, images: UploadedImage[] }>({
    queryKey: ['/api/images'],
    enabled: showGallery
  });

  const images: UploadedImage[] = imagesData?.images || [];

  // Handle drag events
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleUpload(e.dataTransfer.files[0]);
    }
  };

  // Handle file selection
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleUpload(e.target.files[0]);
    }
  };

  // Handle image upload
  const handleUpload = async (file: File) => {
    // Check if file is an image
    if (!file.type.startsWith('image/')) {
      toast({
        title: 'Invalid file type',
        description: 'Please select an image file.',
        variant: 'destructive'
      });
      return;
    }

    // Create form data
    const formData = new FormData();
    formData.append('image', file);

    try {
      setIsUploading(true);
      setUploadProgress(0);
      
      // Simulate progress during upload
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          const newProgress = prev + 5;
          return newProgress > 90 ? 90 : newProgress;
        });
      }, 100);

      // Upload the image
      const response = await fetch('/api/upload/image', {
        method: 'POST',
        body: formData
      });

      clearInterval(progressInterval);
      setUploadProgress(100);

      // Parse response JSON
      const result = await response.json();

      // Handle success
      if (result.success) {
        setIsUploading(false);
        toast({
          title: 'Upload successful',
          description: 'Image has been uploaded successfully.',
          variant: 'default'
        });

        // Refresh the images list
        queryClient.invalidateQueries({ queryKey: ['/api/images'] });

        // Call the callback function if provided
        if (onImageUploaded) {
          onImageUploaded(result.file.path);
        }

        // Set as selected image
        setSelectedImage(result.file.path);
      } else {
        throw new Error(result.message || 'Failed to upload image');
      }
    } catch (error) {
      setIsUploading(false);
      let errorMessage = 'An error occurred while uploading the image';
      
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      
      toast({
        title: 'Upload failed',
        description: errorMessage,
        variant: 'destructive'
      });
    }
  };

  // Trigger file input click
  const handleButtonClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  // Select image from gallery
  const handleImageSelect = (image: UploadedImage) => {
    setSelectedImage(image.path);
    if (onImageUploaded) {
      onImageUploaded(image.path);
    }
  };

  // Clear selected image
  const handleClearSelection = () => {
    setSelectedImage(null);
  };

  return (
    <div className={cn('space-y-4', className)}>
      {/* Upload area */}
      <div
        className={cn(
          'border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors',
          isDragging ? 'border-primary bg-primary/5' : 'border-gray-300 hover:border-primary/50',
          isUploading ? 'pointer-events-none' : ''
        )}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleButtonClick}
      >
        {selectedImage ? (
          <div className="relative w-full h-64 overflow-hidden rounded-md">
            <img 
              src={selectedImage} 
              alt="Uploaded" 
              className="w-full h-full object-cover" 
            />
            <button 
              onClick={(e) => {
                e.stopPropagation();
                handleClearSelection();
              }} 
              className="absolute top-2 right-2 bg-black/50 text-white p-1 rounded-full hover:bg-black/70"
            >
              <X className="h-5 w-5" />
            </button>
            <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white p-2 text-sm flex items-center">
              <Check className="h-4 w-4 mr-1 text-green-400" />
              Image selected
            </div>
          </div>
        ) : (
          <>
            <Upload className="mx-auto h-12 w-12 text-gray-400" />
            <div className="mt-4 flex text-sm leading-6 text-gray-600">
              <label
                htmlFor="file-upload"
                className="relative cursor-pointer font-semibold text-primary focus-within:outline-none"
              >
                <span>Upload an image</span>
                <input
                  id="file-upload"
                  name="file-upload"
                  type="file"
                  className="sr-only"
                  ref={fileInputRef}
                  onChange={handleFileSelect}
                  accept="image/*"
                />
              </label>
              <p className="pl-1">or drag and drop</p>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              PNG, JPG, GIF, WEBP up to 10MB
            </p>
          </>
        )}

        {isUploading && (
          <div className="mt-4">
            <Progress value={uploadProgress} className="h-2" />
            <p className="text-sm text-gray-500 mt-2">
              Uploading... {uploadProgress}%
            </p>
          </div>
        )}
      </div>

      {/* Image gallery */}
      {showGallery && images.length > 0 && (
        <div className="mt-6">
          <h3 className="font-medium text-lg mb-3">Image Gallery</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {images.map((image) => (
              <Card
                key={image.path}
                className={cn(
                  'relative cursor-pointer overflow-hidden p-0 h-32',
                  selectedImage === image.path ? 'ring-2 ring-primary' : ''
                )}
                onClick={() => handleImageSelect(image)}
              >
                <div className="w-full h-full">
                  <img
                    src={image.url}
                    alt={image.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      // If image fails to load, show placeholder
                      (e.target as HTMLImageElement).src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9IiNlZWVlZWUiLz48dGV4dCB4PSI1MCUiIHk9IjUwJSIgZG9taW5hbnQtYmFzZWxpbmU9Im1pZGRsZSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZm9udC1mYW1pbHk9Im1vbm9zcGFjZSIgZm9udC1zaXplPSIxMnB4IiBmaWxsPSIjOTk5OTk5Ij5JbWFnZSBub3QgbG9hZGVkPC90ZXh0Pjwvc3ZnPg==';
                    }}
                  />
                </div>
                {selectedImage === image.path && (
                  <div className="absolute top-2 right-2 bg-primary text-white rounded-full p-1">
                    <Check className="h-4 w-4" />
                  </div>
                )}
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}