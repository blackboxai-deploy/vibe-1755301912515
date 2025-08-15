"use client"

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'

interface GeneratedImage {
  id: string
  prompt: string
  imageUrl: string
  timestamp: Date
  settings: {
    width: number
    height: number
    style: string
    guidance: number
  }
  status: 'completed' | 'failed' | 'generating'
}

interface HistorySidebarProps {
  isOpen: boolean
  onClose: () => void
  onPromptSelect: (prompt: string) => void
  onImageRegenerate: (prompt: string, settings: any) => void
}

export function HistorySidebar({ isOpen, onClose, onPromptSelect, onImageRegenerate }: HistorySidebarProps) {
  const [history, setHistory] = useState<GeneratedImage[]>([])
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (isOpen) {
      loadHistory()
    }
  }, [isOpen])

  const loadHistory = async () => {
    setIsLoading(true)
    try {
      // Load from localStorage for now
      const savedHistory = localStorage.getItem('image-generation-history')
      if (savedHistory) {
        const parsedHistory = JSON.parse(savedHistory).map((item: any) => ({
          ...item,
          timestamp: new Date(item.timestamp)
        }))
        setHistory(parsedHistory.reverse()) // Show newest first
      }
    } catch (error) {
      console.error('Failed to load history:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const clearHistory = () => {
    localStorage.removeItem('image-generation-history')
    setHistory([])
  }

  const deleteItem = (id: string) => {
    const updatedHistory = history.filter(item => item.id !== id)
    setHistory(updatedHistory)
    localStorage.setItem('image-generation-history', JSON.stringify(updatedHistory))
  }

  const formatTimestamp = (timestamp: Date) => {
    const now = new Date()
    const diff = now.getTime() - timestamp.getTime()
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)

    if (minutes < 1) return 'Just now'
    if (minutes < 60) return `${minutes}m ago`
    if (hours < 24) return `${hours}h ago`
    return `${days}d ago`
  }

  const truncatePrompt = (prompt: string, maxLength: number = 60) => {
    return prompt.length > maxLength ? prompt.substring(0, maxLength) + '...' : prompt
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm">
      <div className="fixed right-0 top-0 h-full w-96 bg-background border-l shadow-lg">
        <Card className="h-full rounded-none border-0">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
            <CardTitle className="text-lg font-semibold">Generation History</CardTitle>
            <div className="flex gap-2">
              {history.length > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={clearHistory}
                  className="text-xs"
                >
                  Clear All
                </Button>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="h-8 w-8 p-0"
              >
                ×
              </Button>
            </div>
          </CardHeader>
          
          <CardContent className="p-0 h-[calc(100%-80px)]">
            <ScrollArea className="h-full px-4">
              {isLoading ? (
                <div className="flex items-center justify-center h-32">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : history.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-32 text-muted-foreground">
                  <p className="text-sm">No generation history yet</p>
                  <p className="text-xs mt-1">Generated images will appear here</p>
                </div>
              ) : (
                <div className="space-y-4 pb-4">
                  {history.map((item, index) => (
                    <div key={item.id}>
                      <div className="group relative bg-card rounded-lg border p-3 hover:shadow-md transition-shadow">
                        <div className="flex gap-3">
                          <div className="relative w-16 h-16 rounded-md overflow-hidden bg-muted flex-shrink-0">
                            {item.status === 'completed' ? (
                              <img
                                src={item.imageUrl}
                                alt="Generated"
                                className="w-full h-full object-cover"
                              />
                            ) : item.status === 'generating' ? (
                              <div className="w-full h-full flex items-center justify-center">
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                              </div>
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                                <span className="text-xs">Failed</span>
                              </div>
                            )}
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2">
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <p className="text-sm font-medium leading-tight cursor-pointer hover:text-primary transition-colors">
                                      {truncatePrompt(item.prompt)}
                                    </p>
                                  </TooltipTrigger>
                                  <TooltipContent side="left" className="max-w-xs">
                                    <p className="text-xs">{item.prompt}</p>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                              
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => deleteItem(item.id)}
                                className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                              >
                                ×
                              </Button>
                            </div>
                            
                            <div className="flex items-center gap-2 mt-1">
                              <Badge variant="secondary" className="text-xs">
                                {item.settings.width}×{item.settings.height}
                              </Badge>
                              <Badge variant="outline" className="text-xs">
                                {item.settings.style}
                              </Badge>
                            </div>
                            
                            <p className="text-xs text-muted-foreground mt-1">
                              {formatTimestamp(item.timestamp)}
                            </p>
                            
                            <div className="flex gap-1 mt-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => onPromptSelect(item.prompt)}
                                className="h-6 text-xs px-2"
                              >
                                Use Prompt
                              </Button>
                              {item.status === 'completed' && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => onImageRegenerate(item.prompt, item.settings)}
                                  className="h-6 text-xs px-2"
                                >
                                  Regenerate
                                </Button>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      {index < history.length - 1 && <Separator className="mt-4" />}
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}