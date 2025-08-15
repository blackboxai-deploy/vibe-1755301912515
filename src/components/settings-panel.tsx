"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"

export interface GenerationSettings {
  model: string
  resolution: string
  aspectRatio: string
  stylePreset: string
  guidanceScale: number
  steps: number
  seed: number | null
  batchSize: number
  systemPrompt: string
  enableUpscaling: boolean
  enableVariations: boolean
}

interface SettingsPanelProps {
  settings: GenerationSettings
  onSettingsChange: (settings: GenerationSettings) => void
  isGenerating?: boolean
}

const MODELS = [
  { value: "replicate/black-forest-labs/flux-1.1-pro", label: "FLUX 1.1 Pro (Recommended)" },
  { value: "replicate/black-forest-labs/flux-dev", label: "FLUX Dev" },
  { value: "replicate/stability-ai/sdxl", label: "Stable Diffusion XL" }
]

const RESOLUTIONS = [
  { value: "512x512", label: "512×512 (Square)" },
  { value: "768x768", label: "768×768 (Square HD)" },
  { value: "1024x1024", label: "1024×1024 (Square Ultra)" },
  { value: "512x768", label: "512×768 (Portrait)" },
  { value: "768x512", label: "768×512 (Landscape)" },
  { value: "1024x768", label: "1024×768 (Landscape HD)" },
  { value: "768x1024", label: "768×1024 (Portrait HD)" },
  { value: "1920x1080", label: "1920×1080 (Full HD)" }
]

const ASPECT_RATIOS = [
  { value: "1:1", label: "Square (1:1)" },
  { value: "4:3", label: "Standard (4:3)" },
  { value: "16:9", label: "Widescreen (16:9)" },
  { value: "3:4", label: "Portrait (3:4)" },
  { value: "9:16", label: "Vertical (9:16)" },
  { value: "21:9", label: "Ultrawide (21:9)" }
]

const STYLE_PRESETS = [
  { value: "none", label: "None", description: "No style modification" },
  { value: "photorealistic", label: "Photorealistic", description: "Realistic photography style" },
  { value: "artistic", label: "Artistic", description: "Painterly and artistic style" },
  { value: "digital-art", label: "Digital Art", description: "Modern digital artwork" },
  { value: "anime", label: "Anime", description: "Japanese animation style" },
  { value: "oil-painting", label: "Oil Painting", description: "Classical oil painting style" },
  { value: "watercolor", label: "Watercolor", description: "Soft watercolor painting" },
  { value: "sketch", label: "Sketch", description: "Hand-drawn sketch style" },
  { value: "3d-render", label: "3D Render", description: "3D rendered appearance" },
  { value: "vintage", label: "Vintage", description: "Retro and vintage aesthetic" },
  { value: "cyberpunk", label: "Cyberpunk", description: "Futuristic cyberpunk style" },
  { value: "minimalist", label: "Minimalist", description: "Clean and minimal design" }
]

const DEFAULT_SYSTEM_PROMPT = `You are an AI image generator. Create high-quality, detailed images based on the user's prompt. Focus on:
- Visual clarity and composition
- Appropriate lighting and colors
- Realistic proportions and details
- Artistic quality and aesthetic appeal

Generate images that are safe, appropriate, and match the user's creative vision.`

