import { site } from '../data/site';
import LegalPageLayout from '../components/legal/LegalPageLayout';

/**
 * Placeholder copy - written to be genuinely usable as a starting point, but
 * it has not been reviewed by a lawyer and stands in for the real policy
 * until the client supplies (or signs off on) one. Swap the body out,
 * keep the layout.
 *
 * Not to be confused with the mobile app's own privacy policy, which stays a
 * PHP page at /privacy-policy-for-the-colombo-kickerz-app - see the footer
 * and README "Deploying".
 */
export default function PrivacyPolicy() {
  return (
    <LegalPageLayout title="Privacy Policy" updated="September 2026">
      <p>
        This policy explains what information {site.fullName} collects through{' '}
        <strong>colombokickerz.lk</strong>, why we collect it, and the choices you have. It
        covers this website only - our mobile app has its own privacy policy, linked in the
        footer.
      </p>

      <h2>Information We Collect</h2>
      <p>We collect information in two ways:</p>
      <ul>
        <li>
          <strong>Information you give us directly</strong> - when you submit the contact form,
          we collect your name, email address, phone number (optional), and the message you
          send us, including which program or subject you selected.
        </li>
        <li>
          <strong>Information collected automatically</strong> - like most websites, our hosting
          provider logs standard technical data (IP address, browser type, pages visited) for
          security and performance purposes.
        </li>
      </ul>

      <h2>Children's Information</h2>
      <p>
        Colombo Kickerz trains children aged 5-18. Enquiries about a child's enrollment are
        always submitted by a parent or guardian through our contact form - we do not knowingly
        collect information directly from children through this website. Any player details
        exchanged as part of registration happen through our staff directly, not through
        automated collection on this site.
      </p>

      <h2>How We Use Your Information</h2>
      <ul>
        <li>To respond to enquiries submitted through the contact form.</li>
        <li>To process trial, program, and tournament registrations.</li>
        <li>To send information you have requested about our programs and events.</li>
        <li>To keep the website secure and working correctly.</li>
      </ul>
      <p>We do not sell, rent, or trade your personal information to third parties.</p>

      <h2>Third-Party Services</h2>
      <p>This site embeds a small number of third-party services:</p>
      <ul>
        <li>
          <strong>Google Maps</strong> - to show our training ground location on the Contact
          section. Google's own privacy policy applies to that embed.
        </li>
        <li>
          <strong>Instagram</strong> - our Gallery links out to our Instagram profile; we do not
          embed Instagram content directly on this site.
        </li>
        <li>
          <strong>Google Fonts</strong> - used to load the site's typefaces.
        </li>
      </ul>

      <h2>Data Retention</h2>
      <p>
        We keep enquiry and registration information for as long as reasonably needed to respond
        to you, administer your program, and meet our own record-keeping obligations, after
        which it is deleted or anonymized.
      </p>

      <h2>Your Rights</h2>
      <p>
        You can ask us what information we hold about you, request a correction, or ask us to
        delete it, by contacting us using the details below. We will respond within a reasonable
        time.
      </p>

      <h2>Security</h2>
      <p>
        We take reasonable technical and organizational measures to protect the information you
        share with us. No method of transmission over the internet is completely secure, so we
        cannot guarantee absolute security.
      </p>

      <h2>Changes To This Policy</h2>
      <p>
        We may update this policy from time to time. The date at the top of this page shows when
        it was last revised.
      </p>

      <h2>Contact Us</h2>
      <p>
        Questions about this policy or your information can be sent to{' '}
        <a href={'mailto:' + site.contact.email}>{site.contact.email}</a> or to any of the phone
        numbers listed in our footer.
      </p>
    </LegalPageLayout>
  );
}
