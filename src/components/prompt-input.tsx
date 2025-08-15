"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

interface PromptInputProps {
  onGenerate: (prompt: string, systemPrompt: string) => void;
  isGenerating: boolean;
}

const STYLE_PRESETS = [
  { name: "Photorealistic", prompt: "photorealistic, high quality, detailed, professional photography" },
  { name: "Digital Art", prompt: "digital art, concept art, trending on artstation, highly detailed" },
  { name: "Oil Painting", prompt: "oil painting, classical art style, brush strokes, artistic" },
  { name: "Anime", prompt: "anime style, manga, japanese animation, vibrant colors" },
  { name: "Cyberpunk", prompt: "cyberpunk, neon lights, futuristic, sci-fi, dark atmosphere" },
  { name: "Fantasy", prompt: "fantasy art, magical, mystical, ethereal, enchanted" },
  { name: "Minimalist", prompt: "minimalist, clean, simple, modern design, geometric" },
  { name: "Vintage", prompt: "vintage, retro, nostalgic, aged, classic style" }
];

const PROMPT_SUGGESTIONS = [
  "A majestic mountain landscape at sunset",
  "A futuristic city with flying cars",
  "A cozy coffee shop in autumn",
  "An underwater coral reef scene",
  "A space station orbiting Earth",
  "A medieval castle on a hilltop",
  "A robot gardener tending flowers",
  "A magical forest with glowing trees"
];

export function PromptInput({ onGenerate, isGenerating }: PromptInputProps) {
  const [prompt, setPrompt] = useState("");
  const [systemPrompt, setSystemPrompt] = useState("Create a high-quality, detailed image based on the user's description. Focus on artistic composition, proper lighting, and visual appeal.");
  const [showAdvanced, setShowAdvanced] = useState(false);

  const handleGenerate = () => {
    if (prompt.trim()) {
      onGenerate(prompt.trim(), systemPrompt.trim());
    }
  };

  const applyStylePreset = (presetPrompt: string) => {
    const currentPrompt = prompt.trim();
    if (currentPrompt) {
      setPrompt(`${currentPrompt}, ${presetPrompt}`);
    } else {
      setPrompt(presetPrompt);
    }
  };

  const applySuggestion = (suggestion: string) => {
    setPrompt(suggestion);
  };

  const clearPrompt = () => {
    setPrompt("");
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Generate Image</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Main Prompt Input */}
        <div className="space-y-2">
          <Label htmlFor="prompt">Describe your image</Label>
          <Textarea
            id="prompt"
            placeholder="Enter a detailed description of the image you want to generate..."
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            className="min-h-[100px] resize-none"
            disabled={isGenerating}
          />
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">
              {prompt.length} characters
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={clearPrompt}
              disabled={isGenerating || !prompt}
            >
              Clear
            </Button>
          </div>
        </div>

        {/* Style Presets */}
        <div className="space-y-3">
          <Label>Style Presets</Label>
          <div className="flex flex-wrap gap-2">
            {STYLE_PRESETS.map((preset) => (
              <Badge
                key={preset.name}
                variant="secondary"
                className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors"
                onClick={() => applyStylePreset(preset.prompt)}
              >
                {preset.name}
              </Badge>
            ))}
          </div>
        </div>

        {/* Prompt Suggestions */}
        <div className="space-y-3">
          <Label>Prompt Suggestions</Label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {PROMPT_SUGGESTIONS.map((suggestion, index) => (
              <Button
                key={index}
                variant="outline"
                size="sm"
                className="justify-start text-left h-auto py-2 px-3"
                onClick={() => applySuggestion(suggestion)}
                disabled={isGenerating}
              >
                {suggestion}
              </Button>
            ))}
          </div>
        </div>

        <Separator />

        {/* Advanced Settings Toggle */}
        <Button
          variant="ghost"
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="w-full"
        >
          {showAdvanced ? "Hide" : "Show"} Advanced Settings
        </Button>

        {/* Advanced Settings */}
        {showAdvanced && (
          <div className="space-y-4 pt-4 border-t">
            <div className="space-y-2">
              <Label htmlFor="system-prompt">System Prompt</Label>
              <Textarea
                id="system-prompt"
                placeholder="Customize how the AI interprets your prompts..."
                value={systemPrompt}
                onChange={(e) => setSystemPrompt(e.target.value)}
                className="min-h-[80px] resize-none"
                disabled={isGenerating}
              />
              <p className="text-sm text-muted-foreground">
                This controls how the AI model interprets and processes your image descriptions.
              </p>
            </div>
          </div>
        )}

        {/* Generate Button */}
        <Button
          onClick={handleGenerate}
          disabled={isGenerating || !prompt.trim()}
          className="w-full"
          size="lg"
        >
          {isGenerating ? "Generating..." : "Generate Image"}
        </Button>
      </CardContent>
    </Card>
  );
}