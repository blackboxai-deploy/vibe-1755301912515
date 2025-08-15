'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';

interface GeneratedImage {
  id: string;
  url: string;
  prompt: string;
  timestamp: Date;
  settings: GenerationSettings;
}

interface GenerationSettings {
  width: number;
  height: number;
  style: string;
  guidance: number;
  steps: number;
}

const STYLE_PRESETS = [
  { value: 'photorealistic', label: 'Photorealistic' },
  { value: 'artistic', label: 'Artistic' },
  { value: 'abstract', label: 'Abstract' },
  { value: 'cinematic', label: 'Cinematic' },
  { value: 'anime', label: 'Anime' },
  { value: 'digital-art', label: 'Digital Art' }
];

const RESOLUTION_PRESETS = [
  { value: '512x512', label: 'Square (512x512)', width: 512, height: 512 },
  { value: '768x768', label: 'Square HD (768x768)', width: 768, height: 768 },
  { value: '1024x1024', label: 'Square FHD (1024x1024)', width: 1024, height: 1024 },
  { value: '1024x768', label: 'Landscape (1024x768)', width: 1024, height: 768 },
  { value: '768x1024', label: 'Portrait (768x1024)', width: 768, height: 1024 },
  { value: '1920x1080', label: 'Full HD (1920x1080)', width: 1920, height: 1080 }
];

