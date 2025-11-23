'use client'

import { useState, useEffect } from 'react'
import { Loader2, Plus, Trash2 } from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import { useToast } from '@/hooks/use-toast'

import type { FreeKey } from '@/lib/db/freeKeys'

interface FreeKeyDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  freeKey?: FreeKey | null
  onSuccess: () => void
}

export function FreeKeyDialog({ open, onOpenChange, freeKey, onSuccess }: FreeKeyDialogProps) {
  const [keyType, setKeyType] = useState<'claude' | 'llm'>('claude')
  const [status, setStatus] = useState<'active' | 'inactive' | 'exhausted'>('active')
  const [keyValues, setKeyValues] = useState<string[]>([''])
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  const resetForm = () => {
    setKeyType(freeKey?.keyType || 'claude')
    setStatus(freeKey?.status || 'active')

    if (freeKey?.keyValues) {
      try {
        const parsedKeys = JSON.parse(freeKey.keyValues) as string[]
        setKeyValues(parsedKeys.length > 0 ? parsedKeys : [''])
      } catch {
        setKeyValues([''])
      }
    } else {
      setKeyValues([''])
    }
  }

  useEffect(() => {
    if (open) {
      resetForm()
    }
  }, [open, freeKey])

  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) {
      setTimeout(resetForm, 100)
    }
    onOpenChange(isOpen)
  }

  // 添加新的密钥输入框
  const addKeyInput = () => {
    setKeyValues([...keyValues, ''])
  }

  // 删除密钥输入框
  const removeKeyInput = (index: number) => {
    if (keyValues.length > 1) {
      setKeyValues(keyValues.filter((_, i) => i !== index))
    }
  }

  // 更新密钥值
  const updateKeyValue = (index: number, value: string) => {
    const newKeyValues = [...keyValues]
    newKeyValues[index] = value
    setKeyValues(newKeyValues)
  }

  // 从文本区域批量导入
  const handleBatchImport = (text: string) => {
    const lines = text.split('\n').filter(line => line.trim() !== '')
    if (lines.length > 0) {
      setKeyValues(lines)
    }
  }

  const handleSubmit = async () => {
    // 验证必填字段
    const validKeys = keyValues.filter(key => key.trim() !== '')

    if (validKeys.length === 0) {
      toast({
        title: '验证失败',
        description: '请至少输入一个密钥',
        variant: 'destructive'
      })
      return
    }

    // 验证密钥格式
    const invalidKeys = validKeys.filter(key => !key.startsWith('sk-'))
    if (invalidKeys.length > 0) {
      toast({
        title: '验证失败',
        description: `密钥格式错误，必须以 sk- 开头：${invalidKeys.slice(0, 3).join(', ')}${invalidKeys.length > 3 ? '...' : ''}`,
        variant: 'destructive'
      })
      return
    }

    setLoading(true)

    try {
      const url = freeKey ? `/api/freeKeys/${freeKey.id}` : '/api/freeKeys'
      const method = freeKey ? 'PUT' : 'POST'

      const body = {
        keyValues: validKeys,
        keyType,
        status
      }

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
      })

      const data = await response.json()

      if (data.success) {
        toast({
          title: freeKey ? '更新成功' : '创建成功',
          description: `免费密钥已${freeKey ? '更新' : '创建'}，包含 ${validKeys.length} 个密钥`
        })
        onSuccess()
        onOpenChange(false)
      } else {
        toast({
          title: freeKey ? '更新失败' : '创建失败',
          description: data.error || `无法${freeKey ? '更新' : '创建'}免费密钥`,
          variant: 'destructive'
        })
      }
    } catch (error) {
      console.error('Error saving free key:', error)
      toast({
        title: freeKey ? '更新失败' : '创建失败',
        description: '网络错误，请稍后重试',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{freeKey ? '编辑免费密钥' : '添加免费密钥'}</DialogTitle>
          <DialogDescription>
            {freeKey ? '修改免费密钥信息' : '创建新的免费密钥配置'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="keyType">密钥类型</Label>
              <Select value={keyType} onValueChange={(value: 'claude' | 'llm') => setKeyType(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="claude">Claude</SelectItem>
                  <SelectItem value="llm">LLM</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">状态</Label>
              <Select value={status} onValueChange={(value: 'active' | 'inactive' | 'exhausted') => setStatus(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">活跃</SelectItem>
                  <SelectItem value="inactive">非活跃</SelectItem>
                  <SelectItem value="exhausted">已耗尽</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>API 密钥</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addKeyInput}
                className="gap-2"
              >
                <Plus className="h-4 w-4" />
                添加密钥
              </Button>
            </div>

            <div className="space-y-3">
              {keyValues.map((keyValue, index) => (
                <div key={index} className="flex gap-2">
                  <Input
                    placeholder={`sk-${keyType === 'claude' ? 'Claude' : 'LLM'}密钥${index + 1}`}
                    value={keyValue}
                    onChange={(e) => updateKeyValue(index, e.target.value)}
                    className="font-mono text-sm"
                  />
                  {keyValues.length > 1 && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => removeKeyInput(index)}
                      className="px-3"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="batchImport">批量导入（可选）</Label>
            <Textarea
              id="batchImport"
              placeholder="将多个密钥粘贴到这里，每行一个密钥..."
              className="min-h-[100px] font-mono text-sm"
              onChange={(e) => {
                if (e.target.value.trim()) {
                  handleBatchImport(e.target.value)
                  e.target.value = '' // 清空文本区域
                }
              }}
            />
            <p className="text-xs text-muted-foreground">
              粘贴密钥后会自动替换上方的单个输入框
            </p>
          </div>

          <div className="bg-muted p-4 rounded-lg">
            <h4 className="font-medium mb-2">当前密钥统计</h4>
            <p className="text-sm text-muted-foreground">
              有效密钥数量: {keyValues.filter(key => key.trim() !== '').length}
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
            取消
          </Button>
          <Button onClick={handleSubmit} disabled={loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {freeKey ? '更新' : '创建'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}