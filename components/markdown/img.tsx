import Image from 'next/image'

interface ImageProps {
  src?: string
  alt?: string
}

// 验证 URL 是否有效
function isValidUrl(url: string): boolean {
  try {
    new URL(url)
    return true
  } catch {
    // 如果不是完整 URL，检查是否是相对路径
    return url.startsWith('/') || url.startsWith('./')
  }
}

export default function ImageBlock({ src, alt }: ImageProps) {
  if (!src || !isValidUrl(src)) {
    console.warn('Invalid image src:', src)
    return null
  }

  // 如果是外部 URL，使用 img 标签而不是 Next.js Image
  const isExternal = src.startsWith('http://') || src.startsWith('https://')

  if (isExternal) {
    return (
      <figure className="mx-auto mb-4 flex max-w-lg flex-col items-center lg:max-w-xl">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={src}
          alt={alt || ''}
          className="m-0 mb-2 h-auto w-full rounded-lg"
        />
        {alt && <figcaption className="m-0 text-sm text-gray-500 dark:text-gray-400">{alt}</figcaption>}
      </figure>
    )
  }

  return (
    <figure className="mx-auto mb-4 flex max-w-lg flex-col items-center lg:max-w-xl">
      <Image src={src} width={0} height={0} alt={alt || ''} sizes="100vw" className="m-0 mb-2 h-auto w-full" />
      {alt && <figcaption className="m-0 text-sm text-gray-500 dark:text-gray-400">{alt}</figcaption>}
    </figure>
  )
}
