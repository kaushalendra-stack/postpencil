import { LegalLayout, Section, List, Highlight } from '@/components/legal/legal-layout'

const sections = [
  { id: 'mission', title: 'Our Mission' },
  { id: 'respect', title: 'Be Respectful' },
  { id: 'original', title: 'Share Original Content' },
  { id: 'quality', title: 'Quality & Accuracy' },
  { id: 'harmful', title: 'No Harmful Content' },
  { id: 'privacy', title: 'Protect Privacy' },
  { id: 'spam', title: 'No Spam or Manipulation' },
  { id: 'resources', title: 'Educational Resources' },
  { id: 'report', title: 'Reporting Violations' },
  { id: 'enforcement', title: 'Enforcement' },
  { id: 'contact', title: 'Contact' },
]

export default function GuidelinesPage() {
  return (
    <LegalLayout
      title="Community Guidelines"
      description="Standards for behavior and content that help PostPencil remain a safe, inclusive, and valuable learning community."
      lastUpdated="June 24, 2026"
      sections={sections}
    >
      <Section id="mission" title="Our Mission">
        <p>
          PostPencil is a social learning platform built for students and educators to
          share educational resources, collaborate on academic topics, and build a
          supportive learning community. These guidelines exist to ensure PostPencil
          remains a space where everyone can learn, teach, and grow together.
        </p>
        <p>
          We believe that quality education thrives in a respectful, honest, and inclusive
          environment. These guidelines apply to all content and interactions on the
          platform, including posts, comments, profiles, and uploaded resources.
        </p>
      </Section>

      <Section id="respect" title="Be Respectful">
        <p>
          PostPencil brings together learners and educators from diverse backgrounds.
          We expect all users to:
        </p>
        <List items={[
          'Treat others with courtesy and professionalism in all interactions',
          'Engage in constructive discussions, even when you disagree',
          'Avoid personal attacks, name-calling, and ad hominem arguments',
          'Respect different perspectives, learning styles, and academic approaches',
          'Use inclusive language that does not marginalize or exclude any group',
        ]} />
        <p>
          Harassment, bullying, hate speech, discrimination, and intimidation are not
          tolerated on PostPencil. This includes but is not limited to offensive comments
          based on race, gender, religion, nationality, disability, sexual orientation,
          or any other protected characteristic.
        </p>
      </Section>

      <Section id="original" title="Share Original Content">
        <p>
          Academic integrity is a core value of our community:
        </p>
        <List items={[
          'Upload only content you have created or have the right to share',
          'Provide proper attribution when referencing or building upon others\' work',
          'Do not plagiarize or pass off others\' work as your own',
          'Cite sources and give credit to original authors when appropriate',
          'Do not redistribute copyrighted material without permission',
        ]} />
        <p>
          When sharing study materials, notes, or resources, clearly indicate your sources
          and whether the content is original or derived from existing works.
        </p>
      </Section>

      <Section id="quality" title="Quality & Accuracy">
        <p>
          As a learning platform, accuracy matters. We encourage users to:
        </p>
        <List items={[
          'Ensure your educational resources are accurate and well-organized',
          'Clearly label the subject, course, and level of your materials',
          'Update or remove outdated content that may contain incorrect information',
          'Correct mistakes promptly when others point them out',
          'Distinguish between factual information and personal opinions',
        ]} />
        <p>
          Posting deliberately misleading or inaccurate educational content is a violation
          of these guidelines and may result in content removal.
        </p>
      </Section>

      <Section id="harmful" title="No Harmful Content">
        <p>
          The following types of content are strictly prohibited on PostPencil:
        </p>
        <List items={[
          'Content that promotes, incites, or glorifies violence or terrorism',
          'Hate speech, discriminatory language, or content targeting protected groups',
          'Sexually explicit, exploitative, or inappropriate material',
          'Content that encourages self-harm, eating disorders, or dangerous activities',
          'Harassment, stalking, or threats directed at specific individuals',
          'Doxxing or sharing others\' private information without consent',
          'Malware, phishing links, or content designed to exploit users',
          'Content that violates applicable laws or regulations',
        ]} />
      </Section>

      <Section id="privacy" title="Protect Privacy">
        <p>
          Respecting privacy is essential to building trust in our community:
        </p>
        <List items={[
          'Do not share others\' personal information without explicit consent',
          'Do not upload private conversations, documents, or photos belonging to others',
          'Do not post content that identifies or exposes private individuals',
          'Use appropriate privacy settings to control who sees your content',
          'Report any content that violates someone\'s privacy',
        ]} />
        <p>
          Be especially careful when sharing educational content that may contain personal
          information, student records, or institutional data.
        </p>
      </Section>

      <Section id="spam" title="No Spam or Manipulation">
        <p>
          PostPencil is a genuine learning community, not a marketing platform:
        </p>
        <List items={[
          'Do not post repetitive, low-quality, or off-topic content',
          'Do not use fake accounts or automated tools to inflate engagement',
          'Do not engage in follow-for-follow schemes or coordinated inauthentic behavior',
          'Do not use the platform primarily for self-promotion or advertising',
          'Do not manipulate likes, comments, or downloads through artificial means',
          'Do not post misleading links or clickbait content',
        ]} />
      </Section>

      <Section id="resources" title="Educational Resources">
        <p>
          PostPencil is designed for sharing quality educational materials. When uploading
          resources:
        </p>
        <List items={[
          'Use appropriate file formats (PDF for documents, images for diagrams)',
          'Provide clear, descriptive titles and meaningful descriptions',
          'Tag your content with relevant subjects and categories',
          'Ensure files are free from malware and safe to download',
          'Organize content logically so others can find and use it effectively',
          'Only upload resources appropriate for the academic context',
        ]} />
      </Section>

      <Section id="report" title="Reporting Violations">
        <p>
          Help us maintain a safe community by reporting content or behavior that
          violates these guidelines:
        </p>
        <List items={[
          'Use the Report feature on any post, comment, or profile',
          'Provide a clear explanation of why the content violates our guidelines',
          'Select the most appropriate violation category',
          'Include any relevant context that may help our review process',
        ]} />
        <p>
          We review all reports promptly and take appropriate action. Reports are
          confidential — the reported user will not know who filed the report.
        </p>
      </Section>

      <Section id="enforcement" title="Enforcement">
        <p>
          Violations of these guidelines may result in the following actions, depending
          on the severity and frequency of the violation:
        </p>
        <List items={[
          'Content removal: violating posts, comments, or resources will be removed',
          'Written warning: notification explaining the violation and expected behavior',
          'Temporary restrictions: limited access to certain platform features',
          'Account suspension: temporary inability to access the platform',
          'Permanent ban: permanent removal from PostPencil for serious or repeated violations',
        ]} />
        <p>
          We aim to be fair, consistent, and transparent in our enforcement decisions.
          You will always be notified of any action taken on your account and may appeal
          decisions through our Help Center.
        </p>
      </Section>

      <Section id="contact" title="Contact">
        <p>
          If you have questions about these Community Guidelines or need to report a
          violation, please contact us:
        </p>
        <p>
          Email:{' '}
          <a href="mailto:safety@postpencil.com" className="text-foreground hover:underline">
            safety@postpencil.com
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
  )
}
