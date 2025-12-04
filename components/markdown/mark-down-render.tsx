import Markdown from 'markdown-to-jsx'

import ImageBlock from '@/components/markdown/img'
import VideoBlock from '@/components/markdown/video'

interface MarkdownRenderProps {
  content: string
}

const MarkdownRender = ({ content }: MarkdownRenderProps) => {
  // 为标题生成 id
  const generateId = (text: string) => {
    return text
      .toLowerCase()
      .replace(/[^\w\u4e00-\u9fa5]+/g, '-')
      .replace(/^-+|-+$/g, '')
  }

  return (
    <Markdown
      className="prose prose-sm sm:prose-base lg:prose-lg dark:prose-invert max-w-none
                prose-headings:font-bold
                prose-headings:text-foreground
                prose-h1:text-2xl sm:prose-h1:text-3xl lg:prose-h1:text-4xl
                prose-h2:text-xl sm:prose-h2:text-2xl lg:prose-h2:text-3xl
                prose-h3:text-lg sm:prose-h3:text-xl lg:prose-h3:text-2xl
                prose-h1:bg-gradient-to-r prose-h1:from-primary prose-h1:via-orange-500 prose-h1:to-amber-500
                prose-h1:bg-clip-text prose-h1:text-transparent
                prose-h2:text-primary
                prose-p:text-foreground
                prose-p:leading-relaxed
                prose-a:text-primary
                prose-a:no-underline
                prose-a:font-medium
                hover:prose-a:text-orange-500
                hover:prose-a:underline
                prose-strong:text-foreground
                prose-strong:font-semibold
                prose-code:text-primary
                prose-code:bg-muted
                prose-code:px-1.5
                prose-code:py-0.5
                prose-code:rounded
                prose-code:before:content-none
                prose-code:after:content-none
                prose-pre:bg-muted
                prose-pre:border
                prose-pre:border-border
                prose-img:rounded-lg
                prose-img:shadow-md
                prose-blockquote:border-l-primary
                prose-blockquote:bg-muted/50
                prose-blockquote:py-1
                prose-blockquote:px-4
                prose-ul:list-disc
                prose-ol:list-decimal
                prose-li:text-foreground
                prose-table:border-collapse
                prose-th:bg-muted
                prose-th:border
                prose-th:border-border
                prose-td:border
                prose-td:border-border"
      options={{
        overrides: {
          img: ({ src, alt }) => <ImageBlock src={src} alt={alt} />,
          CustomVideo: ({ src, title }) => <VideoBlock src={src} title={title} />,
          h1: ({ children, ...props }) => (
            <h1 id={generateId(String(children))} {...props}>
              {children}
            </h1>
          ),
          h2: ({ children, ...props }) => (
            <h2 id={generateId(String(children))} {...props}>
              {children}
            </h2>
          ),
          h3: ({ children, ...props }) => (
            <h3 id={generateId(String(children))} {...props}>
              {children}
            </h3>
          ),
          h4: ({ children, ...props }) => (
            <h4 id={generateId(String(children))} {...props}>
              {children}
            </h4>
          ),
          h5: ({ children, ...props }) => (
            <h5 id={generateId(String(children))} {...props}>
              {children}
            </h5>
          ),
          h6: ({ children, ...props }) => (
            <h6 id={generateId(String(children))} {...props}>
              {children}
            </h6>
          )
        }
      }}
    >
      {content}
    </Markdown>
  )
}

export default MarkdownRender
