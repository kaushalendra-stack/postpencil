import { Metadata } from 'next'
import { LegalLayout, Section, List, Highlight } from '@/components/legal/legal-layout'
import { breadcrumbJsonLd } from '@/lib/seo'

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description:
    'How PostPencil collects, uses, and protects your personal information. Learn about your data rights and our privacy practices.',
  alternates: {
    canonical: 'https://postpencil.com/privacy',
  },
}

const sections = [
  { id: 'introduction', title: 'Introduction' },
  { id: 'information-collected', title: 'Information We Collect' },
  { id: 'how-we-use', title: 'How We Use Your Information' },
  { id: 'information-sharing', title: 'Information Sharing' },
  { id: 'data-security', title: 'Data Security' },
  { id: 'data-retention', title: 'Data Retention' },
  { id: 'your-rights', title: 'Your Rights' },
  { id: 'cookies', title: 'Cookies & Tracking' },
  { id: 'children', title: 'Children\'s Privacy' },
  { id: 'changes', title: 'Changes to This Policy' },
  { id: 'contact', title: 'Contact Us' },
]

export default function PrivacyPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            breadcrumbJsonLd([
              { name: 'Home', url: '/' },
              { name: 'Privacy Policy', url: '/privacy' },
            ])
          ),
        }}
      />
      <LegalLayout
        title="Privacy Policy"
        description="How PostPencil collects, uses, and protects your personal information."
        lastUpdated="June 24, 2026"
        sections={sections}
      >
        <Section id="introduction" title="Introduction">
          <p>
            PostPencil (&quot;we,&quot; &quot;our,&quot; or &quot;us&quot;) is a social learning platform
            designed for students and educators to share educational resources such as PDFs,
            notes, presentations, assignments, and question papers. This Privacy Policy
            explains how we handle your personal data when you use our platform.
          </p>
          <p>
            By using PostPencil, you agree to the collection and use of information in
            accordance with this policy. We are committed to being transparent about the data
            we collect and how it is used.
          </p>
        </Section>

        <Section id="information-collected" title="Information We Collect">
          <p>We collect the following types of information:</p>
          <p><Highlight>Information you provide directly:</Highlight></p>
          <List items={[
            'Account details: name, username, email address, and password',
            'Profile information: bio, college, course, semester, profile picture, and banner',
            'Social links: Twitter/X, GitHub, LinkedIn, and personal website URLs',
            'Educational resources you upload: PDFs, notes, presentations, documents, and images',
            'Comments, likes, bookmarks, and other interactions on the platform',
            'Support tickets and communications with our team',
          ]} />
          <p><Highlight>Information collected automatically:</Highlight></p>
          <List items={[
            'Device information: browser type, operating system, device type, and screen resolution',
            'Usage data: pages visited, features used, time spent, and interaction patterns',
            'Log data: IP address, access times, referring URLs, and error logs',
            'Session data: login sessions, device information, and authentication tokens',
          ]} />
          <p><Highlight>Information from third parties:</Highlight></p>
          <List items={[
            'OAuth providers (Google, GitHub): name, email, and profile picture when you sign in',
            'Analytics services: aggregated usage statistics',
          ]} />
        </Section>

        <Section id="how-we-use" title="How We Use Your Information">
          <p>We use the information we collect to:</p>
          <List items={[
            'Provide, operate, and maintain the PostPencil platform',
            'Process file uploads and deliver educational resources to users',
            'Personalize your experience with tailored feeds, trending content, and recommendations',
            'Enable social features: following creators, commenting, bookmarking, and notifications',
            'Send account-related emails: verification, password resets, and security alerts',
            'Send notification emails based on your preference settings',
            'Detect and prevent fraud, abuse, and security incidents',
            'Analyze usage patterns to improve platform features and performance',
            'Comply with legal obligations and enforce our terms of service',
          ]} />
        </Section>

        <Section id="information-sharing" title="Information Sharing">
          <p>
            We do not sell your personal information to third parties. We may share
            your information only in the following circumstances:
          </p>
          <List items={[
            'Service providers: trusted third parties that help us operate the platform (hosting, email delivery, analytics) under strict data protection agreements',
            'Legal requirements: when required by law, court order, or governmental regulation',
            'Safety: to protect the rights, property, or safety of PostPencil, our users, or the public',
            'Business transfers: in connection with a merger, acquisition, or sale of assets, with prior notice',
            'With your consent: when you explicitly authorize us to share your information',
          ]} />
          <p>
            Your posts and profile are visible to other users based on your privacy settings.
            You can control who sees your content through the Privacy settings in your account.
          </p>
        </Section>

        <Section id="data-security" title="Data Security">
          <p>
            We implement industry-standard security measures to protect your personal data:
          </p>
          <List items={[
            'Encrypted data transmission using TLS/SSL',
            'Secure password hashing with bcrypt',
            'Regular security audits and vulnerability assessments',
            'Access controls limiting who can access user data',
            'Automated threat detection and monitoring',
            'Regular backups with encrypted storage',
          ]} />
          <p>
            While we strive to protect your information, no method of electronic
            transmission or storage is 100% secure. We cannot guarantee absolute security
            but will promptly notify affected users in the event of a data breach.
          </p>
        </Section>

        <Section id="data-retention" title="Data Retention">
          <p>
            We retain your personal information for as long as your account is active or
            as needed to provide you with services. Specifically:
          </p>
          <List items={[
            'Account data: retained until you delete your account',
            'Uploaded files: retained until you delete them or your account',
            'Usage logs: retained for 90 days for security and analytics',
            'Session data: retained for 30 days after last activity',
            'Email logs: retained for 1 year for support purposes',
            'Support tickets: retained for 2 years after resolution',
          ]} />
          <p>
            When you delete your account, we remove your personal data within 30 days,
            except where we need to retain certain information for legal or legitimate
            business purposes.
          </p>
        </Section>

        <Section id="your-rights" title="Your Rights">
          <p>You have the following rights regarding your personal data:</p>
          <List items={[
            'Access: request a copy of all personal data we hold about you',
            'Correction: update or correct inaccurate personal information',
            'Deletion: request deletion of your account and personal data',
            'Export: download your data in a portable format',
            'Privacy control: adjust who can see your posts, profile, and activity',
            'Notification control: manage which emails and notifications you receive',
            'Withdraw consent: opt out of non-essential data processing at any time',
          ]} />
          <p>
            To exercise any of these rights, visit your Settings page or contact us at{' '}
            <a href="mailto:privacy@postpencil.com" className="text-foreground hover:underline">
              privacy@postpencil.com
            </a>.
          </p>
        </Section>

        <Section id="cookies" title="Cookies & Tracking">
          <p>
            PostPencil uses cookies and similar technologies to maintain your session,
            remember your preferences, and analyze platform usage. See our{' '}
            <a href="/cookies" className="text-foreground hover:underline">
              Cookie Policy
            </a>{' '}
            for detailed information.
          </p>
        </Section>

        <Section id="children" title="Children's Privacy">
          <p>
            PostPencil is intended for users aged 13 and older. We do not knowingly collect
            personal information from children under 13. If we become aware that a child
            under 13 has provided us with personal information, we will take steps to delete
            that information promptly.
          </p>
        </Section>

        <Section id="changes" title="Changes to This Policy">
          <p>
            We may update this Privacy Policy from time to time. We will notify you of any
            material changes by posting the updated policy on this page and updating the
            &quot;Last updated&quot; date. Your continued use of PostPencil after any changes
            constitutes acceptance of the updated policy.
          </p>
        </Section>

        <Section id="contact" title="Contact Us">
          <p>
            If you have questions, concerns, or requests regarding this Privacy Policy or
            our data practices, please contact us:
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
