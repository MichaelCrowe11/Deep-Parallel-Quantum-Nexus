import React, { useState } from 'react';
import { Layout } from '@/components/layout';
import { ImageUploader } from '@/components/image-uploader';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BrandGradientText } from '@/components/brand-elements';
import { ImageIcon, FolderIcon, Settings } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';

export default function AdminPage() {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  
  const handleImageUploaded = (imagePath: string) => {
    setSelectedImage(imagePath);
    console.log('Image uploaded:', imagePath);
  };

  return (
    <Layout>
      <div className="container mx-auto py-8 px-4">
        <header className="mb-8">
          <h1 className="text-3xl font-bold mb-2">
            <BrandGradientText>Admin Dashboard</BrandGradientText>
          </h1>
          <p className="text-gray-500 dark:text-gray-400">
            Manage assets, images, and content for Deep Parallel
          </p>
        </header>

        <Tabs defaultValue="images" className="w-full">
          <TabsList className="mb-6">
            <TabsTrigger value="images" className="flex items-center">
              <ImageIcon className="h-4 w-4 mr-2" />
              Images
            </TabsTrigger>
            <TabsTrigger value="assets" className="flex items-center">
              <FolderIcon className="h-4 w-4 mr-2" />
              Assets
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center">
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </TabsTrigger>
          </TabsList>

          <TabsContent value="images" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Image Management</CardTitle>
                <CardDescription>
                  Upload, organize, and select images for your Deep Parallel projects
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ImageUploader 
                  onImageUploaded={handleImageUploaded} 
                  showGallery={true}
                />
              </CardContent>
            </Card>
            
            {selectedImage && (
              <Card>
                <CardHeader>
                  <CardTitle>Selected Image</CardTitle>
                  <CardDescription>
                    Currently selected image for use in your projects
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center space-x-4">
                    <div className="border rounded-md overflow-hidden w-40 h-40">
                      <img 
                        src={selectedImage} 
                        alt="Selected" 
                        className="w-full h-full object-cover" 
                      />
                    </div>
                    <div>
                      <h3 className="font-medium">Image Path</h3>
                      <p className="text-sm text-gray-500 mt-1 mb-3 break-all">
                        {selectedImage}
                      </p>
                      <div className="flex space-x-2">
                        <Button
                          size="sm"
                          onClick={() => {
                            navigator.clipboard.writeText(selectedImage);
                          }}
                        >
                          Copy Path
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => setSelectedImage(null)}
                        >
                          Clear Selection
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="assets">
            <Card>
              <CardHeader>
                <CardTitle>Asset Management</CardTitle>
                <CardDescription>
                  Manage various assets for Deep Parallel
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-gray-500">
                  Asset management features coming soon...
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings">
            <Card>
              <CardHeader>
                <CardTitle>System Settings</CardTitle>
                <CardDescription>
                  Configure settings for Deep Parallel
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-gray-500">
                  Settings panel coming soon...
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}