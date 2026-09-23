import { Footer } from '@fairgarden/design/page/footer'
import { Newsletter } from '@fairgarden/design/page/newsletter'
import { Lockup } from '@/components/Logo'
import { largeSitemap, sitemap } from '../guide/footerSitemap'
import styles from './column.module.css'

/**
 * The newsletter column (sitemap 1–7, newsletter 8–12 from 1024 px) with a
 * sitemap over 24 links, which collapses into an Accordion on phones; then
 * the ruled grid and the minimal footer on page grounds.
 */
export function FooterColumn() {
  return (
    <div className={styles.stack}>
      <Footer
        newsletterColumn
        brand={<Lockup className={styles.logo} />}
        sitemap={largeSitemap}
        newsletter={
          <Newsletter
            heading="Get the Latest Conservation News"
            pitch="Stories from the land, once a month."
            printUrl="example.org/newsletter"
          />
        }
        newsletterUrl="example.org/newsletter"
        legal={[{ label: 'Privacy', href: '/privacy' }]}
        copyright="© 2026 FairGarden"
        signoff
        wordmark="FairGarden"
      />
      <Footer
        kind="ruled"
        sitemap={sitemap}
        contact={[
          { label: 'Email', value: 'hello@example.org', href: 'mailto:hello@example.org' },
          { label: 'Phone', value: '202 555 0100', href: 'tel:+12025550100' },
        ]}
        copyright="© 2026 FairGarden"
      />
      <Footer
        kind="minimal"
        preset="white"
        brand={<Lockup className={styles.logo} />}
        sitemap={sitemap}
        legal={[
          { label: 'Privacy', href: '/privacy' },
          { label: 'Terms', href: '/terms' },
        ]}
        copyright="© 2026 FairGarden"
        colophon="Version 0.1.0."
      />
    </div>
  )
}
