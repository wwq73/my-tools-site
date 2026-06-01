import { useEffect } from 'react'

interface SEOProps {
  title?: string
  description?: string
  keywords?: string
}

export function SEO({ title, description, keywords }: SEOProps) {
  useEffect(() => {
    if (title) {
      document.title = `${title} - MyTools`
    }
    const metaDesc = document.querySelector('meta[name="description"]')
    if (description && metaDesc) {
      metaDesc.setAttribute('content', description)
    }
    const metaKeywords = document.querySelector('meta[name="keywords"]')
    if (keywords && metaKeywords) {
      metaKeywords.setAttribute('content', keywords)
    }
  }, [title, description, keywords])

  return null
}
