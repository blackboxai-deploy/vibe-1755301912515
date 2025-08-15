"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";

export interface GeneratedImage {
  id: string;
  url: string;
  prompt: string;
  timestamp: Date;
  settings: {
    width: number;
    height: number;
    style?: string;
    guidance?: number;
  };
  status: "generating" | "completed" | "error";
}

interface ImageGalleryProps {
  images: GeneratedImage[];
  onDownload: (image: GeneratedImage) => void;
  onRegenerate: (prompt: string, settings: any) => void;
  onDelete: (id: string) => void;
}

export function ImageGallery({ images, onDownload, onRegenerate, onDelete }: ImageGalleryProps) {
  const [selectedImage, setSelectedImage] = useState<GeneratedImage | null>(null);

  const handleDownload = async (image: GeneratedImage) => {
    try {
      const response = await fetch(image.url);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `ai-generated-${image.id}.png`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      onDownload(image);
    } catch (error) {
      console.error('Download failed:', error);
    }
  };

  const formatTimestamp = (timestamp: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(timestamp);
  };

  if (images.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="w-24 h-24 rounded-full bg-muted flex items-center justify-center mb-4">
          <span className="text-2xl">🎨</span>
        </div>
        <h3 className="text-lg font-semibold mb-2">No images generated yet</h3>
        <p className="text-muted-foreground max-w-sm">
          Start creating amazing AI-generated images by entering a prompt above.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Generated Images</h2>
        <Badge variant="secondary">{images.length} image{images.length !== 1 ? 's' : ''}</Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {images.map((image) => (
          <Card key={image.id} className="overflow-hidden group hover:shadow-lg transition-shadow">
            <CardContent className="p-0">
              <div className="aspect-square relative">
                {image.status === "generating" ? (
                  <div className="w-full h-full flex flex-col items-center justify-center bg-muted">
                    <Skeleton className="w-full h-full" />
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full mb-2"></div>
                      <p className="text-sm text-muted-foreground">Generating...</p>
                    </div>
                  </div>
                ) : image.status === "error" ? (
                  <div className="w-full h-full flex flex-col items-center justify-center bg-destructive/10 text-destructive">
                    <span className="text-2xl mb-2">⚠️</span>
                    <p className="text-sm">Generation failed</p>
                  </div>
                ) : (
                  <Dialog>
                    <DialogTrigger asChild>
                      <div className="cursor-pointer">
                        <img
                          src={image.url}
                          alt={image.prompt}
                          className="w-full h-full object-cover transition-transform group-hover:scale-105"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = `https://storage.googleapis.com/workspace-0f70711f-8b4e-4d94-86f1-2a93ccde5887/image/314ce829-5a2a-4c20-aeb8-37a068ffe44d.png}x${image.settings.height}/e2e8f0/64748b?text=Failed+to+Load`;
                          }}
                        />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                          <span className="text-white text-sm font-medium">Click to view</span>
                        </div>
                      </div>
                    </DialogTrigger>
                    <DialogContent className="max-w-4xl">
                      <DialogHeader>
                        <DialogTitle>Generated Image</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <img
                          src={image.url}
                          alt={image.prompt}
                          className="w-full h-auto max-h-[60vh] object-contain rounded-lg"
                        />
                        <div className="space-y-2">
                          <p className="text-sm font-medium">Prompt:</p>
                          <p className="text-sm text-muted-foreground bg-muted p-3 rounded-lg">
                            {image.prompt}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <Button onClick={() => handleDownload(image)} size="sm">
                            Download
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => onRegenerate(image.prompt, image.settings)}
                          >
                            Regenerate
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                )}
              </div>

              <div className="p-4 space-y-3">
                <div className="space-y-2">
                  <p className="text-sm line-clamp-2 leading-relaxed">
                    {image.prompt}
                  </p>
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>{formatTimestamp(image.timestamp)}</span>
                    <span>{image.settings.width}×{image.settings.height}</span>
                  </div>
                </div>

                {image.status === "completed" && (
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => handleDownload(image)}
                    >
                      Download
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => onRegenerate(image.prompt, image.settings)}
                    >
                      Regenerate
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onDelete(image.id)}
                      className="text-destructive hover:text-destructive"
                    >
                      Delete
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {images.length > 6 && (
        <div className="text-center">
          <Button variant="outline">
            Load More Images
          </Button>
        </div>
      )}
    </div>
  );
}