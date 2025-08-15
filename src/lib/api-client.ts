export interface ImageGenerationRequest {
  prompt: string;
  systemPrompt?: string;
  width?: number;
  height?: number;
  guidance_scale?: number;
  num_inference_steps?: number;
  seed?: number;
}

export interface ImageGenerationResponse {
  id: string;
  prompt: string;
  imageUrl: string;
  createdAt: string;
  parameters: {
    width: number;
    height: number;
    guidance_scale: number;
    num_inference_steps: number;
    seed?: number;
  };
}

export interface GenerationHistory {
  id: string;
  prompt: string;
  imageUrl: string;
  createdAt: string;
  parameters: any;
}

class ApiClient {
  private baseUrl = 'https://oi-server.onrender.com/chat/completions';
  private customerId = 'cus_SGPn4uhjPI0F4w';
  private authToken = 'xxx';

  private getHeaders() {
    return {
      'CustomerId': this.customerId,
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${this.authToken}`
    };
  }

  async generateImage(request: ImageGenerationRequest): Promise<ImageGenerationResponse> {
    const payload = {
      model: 'replicate/black-forest-labs/flux-1.1-pro',
      messages: [
        {
          role: 'system',
          content: request.systemPrompt || 'Generate a high-quality, detailed image based on the user prompt. Focus on artistic composition, proper lighting, and visual appeal.'
        },
        {
          role: 'user',
          content: request.prompt
        }
      ],
      parameters: {
        width: request.width || 1024,
        height: request.height || 1024,
        guidance_scale: request.guidance_scale || 7.5,
        num_inference_steps: request.num_inference_steps || 50,
        ...(request.seed && { seed: request.seed })
      }
    };

    const response = await fetch(this.baseUrl, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`Image generation failed: ${response.status} ${response.statusText}. ${errorData.message || ''}`);
    }

    const data = await response.json();
    
    return {
      id: data.id || Date.now().toString(),
      prompt: request.prompt,
      imageUrl: data.choices?.[0]?.message?.content || data.image_url || '',
      createdAt: new Date().toISOString(),
      parameters: {
        width: request.width || 1024,
        height: request.height || 1024,
        guidance_scale: request.guidance_scale || 7.5,
        num_inference_steps: request.num_inference_steps || 50,
        ...(request.seed && { seed: request.seed })
      }
    };
  }

  async getHistory(): Promise<GenerationHistory[]> {
    const history = localStorage.getItem('image-generation-history');
    return history ? JSON.parse(history) : [];
  }

  async saveToHistory(generation: ImageGenerationResponse): Promise<void> {
    const history = await this.getHistory();
    const newHistory = [generation, ...history].slice(0, 50); // Keep last 50 generations
    localStorage.setItem('image-generation-history', JSON.stringify(newHistory));
  }

  async deleteFromHistory(id: string): Promise<void> {
    const history = await this.getHistory();
    const filteredHistory = history.filter(item => item.id !== id);
    localStorage.setItem('image-generation-history', JSON.stringify(filteredHistory));
  }

  async clearHistory(): Promise<void> {
    localStorage.removeItem('image-generation-history');
  }
}

export const apiClient = new ApiClient();

export const STYLE_PRESETS = {
  photorealistic: {
    name: 'Photorealistic',
    systemPrompt: 'Generate a photorealistic, high-resolution image with natural lighting, sharp details, and realistic textures. Focus on accuracy and lifelike appearance.'
  },
  artistic: {
    name: 'Artistic',
    systemPrompt: 'Create an artistic interpretation with creative composition, interesting color palettes, and stylized elements. Emphasize visual appeal and artistic expression.'
  },
  abstract: {
    name: 'Abstract',
    systemPrompt: 'Generate an abstract composition with bold shapes, vibrant colors, and non-representational forms. Focus on visual impact and creative interpretation.'
  },
  portrait: {
    name: 'Portrait',
    systemPrompt: 'Create a high-quality portrait with proper facial features, natural skin tones, and professional lighting. Focus on detail and human characteristics.'
  },
  landscape: {
    name: 'Landscape',
    systemPrompt: 'Generate a beautiful landscape with natural scenery, proper perspective, and atmospheric effects. Emphasize depth and environmental details.'
  },
  fantasy: {
    name: 'Fantasy',
    systemPrompt: 'Create a fantasy scene with magical elements, mythical creatures, and imaginative environments. Focus on creativity and otherworldly atmosphere.'
  }
};

export const RESOLUTION_PRESETS = [
  { name: 'Square (1024x1024)', width: 1024, height: 1024 },
  { name: 'Portrait (768x1024)', width: 768, height: 1024 },
  { name: 'Landscape (1024x768)', width: 1024, height: 768 },
  { name: 'Wide (1280x720)', width: 1280, height: 720 },
  { name: 'Ultra Wide (1920x1080)', width: 1920, height: 1080 }
];