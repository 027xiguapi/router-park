import { cn } from '@/lib/utils'

interface CodeBlockProps {
  children: React.ReactNode | string
  className?: string
}

const CodeBlock = ({ children, className }: CodeBlockProps) => {
  // 检查是否是代码块（通过 className 中是否包含 language- 前缀来判断）
  const isCodeBlock = className?.startsWith('language-')

  if (isCodeBlock) {
    // 代码块：需要 pre 标签包裹，并保留换行和空格
    return (
      <pre className={cn('bg-muted rounded-lg p-4 overflow-x-auto my-4', className)}>
        <code className="text-sm font-mono whitespace-pre">{children}</code>
      </pre>
    )
  }

  // 内联代码：原有样式
  return <code className={cn('bg-muted rounded px-1 py-0.5 text-xs', className)}>{children}</code>
}

export default CodeBlock
