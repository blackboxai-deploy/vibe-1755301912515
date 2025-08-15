"use client";

import React, { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
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
  seed?: number;
}

const STYLE_PRESETS = [
  { value: 'photorealistic', label: 'Photorealistic' },
  { value: 'artistic', label: 'Artistic' },
  { value: 'abstract', label: 'Abstract' },
  { value: 'cinematic', label: 'Cinematic' },
  { value: 'anime', label: 'Anime' },
  { value: 'digital-art', label: 'Digital Art' },
  { value: 'oil-painting', label: 'Oil Painting' },
  { value: 'watercolor', label: 'Watercolor' }
];

const RESOLUTION_PRESETS = [
  { value: '512x512', label: '512×512 (Square)', width: 512, height: 512 },
  { value: '768x768', label: '768×768 (Square)', width: 768, height: 768 },
  { value: '1024x1024', label: '1024×1024 (Square)', width: 1024, height: 1024 },
  { value: '1024x768', label: '1024×768 (Landscape)', width: 1024, height: 768 },
  { value: '768x1024', label: '768×1024 (Portrait)', width: 768, height: 1024 },
  { value: '1920x1080', label: '1920×1080 (HD)', width: 1920, height: 1080 }
];

export default function ImageGenerator() {
  const [prompt, setPrompt] = useState('');
  const [systemPrompt, setSystemPrompt] = useState('Generate a high-quality, detailed image based on the user prompt. Focus on artistic composition, proper lighting, and visual appeal.');
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [generatedImages, setGeneratedImages] = useState<GeneratedImage[]>([]);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [batchCount, setBatchCount] = useState(1);
  
  const [settings, setSettings] = useState<GenerationSettings>({
    width: 1024,
    height: 1024,
    style: 'photorealistic',
    guidance: 7.5,
    steps: 50,
    seed: undefined
  });

  const updateSettings = useCallback((key: keyof GenerationSettings, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  }, []);

  const handleResolutionChange = useCallback((value: string) => {
    const preset = RESOLUTION_PRESETS.find(p => p.value === value);
    if (preset) {
      updateSettings('width', preset.width);
      updateSettings('height', preset.height);
    }
  }, [updateSettings]);

  const generateImages = useCallback(async () => {
    if (!prompt.trim()) {
      toast.error('Please enter a prompt');
      return;
    }

    setIsGenerating(true);
    setProgress(0);

    try {
      const progressInterval = setInterval(() => {
        setProgress(prev => Math.min(prev + Math.random() * 15, 90));
      }, 1000);

      const requests = Array.from({ length: batchCount }, async (_, index) => {
        const response = await fetch('/api/generate', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            prompt,
            systemPrompt,
            settings: {
              ...settings,
              seed: settings.seed ? settings.seed + index : undefined
            }
          }),
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.message || 'Generation failed');
        }

        return response.json();
      });

      const results = await Promise.all(requests);
      clearInterval(progressInterval);
      setProgress(100);

      const newImages: GeneratedImage[] = results.map((result, index) => ({
        id: `${Date.now()}-${index}`,
        url: result.imageUrl,
        prompt,
        timestamp: new Date(),
        settings: { ...settings }
      }));

      setGeneratedImages(prev => [...newImages, ...prev]);
      
      // Save to localStorage
      const existingHistory = JSON.parse(localStorage.getItem('imageHistory') || '[]');
      localStorage.setItem('imageHistory', JSON.stringify([...newImages, ...existingHistory]));

      toast.success(`Generated ${batchCount} image${batchCount > 1 ? 's' : ''} successfully!`);
    } catch (error) {
      console.error('Generation error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to generate image');
    } finally {
      setIsGenerating(false);
      setProgress(0);
    }
  }, [prompt, systemPrompt, settings, batchCount]);

  const downloadImage = useCallback(async (imageUrl: string, filename: string) => {
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
  }, []);

  const regenerateImage = useCallback((image: GeneratedImage) => {
    setPrompt(image.prompt);
    setSettings(image.settings);
    generateImages();
  }, [generateImages]);

  return (
    <div className="w-full max-w-6xl mx-auto p-6 space-y-6">
      {/* Main Generation Interface */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            AI Image Generator
            <Badge variant="secondary">FLUX 1.1 Pro</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Prompt Input */}
          <div className="space-y-2">
            <Label htmlFor="prompt">Image Prompt</Label>
            <Textarea
              id="prompt"
              placeholder="Describe the image you want to generate..."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="min-h-[100px] resize-none"
              disabled={isGenerating}
            />
          </div>

          {/* Basic Settings */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Resolution</Label>
              <Select onValueChange={handleResolutionChange} disabled={isGenerating}>
                <SelectTrigger>
                  <SelectValue placeholder="Select resolution" />
                </SelectTrigger>
                <SelectContent>
                  {RESOLUTION_PRESETS.map((preset) => (
                    <SelectItem key={preset.value} value={preset.value}>
                      {preset.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Style</Label>
              <Select value={settings.style} onValueChange={(value) => updateSettings('style', value)} disabled={isGenerating}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {STYLE_PRESETS.map((style) => (
                    <SelectItem key={style.value} value={style.value}>
                      {style.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Batch Count</Label>
              <Select value={batchCount.toString()} onValueChange={(value) => setBatchCount(parseInt(value))} disabled={isGenerating}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[1, 2, 3, 4].map((count) => (
                    <SelectItem key={count} value={count.toString()}>
                      {count} image{count > 1 ? 's' : ''}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Advanced Settings Toggle */}
          <div className="flex items-center space-x-2">
            <Switch
              id="advanced"
              checked={showAdvanced}
              onCheckedChange={setShowAdvanced}
              disabled={isGenerating}
            />
            <Label htmlFor="advanced">Advanced Settings</Label>
          </div>

          {/* Advanced Settings */}
          {showAdvanced && (
            <div className="space-y-4 p-4 border rounded-lg bg-muted/50">
              <div className="space-y-2">
                <Label htmlFor="system-prompt">System Prompt</Label>
                <Textarea
                  id="system-prompt"
                  placeholder="System instructions for image generation..."
                  value={systemPrompt}
                  onChange={(e) => setSystemPrompt(e.target.value)}
                  className="min-h-[80px] resize-none"
                  disabled={isGenerating}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Guidance Scale: {settings.guidance}</Label>
                  <Slider
                    value={[settings.guidance]}
                    onValueChange={(value) => updateSettings('guidance', value[0])}
                    min={1}
                    max={20}
                    step={0.5}
                    disabled={isGenerating}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Steps: {settings.steps}</Label>
                  <Slider
                    value={[settings.steps]}
                    onValueChange={(value) => updateSettings('steps', value[0])}
                    min={20}
                    max={100}
                    step={5}
                    disabled={isGenerating}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="seed">Seed (optional)</Label>
                <input
                  id="seed"
                  type="number"
                  placeholder="Random seed for reproducible results"
                  value={settings.seed || ''}
                  onChange={(e) => updateSettings('seed', e.target.value ? parseInt(e.target.value) : undefined)}
                  className="w-full px-3 py-2 border rounded-md"
                  disabled={isGenerating}
                />
              </div>
            </div>
          )}

          {/* Generation Progress */}
          {isGenerating && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Generating images...</span>
                <span>{Math.round(progress)}%</span>
              </div>
              <Progress value={progress} className="w-full" />
            </div>
          )}

          {/* Generate Button */}
          <Button
            onClick={generateImages}
            disabled={isGenerating || !prompt.trim()}
            className="w-full"
            size="lg"
          >
            {isGenerating ? 'Generating...' : `Generate ${batchCount} Image${batchCount > 1 ? 's' : ''}`}
          </Button>
        </CardContent>
      </Card>

      {/* Generated Images Gallery */}
      {generatedImages.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Generated Images</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {generatedImages.map((image) => (
                <div key={image.id} className="group relative">
                  <div className="aspect-square overflow-hidden rounded-lg border">
                    <img
                      src={image.url}
                      alt={image.prompt}
                      className="w-full h-full object-cover transition-transform group-hover:scale-105"
                    />
                  </div>
                  
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center space-x-2">
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => downloadImage(image.url, `generated-${image.id}.png`)}
                    >
                      Download
                    </Button>
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => regenerateImage(image)}
                    >
                      Regenerate
                    </Button>
                  </div>

                  <div className="mt-2 space-y-1">
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {image.prompt}
                    </p>
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>{image.settings.width}×{image.settings.height}</span>
                      <span>{image.timestamp.toLocaleTimeString()}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}