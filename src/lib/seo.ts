const BASE_URL = 'https://postpencil.com'

export function siteMetadata(title?: string, description?: string) {
  const t = title ? `${title} | PostPencil` : 'PostPencil — Share & Learn'
  const d = description || 'PostPencil is a social learning platform where students share educational resources, notes, PDFs, presentations, and study materials.'
  return {
    title: t,
    description: d,
    openGraph: {
      title: t,
      description: d,
      url: BASE_URL,
      siteName: 'PostPencil',
      images: [
        {
          url: `${BASE_URL}/og.png`,
          width: 1200,
          height: 630,
          alt: 'PostPencil',
        },
      ],
      locale: 'en_US',
      type: 'website' as const,
    },
    twitter: {
      card: 'summary_large_image' as const,
      title: t,
      description: d,
      images: [`${BASE_URL}/og.png`],
    },
  }
}

export function postJsonLd(post: {
  title?: string | null
  description?: string | null
  subject?: string | null
  course?: string | null
  createdAt?: Date | string | null
  user?: { name?: string | null; username?: string | null } | null
  likesCount?: number | null
  commentsCount?: number | null
  viewsCount?: number | null
}, postId: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.title || 'Educational Resource',
    description: post.description || undefined,
    author: post.user ? {
      '@type': 'Person',
      name: post.user.name || post.user.username,
      url: `${BASE_URL}/user/${post.user.username}`,
    } : undefined,
    datePublished: post.createdAt ? new Date(post.createdAt).toISOString() : undefined,
    publisher: {
      '@type': 'Organization',
      name: 'PostPencil',
      url: BASE_URL,
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `${BASE_URL}/post/${postId}`,
    },
    keywords: [post.subject, post.course].filter(Boolean).join(', ') || undefined,
    interactionStatistic: [
      ...(post.likesCount ? [{
        '@type': 'InteractionCounter',
        interactionType: 'https://schema.org/Like',
        userInteractionCount: post.likesCount,
      }] : []),
      ...(post.commentsCount ? [{
        '@type': 'InteractionCounter',
        interactionType: 'https://schema.org/Comment',
        userInteractionCount: post.commentsCount,
      }] : []),
      ...(post.viewsCount ? [{
        '@type': 'InteractionCounter',
        interactionType: 'https://schema.org/ViewAction',
        userInteractionCount: post.viewsCount,
      }] : []),
    ],
  }
}

export function profileJsonLd(user: {
  name?: string | null
  username?: string | null
  bio?: string | null
  image?: string | null
  postsCount?: number | null
  followersCount?: number | null
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: user.name || user.username,
    url: `${BASE_URL}/user/${user.username}`,
    image: user.image || undefined,
    description: user.bio || undefined,
    worksFor: {
      '@type': 'CollegeOrUniversity',
      name: 'PostPencil Community',
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `${BASE_URL}/user/${user.username}`,
    },
  }
}

export function websiteJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'PostPencil',
    url: BASE_URL,
    description: 'A social learning platform where students share educational resources.',
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${BASE_URL}/search?q={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
    publisher: {
      '@type': 'Organization',
      name: 'PostPencil',
      url: BASE_URL,
    },
  }
}

export function breadcrumbJsonLd(items: { name: string; url: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.name,
      item: `${BASE_URL}${item.url}`,
    })),
  }
}
