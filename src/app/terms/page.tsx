import { Metadata } from 'next'
import { LegalLayout, Section, List, Highlight } from '@/components/legal/legal-layout'
import { breadcrumbJsonLd } from '@/lib/seo'

export const metadata: Metadata = {
  title: 'Terms of Service',
  description:
    'The rules and guidelines that govern your use of PostPencil. Read our terms to understand your rights and responsibilities.',
  alternates: {
    canonical: 'https://postpencil.com/terms',
  },
}

const sections = [
  { id: 'acceptance', title: 'Acceptance of Terms' },
  { id: 'eligibility', title: 'Eligibility' },
  { id: 'accounts', title: 'User Accounts' },
  { id: 'content', title: 'Content & Intellectual Property' },
  { id: 'uploads', title: 'File Uploads' },
  { id: 'prohibited', title: 'Prohibited Conduct' },
  { id: 'moderation', title: 'Content Moderation' },
  { id: 'termination', title: 'Account Termination' },
  { id: 'disclaimer', title: 'Disclaimers' },
  { id: 'liability', title: 'Limitation of Liability' },
  { id: 'changes', title: 'Changes to Terms' },
  { id: 'contact', title: 'Contact' },
]

export default function TermsPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            breadcrumbJsonLd([
              { name: 'Home', url: '/' },
              { name: 'Terms of Service', url: '/terms' },
            ])
          ),
        }}
      />
      <LegalLayout
        title="Terms of Service"
        description="The rules and guidelines that govern your use of PostPencil."
        lastUpdated="June 24, 2026"
        sections={sections}
      >
        <Section id="acceptance" title="Acceptance of Terms">
          <p>
            Welcome to PostPencil. These Terms of Service (&quot;Terms&quot;) govern your
            access to and use of the PostPencil platform, including our website, APIs, and
            all related services. By creating an account or using PostPencil, you agree to
            be bound by these Terms.
          </p>
          <p>
            If you do not agree to these Terms, you must not access or use PostPencil.
            We recommend reading these Terms carefully before using the platform.
          </p>
        </Section>

        <Section id="eligibility" title="Eligibility">
          <p>To use PostPencil, you must:</p>
          <List items={[
            'Be at least 13 years of age',
            'Have the legal capacity to enter into a binding agreement',
            'Not be barred from using the platform under applicable law',
            'Provide accurate and complete registration information',
            'Maintain the security of your account credentials',
          ]} />
          <p>
            If you are using PostPencil on behalf of an organization, you represent that
            you have the authority to bind that organization to these Terms.
          </p>
        </Section>

        <Section id="accounts" title="User Accounts">
          <p>
            PostPencil offers account creation through email registration and OAuth
            providers (Google, GitHub). When creating an account:
          </p>
          <List items={[
            'You must provide accurate, current, and complete information',
            'You are responsible for maintaining the confidentiality of your password',
            'You are responsible for all activity that occurs under your account',
            'You must notify us immediately of any unauthorized use of your account',
            'You may not create multiple accounts or share your account with others',
            'You may not transfer your account to another person without our written consent',
          ]} />
          <p>
            PostPencil reserves the right to suspend or terminate accounts that violate
            these Terms or that we reasonably believe are compromised.
          </p>
        </Section>

        <Section id="content" title="Content & Intellectual Property">
          <p><Highlight>Your content:</Highlight></p>
          <p>
            You retain full ownership of any educational resources, posts, comments, and
            other content you create and upload to PostPencil. By uploading content, you
            grant PostPencil a limited, non-exclusive, worldwide license to host, display,
            and distribute your content solely for the purpose of operating and improving
            the platform.
          </p>
          <p><Highlight>Platform content:</Highlight></p>
          <p>
            PostPencil and its original content, features, design, and branding are owned
            by PostPencil and protected by intellectual property laws. You may not copy,
            modify, distribute, or reverse-engineer any part of the platform without prior
            written consent.
          </p>
          <p><Highlight>Respecting others&apos; content:</Highlight></p>
          <List items={[
            'Only upload content you have the right to share',
            'Provide proper attribution when referencing others\' work',
            'Respect copyright, trademark, and other intellectual property rights',
            'Do not repost or redistribute others\' content without permission',
            'Report any content that infringes on your intellectual property rights',
          ]} />
        </Section>

        <Section id="uploads" title="File Uploads">
          <p>PostPencil supports uploading educational resources in various formats:</p>
          <List items={[
            'PDF documents (.pdf)',
            'Images (.jpg, .png, .webp)',
            'Office documents (.doc, .docx)',
            'Presentations (.ppt, .pptx)',
            'Archive files (.zip)',
          ]} />
          <p>By uploading files, you agree that:</p>
          <List items={[
            'You have the legal right to share the uploaded content',
            'The content does not violate these Terms or applicable law',
            'Files are free from malware, viruses, or harmful code',
            'You will not upload files designed to exploit platform vulnerabilities',
            'File sizes are within platform limits (currently up to 50MB per file)',
          ]} />
          <p>
            PostPencil reserves the right to remove files that violate these Terms or that
            are reported as infringing on intellectual property rights.
          </p>
        </Section>

        <Section id="prohibited" title="Prohibited Conduct">
          <p>You agree not to engage in any of the following:</p>
          <List items={[
            'Posting content that is illegal, harmful, threatening, abusive, or defamatory',
            'Impersonating any person, entity, or misrepresenting your affiliation',
            'Uploading content that infringes on intellectual property rights',
            'Distributing spam, phishing attempts, or unsolicited promotions',
            'Using automated systems (bots, scrapers) to access the platform without permission',
            'Attempting to gain unauthorized access to other user accounts or system infrastructure',
            'Interfering with or disrupting the platform\'s functionality or servers',
            'Collecting or harvesting user data without explicit consent',
            'Engaging in coordinated inauthentic behavior or fake engagement',
            'Circumventing any platform limitations, restrictions, or security measures',
            'Using the platform for any commercial purpose without our written consent',
          ]} />
        </Section>

        <Section id="moderation" title="Content Moderation">
          <p>
            PostPencil maintains community standards to ensure a safe learning environment.
            We reserve the right to:
          </p>
          <List items={[
            'Review, moderate, or remove content that violates these Terms',
            'Issue warnings, temporary restrictions, or permanent suspensions',
            'Remove educational resources that are reported as inappropriate or infringing',
            'Disable accounts engaged in prohibited conduct',
            'Cooperate with law enforcement when required by law',
          ]} />
          <p>
            We aim to be fair and transparent in our moderation decisions. You will be
            notified of any action taken on your account and may appeal decisions through
            our Help Center.
          </p>
        </Section>

        <Section id="termination" title="Account Termination">
          <p>
            You may delete your account at any time through your Settings page. Upon
            deletion:
          </p>
          <List items={[
            'Your account and profile will be permanently removed',
            'Your uploaded content will be removed from public view within 30 days',
            'Your data will be purged from our systems within 90 days',
            'Some anonymized data may be retained for analytics purposes',
          ]} />
          <p>
            PostPencil may also terminate or suspend your account if you violate these
            Terms, engage in prohibited conduct, or if required by law. We will provide
            notice before taking such action, except in cases of serious violations.
          </p>
        </Section>

        <Section id="disclaimer" title="Disclaimers">
          <p>
            PostPencil is provided on an &quot;as is&quot; and &quot;as available&quot; basis
            without warranties of any kind, whether express or implied, including but not
            limited to:
          </p>
          <List items={[
            'Merchantability, fitness for a particular purpose, or non-infringement',
            'Uninterrupted, timely, secure, or error-free operation',
            'Accuracy, reliability, or completeness of any content on the platform',
            'Absence of viruses or other harmful components',
          ]} />
          <p>
            We are not responsible for the accuracy, quality, or legality of educational
            resources uploaded by users. Users access and use uploaded content at their own
            risk.
          </p>
        </Section>

        <Section id="liability" title="Limitation of Liability">
          <p>
            To the maximum extent permitted by applicable law, PostPencil shall not be
            liable for any indirect, incidental, special, consequential, or punitive
            damages, including but not limited to loss of profits, data, use, goodwill, or
            other intangible losses resulting from:
          </p>
          <List items={[
            'Your access to, use of, or inability to use the platform',
            'Any conduct or content of any third party on the platform',
            'Any content obtained from the platform',
            'Unauthorized access, use, or alteration of your transmissions or content',
          ]} />
        </Section>

        <Section id="changes" title="Changes to Terms">
          <p>
            We reserve the right to modify these Terms at any time. We will notify you of
            material changes by posting the updated Terms on this page and updating the
            &quot;Last updated&quot; date. Your continued use of PostPencil after changes
            are posted constitutes acceptance of the updated Terms.
          </p>
        </Section>

        <Section id="contact" title="Contact">
          <p>
            If you have questions about these Terms, please contact us:
          </p>
          <p>
            Email:{' '}
            <a href="mailto:legal@postpencil.com" className="text-foreground hover:underline">
              legal@postpencil.com
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