export function SettingsPanel({ settings, onSettingsChange, isGenerating = false }: SettingsPanelProps) {
  const [isAdvancedOpen, setIsAdvancedOpen] = useState(false)
  const [isSystemPromptOpen, setIsSystemPromptOpen] = useState(false)

  const updateSetting = <K extends keyof GenerationSettings>(
    key: K,
    value: GenerationSettings[K]
  ) => {
    onSettingsChange({
      ...settings,
      [key]: value
    })
  }

  const resetToDefaults = () => {
    onSettingsChange({
      model: "replicate/black-forest-labs/flux-1.1-pro",
      resolution: "1024x1024",
      aspectRatio: "1:1",
      stylePreset: "none",
      guidanceScale: 7.5,
      steps: 20,
      seed: null,
      batchSize: 1,
      systemPrompt: DEFAULT_SYSTEM_PROMPT,
      enableUpscaling: false,
      enableVariations: false
    })
  }

  const generateRandomSeed = () => {
    updateSetting("seed", Math.floor(Math.random() * 1000000))
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Generation Settings</CardTitle>
        <CardDescription>
          Customize your AI image generation parameters
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Model Selection */}
        <div className="space-y-2">
          <Label htmlFor="model">AI Model</Label>
          <Select
            value={settings.model}
            onValueChange={(value) => updateSetting("model", value)}
            disabled={isGenerating}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select model" />
            </SelectTrigger>
            <SelectContent>
              {MODELS.map((model) => (
                <SelectItem key={model.value} value={model.value}>
                  {model.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Resolution */}
        <div className="space-y-2">
          <Label htmlFor="resolution">Resolution</Label>
          <Select
            value={settings.resolution}
            onValueChange={(value) => updateSetting("resolution", value)}
            disabled={isGenerating}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select resolution" />
            </SelectTrigger>
            <SelectContent>
              {RESOLUTIONS.map((resolution) => (
                <SelectItem key={resolution.value} value={resolution.value}>
                  {resolution.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Style Preset */}
        <div className="space-y-2">
          <Label htmlFor="style">Style Preset</Label>
          <Select
            value={settings.stylePreset}
            onValueChange={(value) => updateSetting("stylePreset", value)}
            disabled={isGenerating}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select style" />
            </SelectTrigger>
            <SelectContent>
              {STYLE_PRESETS.map((style) => (
                <SelectItem key={style.value} value={style.value}>
                  <div className="flex flex-col">
                    <span>{style.label}</span>
                    <span className="text-xs text-muted-foreground">
                      {style.description}
                    </span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Guidance Scale */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label htmlFor="guidance">Guidance Scale</Label>
            <Badge variant="secondary">{settings.guidanceScale}</Badge>
          </div>
          <Slider
            id="guidance"
            min={1}
            max={20}
            step={0.5}
            value={[settings.guidanceScale]}
            onValueChange={(value) => updateSetting("guidanceScale", value[0])}
            disabled={isGenerating}
            className="w-full"
          />
          <p className="text-xs text-muted-foreground">
            Higher values follow the prompt more closely
          </p>
        </div>

        {/* Batch Size */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label htmlFor="batch">Batch Size</Label>
            <Badge variant="secondary">{settings.batchSize}</Badge>
          </div>
          <Slider
            id="batch"
            min={1}
            max={4}
            step={1}
            value={[settings.batchSize]}
            onValueChange={(value) => updateSetting("batchSize", value[0])}
            disabled={isGenerating}
            className="w-full"
          />
          <p className="text-xs text-muted-foreground">
            Number of images to generate at once
          </p>
        </div>

        <Separator />

        {/* Advanced Settings */}
        <Collapsible open={isAdvancedOpen} onOpenChange={setIsAdvancedOpen}>
          <CollapsibleTrigger asChild>
            <Button variant="ghost" className="w-full justify-between p-0">
              Advanced Settings
              <span className="text-xs">
                {isAdvancedOpen ? "Hide" : "Show"}
              </span>
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="space-y-4 pt-4">
            {/* Steps */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label htmlFor="steps">Inference Steps</Label>
                <Badge variant="secondary">{settings.steps}</Badge>
              </div>
              <Slider
                id="steps"
                min={10}
                max={50}
                step={1}
                value={[settings.steps]}
                onValueChange={(value) => updateSetting("steps", value[0])}
                disabled={isGenerating}
                className="w-full"
              />
              <p className="text-xs text-muted-foreground">
                More steps = higher quality but slower generation
              </p>
            </div>

            {/* Seed */}
            <div className="space-y-2">
              <Label htmlFor="seed">Seed (Optional)</Label>
              <div className="flex gap-2">
                <input
                  type="number"
                  placeholder="Random seed"
                  value={settings.seed || ""}
                  onChange={(e) => updateSetting("seed", e.target.value ? parseInt(e.target.value) : null)}
                  disabled={isGenerating}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={generateRandomSeed}
                  disabled={isGenerating}
                >
                  Random
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Use same seed for reproducible results
              </p>
            </div>

            {/* Enhancement Options */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="upscaling">Enable Upscaling</Label>
                  <p className="text-xs text-muted-foreground">
                    Automatically upscale generated images
                  </p>
                </div>
                <Switch
                  id="upscaling"
                  checked={settings.enableUpscaling}
                  onCheckedChange={(checked) => updateSetting("enableUpscaling", checked)}
                  disabled={isGenerating}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="variations">Generate Variations</Label>
                  <p className="text-xs text-muted-foreground">
                    Create multiple variations of each image
                  </p>
                </div>
                <Switch
                  id="variations"
                  checked={settings.enableVariations}
                  onCheckedChange={(checked) => updateSetting("enableVariations", checked)}
                  disabled={isGenerating}
                />
              </div>
            </div>
          </CollapsibleContent>
        </Collapsible>

        <Separator />

        {/* System Prompt */}
        <Collapsible open={isSystemPromptOpen} onOpenChange={setIsSystemPromptOpen}>
          <CollapsibleTrigger asChild>
            <Button variant="ghost" className="w-full justify-between p-0">
              System Prompt
              <span className="text-xs">
                {isSystemPromptOpen ? "Hide" : "Show"}
              </span>
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label htmlFor="system-prompt">Custom System Prompt</Label>
              <Textarea
                id="system-prompt"
                placeholder="Enter custom system prompt..."
                value={settings.systemPrompt}
                onChange={(e) => updateSetting("systemPrompt", e.target.value)}
                disabled={isGenerating}
                rows={6}
                className="resize-none"
              />
              <p className="text-xs text-muted-foreground">
                Customize how the AI interprets and generates images
              </p>
            </div>
          </CollapsibleContent>
        </Collapsible>

        <Separator />

        {/* Reset Button */}
        <Button
          variant="outline"
          onClick={resetToDefaults}
          disabled={isGenerating}
          className="w-full"
        >
          Reset to Defaults
        </Button>
      </CardContent>
    </Card>
  )
}