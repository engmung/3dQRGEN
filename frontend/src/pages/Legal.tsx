import type { ReactNode } from 'react';
import { SEO } from '../components/SEO';
import { LandingFooter } from '../components/LandingFooter';
import './Landing.css';

const CONTACT_EMAIL = 'contact@3dqrdesign.site';
const LAST_UPDATED = 'October 12, 2026';

function LegalPage({ title, description, children }: { title: string; description: string; children: ReactNode }) {
  return (
    <div className="landing">
      <SEO title={`${title} - 3D QR Designer`} description={description} />
      <article className="landing-section legal-page">
        <h1 className="legal-title">{title}</h1>
        <p className="legal-updated">Last updated: {LAST_UPDATED}</p>
        {children}
      </article>
      <LandingFooter />
    </div>
  );
}

export function Privacy() {
  return (
    <LegalPage
      title="Privacy Policy"
      description="How 3D QR Designer handles your data: your designs stay in your browser."
    >
      <h2>Your designs stay in your browser</h2>
      <p>
        3D QR Designer has no backend and no accounts. Everything you enter in the editor, including URLs,
        Wi-Fi names and passwords, email addresses, text, and uploaded images, is processed on your device
        and is never sent to us.
      </p>

      <h2>Local storage</h2>
      <p>
        The editor saves your current design and a few interface preferences in your browser's local storage
        so they are still there when you come back. This data stays on your device. You can remove it at any
        time by clearing this site's data in your browser settings.
      </p>

      <h2>Analytics</h2>
      <p>
        We use Vercel Web Analytics to count page views and understand general usage, such as which pages are
        visited and from which country, browser, and device type. It does not use cookies and does not track
        you across other sites. The content of your designs is not included.
      </p>

      <h2>Hosting</h2>
      <p>
        The site is hosted on Vercel. Like any web host, Vercel processes technical request data such as IP
        addresses in order to deliver the site and keep it secure.
      </p>

      <h2>Contact</h2>
      <p>
        If you email us, we use your address and message only to reply. Questions about this policy can be sent
        to <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>.
      </p>

      <h2>Changes</h2>
      <p>If this policy changes, the updated version will be posted on this page with a new date.</p>
    </LegalPage>
  );
}

export function Terms() {
  return (
    <LegalPage
      title="Terms of Use"
      description="Terms for using 3D QR Designer, a free and open-source 3D printable QR code tool."
    >
      <h2>The service</h2>
      <p>
        3D QR Designer is a free web tool for creating 3D-printable QR code models. No account or payment is
        required. By using the site you agree to these terms.
      </p>

      <h2>Your designs</h2>
      <p>
        The models you create and export are yours, and you may use them for personal or commercial purposes.
        You are responsible for the content you encode and upload, including having the right to use any
        images, and for making sure your use is lawful.
      </p>

      <h2>Check before you print</h2>
      <p>
        Whether a printed QR code scans depends on your printer, materials, colors, and size. Test the result
        before relying on it or producing it in quantity.
      </p>

      <h2>Open source</h2>
      <p>
        The source code is available on{' '}
        <a href="https://github.com/engmung/3dQRGEN" target="_blank" rel="noopener noreferrer">GitHub</a> under
        the MIT License. Bundled fonts are licensed under the SIL Open Font License 1.1.
      </p>

      <h2>No warranty</h2>
      <p>
        The service is provided "as is", without warranty of any kind. To the extent permitted by law, we are
        not liable for any damages arising from the use of the site or of files exported from it.
      </p>

      <h2>Changes and contact</h2>
      <p>
        We may update the service or these terms; the current version is always on this page. Questions can be
        sent to <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>.
      </p>
    </LegalPage>
  );
}
