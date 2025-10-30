"use client"

import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { FileText } from "lucide-react"

interface KeywordInputProps {
  value: string
  onChange: (value: string) => void
  onQueryShortcut?: () => void
}

export function KeywordInput({ value, onChange, onQueryShortcut }: KeywordInputProps) {
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.ctrlKey && e.key === 'Enter' && onQueryShortcut) {
      onQueryShortcut()
    }
  }

  return (
    <div className="space-y-3">
      <Label htmlFor="keywords" className="text-base font-semibold flex items-center gap-2">
        <FileText className="h-5 w-5" />
        关键词列表（每行一个关键词）
      </Label>
      <Textarea
        id="keywords"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="请输入关键词，每行一个，例如：&#10;python programming&#10;machine learning&#10;web development&#10;data science&#10;&#10;提示：按 Ctrl+Enter 快速开始查询"
        className="min-h-[200px] font-mono text-sm"
      />
      <p className="text-xs text-muted-foreground">
        提示：按 <kbd className="px-1.5 py-0.5 bg-muted rounded border">Ctrl</kbd> + <kbd className="px-1.5 py-0.5 bg-muted rounded border">Enter</kbd> 快速开始查询
      </p>
    </div>
  )
}
