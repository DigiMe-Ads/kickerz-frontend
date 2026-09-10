import { site } from '../data/site';
import LegalPageLayout from '../components/legal/LegalPageLayout';

/**
 * Placeholder copy, same caveat as PrivacyPolicy.jsx - a genuinely usable
 * starting point, not a lawyer-reviewed document. Swap the body out, keep
 * the layout.
 */
export default function TermsOfService() {
  return (
    <LegalPageLayout title="Terms of Service" updated="September 2026">
      <p>
        These terms govern your use of <strong>colombokickerz.lk</strong> (the "Site"),
        operated by {site.fullName}. By using the Site, you agree to these terms. If you do not
        agree, please do not use the Site.
      </p>

      <h2>Use of the Site</h2>
      <p>
        The Site is provided to share information about our programs, events, and academy, and
        to let visitors get in touch with us. You agree to use it only for lawful purposes and
        not to:
      </p>
      <ul>
        <li>Attempt to gain unauthorized access to the Site or its underlying systems.</li>
        <li>Submit the contact form with false information or for spam/abusive purposes.</li>
        <li>Copy, scrape, or republish the Site's content without our permission.</li>
      </ul>

      <h2>Program Registration and Enquiries</h2>
      <p>
        Submitting the contact form is an enquiry, not a confirmed registration. Enrollment in
        any program, camp, or tournament is only confirmed once our team has followed up with
        you directly and any required steps (such as payment or a trial session) are complete.
      </p>

      <h2>Accuracy of Information</h2>
      <p>
        We make reasonable efforts to keep program details, event dates, and other content on
        the Site accurate and current, but schedules can change. Always confirm dates, fees, and
        venues with us directly before making arrangements around them.
      </p>

      <h2>Intellectual Property</h2>
      <p>
        The Site's text, photographs, logo, and design are owned by {site.fullName} or used with
        permission, and are protected by copyright and trademark law. You may not use them
        without our written consent, except for normal browsing and sharing via the links we
        provide (such as our social media pages).
      </p>

      <h2>Third-Party Links</h2>
      <p>
        The Site links to third-party platforms we do not control, including Instagram, Facebook,
        LinkedIn, and Google Maps. We are not responsible for the content, policies, or practices
        of those third-party sites.
      </p>

      <h2>Limitation of Liability</h2>
      <p>
        The Site is provided "as is." To the fullest extent permitted by law, {site.fullName} is
        not liable for any indirect, incidental, or consequential damages arising from your use
        of the Site. Nothing in these terms limits our liability where it cannot lawfully be
        limited.
      </p>

      <h2>Changes To These Terms</h2>
      <p>
        We may update these terms from time to time. The date at the top of this page shows when
        it was last revised. Continued use of the Site after a change means you accept the
        updated terms.
      </p>

      <h2>Governing Law</h2>
      <p>These terms are governed by the laws of Sri Lanka.</p>

      <h2>Contact Us</h2>
      <p>
        Questions about these terms can be sent to{' '}
        <a href={'mailto:' + site.contact.email}>{site.contact.email}</a>.
      </p>
    </LegalPageLayout>
  );
}
