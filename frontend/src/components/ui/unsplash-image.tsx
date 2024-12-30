import Image from 'next/image'

interface UnsplashImageProps {
  id: string
  alt: string
  width?: number
  height?: number
  quality?: number
  className?: string
}

export function UnsplashImage({
  id,
  alt,
  width = 800,
  height = 600,
  quality = 75,
  className,
}: UnsplashImageProps) {
  return (
    <Image
      src={`https://images.unsplash.com/${id}?auto=format&fit=crop&w=${width}&q=${quality}`}
      alt={alt}
      width={width}
      height={height}
      className={className}
    />
  )
}