export default function HomePage() {
  const [prompt, setPrompt] = useState('');
  const [systemPrompt, setSystemPrompt] = useState('Generate a high-quality, detailed image based on the user prompt. Focus on artistic composition, proper lighting, and visual appeal.');
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [generatedImages, setGeneratedImages] = useState<GeneratedImage[]>([]);
  const [history, setHistory] = useState<GeneratedImage[]>([]);
  const [settings, setSettings] = useState<GenerationSettings>({
    width: 1024,
    height: 1024,
    style: 'photorealistic',
    guidance: 7.5,
    steps: 50
  });
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [batchCount, setBatchCount] = useState(1);

  useEffect(() => {
    const savedHistory = localStorage.getItem('ai-image-history');
    if (savedHistory) {
      try {
        const parsed = JSON.parse(savedHistory);
        setHistory(parsed.map((item: any) => ({
          ...item,
          timestamp: new Date(item.timestamp)
        })));
      } catch (error) {
        console.error('Failed to load history:', error);
      }
    }
  }, []);

  const saveToHistory = (image: GeneratedImage) => {
    const updatedHistory = [image, ...history].slice(0, 50);
    setHistory(updatedHistory);
    localStorage.setItem('ai-image-history', JSON.stringify(updatedHistory));
  };

  const generateImage = async () => {
    if (!prompt.trim()) {
      toast.error('Please enter a prompt');
      return;
    }

    setIsGenerating(true);
    setProgress(0);
    setGeneratedImages([]);

    const progressInterval = setInterval(() => {
      setProgress(prev => Math.min(prev + Math.random() * 15, 90));
    }, 1000);

    try {
      const images: GeneratedImage[] = [];
      
      for (let i = 0; i < batchCount; i++) {
        const response = await fetch('/api/generate', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            prompt,
            systemPrompt,
            settings,
            batchIndex: i
          }),
        });

        if (!response.ok) {
          throw new Error(`Generation failed: ${response.statusText}`);
        }

        const data = await response.json();
        
        const newImage: GeneratedImage = {
          id: `img_${Date.now()}_${i}`,
          url: data.imageUrl,
          prompt,
          timestamp: new Date(),
          settings: { ...settings }
        };

        images.push(newImage);
        saveToHistory(newImage);
      }

      setGeneratedImages(images);
      setProgress(100);
      toast.success(`Generated ${batchCount} image${batchCount > 1 ? 's' : ''} successfully!`);
    } catch (error) {
      console.error('Generation error:', error);
      toast.error('Failed to generate image. Please try again.');
    } finally {
      clearInterval(progressInterval);
      setIsGenerating(false);
      setTimeout(() => setProgress(0), 2000);
    }
  };

  const downloadImage = async (imageUrl: string, filename: string) => {
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast.success('Image downloaded successfully!');
    } catch (error) {
      toast.error('Failed to download image');
    }
  };

  const updateResolution = (resolution: string) => {
    const preset = RESOLUTION_PRESETS.find(p => p.value === resolution);
    if (preset) {
      setSettings(prev => ({
        ...prev,
        width: preset.width,
        height: preset.height
      }));
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2">AI Image Generator</h1>
          <p className="text-muted-foreground">Create stunning images with AI using advanced FLUX models</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Main Generation Panel */}
          <div className="lg:col-span-3 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Generate Images</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="prompt">Image Prompt</Label>
                  <Textarea
                    id="prompt"
                    placeholder="Describe the image you want to generate..."
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    className="min-h-[100px] mt-2"
                  />
                </div>

                <div>
                  <Label htmlFor="system-prompt">System Prompt</Label>
                  <Textarea
                    id="system-prompt"
                    placeholder="System instructions for the AI..."
                    value={systemPrompt}
                    onChange={(e) => setSystemPrompt(e.target.value)}
                    className="min-h-[80px] mt-2"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label>Resolution</Label>
                    <Select onValueChange={updateResolution} defaultValue="1024x1024">
                      <SelectTrigger className="mt-2">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {RESOLUTION_PRESETS.map(preset => (
                          <SelectItem key={preset.value} value={preset.value}>
                            {preset.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>Style</Label>
                    <Select value={settings.style} onValueChange={(value) => setSettings(prev => ({ ...prev, style: value }))}>
                      <SelectTrigger className="mt-2">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {STYLE_PRESETS.map(style => (
                          <SelectItem key={style.value} value={style.value}>
                            {style.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>Batch Count</Label>
                    <Select value={batchCount.toString()} onValueChange={(value) => setBatchCount(parseInt(value))}>
                      <SelectTrigger className="mt-2">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">1 Image</SelectItem>
                        <SelectItem value="2">2 Images</SelectItem>
                        <SelectItem value="3">3 Images</SelectItem>
                        <SelectItem value="4">4 Images</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="advanced"
                    checked={showAdvanced}
                    onCheckedChange={setShowAdvanced}
                  />
                  <Label htmlFor="advanced">Show Advanced Settings</Label>
                </div>

                {showAdvanced && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 border rounded-lg">
                    <div>
                      <Label>Guidance Scale: {settings.guidance}</Label>
                      <Slider
                        value={[settings.guidance]}
                        onValueChange={([value]) => setSettings(prev => ({ ...prev, guidance: value }))}
                        min={1}
                        max={20}
                        step={0.5}
                        className="mt-2"
                      />
                    </div>
                    <div>
                      <Label>Steps: {settings.steps}</Label>
                      <Slider
                        value={[settings.steps]}
                        onValueChange={([value]) => setSettings(prev => ({ ...prev, steps: value }))}
                        min={20}
                        max={100}
                        step={5}
                        className="mt-2"
                      />
                    </div>
                  </div>
                )}

                {isGenerating && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Generating...</span>
                      <span>{Math.round(progress)}%</span>
                    </div>
                    <Progress value={progress} />
                  </div>
                )}

                <Button 
                  onClick={generateImage} 
                  disabled={isGenerating || !prompt.trim()}
                  className="w-full"
                  size="lg"
                >
                  {isGenerating ? 'Generating...' : `Generate ${batchCount > 1 ? `${batchCount} Images` : 'Image'}`}
                </Button>
              </CardContent>
            </Card>

            {/* Generated Images */}
            {generatedImages.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Generated Images</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {generatedImages.map((image) => (
                      <div key={image.id} className="relative group">
                        <img
                          src={image.url}
                          alt={image.prompt}
                          className="w-full h-64 object-cover rounded-lg"
                        />
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                          <Button
                            onClick={() => downloadImage(image.url, `generated-${image.id}.png`)}
                            variant="secondary"
                          >
                            Download
                          </Button>
                        </div>
                        <div className="mt-2">
                          <Badge variant="secondary">{image.settings.style}</Badge>
                          <Badge variant="outline" className="ml-2">
                            {image.settings.width}x{image.settings.height}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* History Sidebar */}
          <div className="lg:col-span-1">
            <Card className="sticky top-4">
              <CardHeader>
                <CardTitle>History</CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[600px]">
                  {history.length === 0 ? (
                    <p className="text-muted-foreground text-sm">No images generated yet</p>
                  ) : (
                    <div className="space-y-4">
                      {history.map((image) => (
                        <div key={image.id} className="group cursor-pointer">
                          <img
                            src={image.url}
                            alt={image.prompt}
                            className="w-full h-24 object-cover rounded"
                            onClick={() => setPrompt(image.prompt)}
                          />
                          <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                            {image.prompt}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {image.timestamp.toLocaleDateString()}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </ScrollArea>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}