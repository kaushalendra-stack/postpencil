import { Metadata } from 'next'
import { LegalLayout, Section, List, Highlight } from '@/components/legal/legal-layout'
import { breadcrumbJsonLd } from '@/lib/seo'

export const metadata: Metadata = {
  title: 'Cookie Policy',
  description:
    'How PostPencil uses cookies and similar technologies to provide and improve our services.',
  alternates: {
    canonical: 'https://postpencil.com/cookies',
  },
}

const sections = [
  { id: 'what-are', title: 'What Are Cookies' },
  { id: 'how-we-use', title: 'How We Use Cookies' },
  { id: 'cookie-types', title: 'Types of Cookies We Use' },
  { id: 'third-party', title: 'Third-Party Cookies' },
  { id: 'managing', title: 'Managing Cookies' },
  { id: 'impact', title: 'Impact of Disabling Cookies' },
  { id: 'updates', title: 'Updates to This Policy' },
  { id: 'contact', title: 'Contact' },
]

export default function CookiesPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            breadcrumbJsonLd([
              { name: 'Home', url: '/' },
              { name: 'Cookie Policy', url: '/cookies' },
            ])
          ),
        }}
      />
      <LegalLayout
        title="Cookie Policy"
        description="How PostPencil uses cookies and similar technologies to provide and improve our services."
        lastUpdated="June 24, 2026"
        sections={sections}
      >
        <Section id="what-are" title="What Are Cookies">
          <p>
            Cookies are small text files that are placed on your device when you visit a
            website. They are widely used to make websites work efficiently and to provide
            information to website owners. Cookies help us recognize your device, remember
            your preferences, and improve your browsing experience on PostPencil.
          </p>
          <p>
            We also use similar technologies such as local storage, session storage, and
            pixel tags that serve similar purposes to cookies. When we refer to
            &quot;cookies&quot; in this policy, we include all these similar technologies.
          </p>
        </Section>

        <Section id="how-we-use" title="How We Use Cookies">
          <p>
            PostPencil uses cookies for several important purposes:
          </p>
          <List items={[
            'Keeping you signed in to your account across sessions',
            'Remembering your preferences such as theme (light/dark), language, and notification settings',
            'Understanding how you use the platform to improve features and performance',
            'Ensuring the security of your account and preventing unauthorized access',
            'Providing personalized content based on your interests and activity',
            'Measuring the effectiveness of platform features and communications',
          ]} />
        </Section>

        <Section id="cookie-types" title="Types of Cookies We Use">
          <p><Highlight>Essential cookies</Highlight></p>
          <p>
            These cookies are strictly necessary for the platform to function. They enable
            core features such as authentication, session management, and security. Without
            these cookies, services you have requested cannot be provided.
          </p>
          <List items={[
            'Session cookies: maintain your logged-in state while browsing',
            'Authentication tokens: verify your identity when accessing protected features',
            'Security cookies: protect against cross-site request forgery and other attacks',
            'Load balancing cookies: distribute traffic across servers for reliability',
          ]} />
          <p><Highlight>Functional cookies</Highlight></p>
          <p>
            These cookies remember your choices and provide enhanced, personalized features.
            They may be set by us or by third-party providers whose services we have added
            to our platform.
          </p>
          <List items={[
            'Theme preference: remembers your light, dark, or system theme choice',
            'Language preference: stores your preferred language setting',
            'Display preferences: remembers font size and layout choices',
            'Settings state: preserves your current settings configuration',
          ]} />
          <p><Highlight>Analytics cookies</Highlight></p>
          <p>
            These cookies help us understand how visitors interact with PostPencil by
            collecting and reporting information anonymously. This helps us improve the
            platform experience.
          </p>
          <List items={[
            'Usage patterns: which features are most frequently used',
            'Navigation flows: how users move through the platform',
            'Performance metrics: page load times and error rates',
            'Engagement metrics: session duration and return visit frequency',
          ]} />
        </Section>

        <Section id="third-party" title="Third-Party Cookies">
          <p>
            Some cookies on PostPencil are placed by third-party services:
          </p>
          <List items={[
            'OAuth providers (Google, GitHub): set during sign-in to authenticate your identity',
            'Analytics providers: help us understand platform usage and performance',
            'Email services: track email delivery and engagement for notification emails',
            'CDN providers: optimize content delivery and caching for faster load times',
          ]} />
          <p>
            We do not control third-party cookies and recommend reviewing the privacy
            policies of these third-party services for more information about their data
            practices.
          </p>
        </Section>

        <Section id="managing" title="Managing Cookies">
          <p>
            You can control and manage cookies through your browser settings. Most browsers
            allow you to:
          </p>
          <List items={[
            'View what cookies are set and delete them individually',
            'Block all cookies or only third-party cookies',
            'Accept all cookies automatically or receive a notification for each cookie',
            'Set cookie preferences on a per-site basis',
          ]} />
          <p>
            Browser-specific instructions can be found in the help section of your browser:
          </p>
          <List items={[
            'Chrome: Settings → Privacy and security → Cookies',
            'Firefox: Settings → Privacy & Security → Cookies and Site Data',
            'Safari: Preferences → Privacy → Manage Website Data',
            'Edge: Settings → Privacy, search, and services → Cookies',
          ]} />
          <p>
            You can also use our cookie preferences to manage non-essential cookies directly
            from the platform.
          </p>
        </Section>

        <Section id="impact" title="Impact of Disabling Cookies">
          <p>
            If you choose to disable cookies, some features of PostPencil may not function
            properly:
          </p>
          <List items={[
            'You may need to sign in each time you visit the platform',
            'Your theme and display preferences may not be remembered',
            'Some features may be slower or less responsive',
            'Personalized content recommendations may not work as expected',
          ]} />
          <p>
            Essential cookies cannot be disabled as they are required for the platform to
            function. Disabling them may prevent you from using PostPencil entirely.
          </p>
        </Section>

        <Section id="updates" title="Updates to This Policy">
          <p>
            We may update this Cookie Policy from time to time to reflect changes in our
            practices or for legal, operational, or regulatory reasons. We will notify you
            of any material changes by posting the updated policy on this page with a new
            &quot;Last updated&quot; date.
          </p>
        </Section>

        <Section id="contact" title="Contact">
          <p>
            If you have questions about our use of cookies, please contact us:
          </p>
          <p>
            Email:{' '}
            <a href="mailto:privacy@postpencil.com" className="text-foreground hover:underline">
              privacy@postpencil.com
            </a>
          </p>
          <p>
            Help Center:{' '}
            <a href="/help" className="text-foreground hover:underline">
              postpencil.com/help
            </a>
          </p>
        </Section>
      </LegalLayout>
    </>
  )
}
