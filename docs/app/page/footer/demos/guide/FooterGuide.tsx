import { Button } from '@fairgarden/design/actions/button'
import { Footer, FooterBlock } from '@fairgarden/design/page/footer'
import { Lockup } from '@/components/Logo'
import { sitemap } from './footerSitemap'
import styles from './guide.module.css'

/** A 20 px outline social mark, drawn custom in currentColor. */
function Mark() {
  return (
    <svg viewBox="0 0 20 20" aria-hidden="true" focusable="false" className={styles.mark}>
      <rect x="2.75" y="2.75" width="14.5" height="14.5" rx="4" />
      <circle cx="10" cy="10" r="3.5" />
    </svg>
  )
}

/** The field-guide footer on the night band: blocks, the sitemap from the navigation data, contact, legal and colophon. */
export function FooterGuide() {
  return (
    <div className={styles.frame}>
      <Footer
        brand={
          <a href="/" className={styles.logo}>
            <Lockup />
          </a>
        }
        blocks={
          <>
            <FooterBlock
              icon="help"
              heading="Talk to a Land Trust"
              action={
                <Button variant="outline" render={<a href="/find" />} nativeButton={false}>
                  Find One Near You
                </Button>
              }
            >
              <p>Local experts can walk your land with you and explain your options.</p>
            </FooterBlock>
            <FooterBlock
              icon="download"
              heading="Get the Guide"
              action={
                <Button variant="outline" render={<a href="/guide" />} nativeButton={false}>
                  Download the Guide
                </Button>
              }
            >
              <p>A plain-language guide to easements, taxes and stewardship.</p>
            </FooterBlock>
            <FooterBlock
              icon="add"
              heading="Support the Work"
              action={
                <Button variant="solid" render={<a href="/donate" />} nativeButton={false}>
                  Donate
                </Button>
              }
            >
              <p>Every gift protects land that can never be made again.</p>
            </FooterBlock>
          </>
        }
        sitemap={sitemap}
        address={
          <>
            1250 H Street NW, Suite 600
            <br />
            Washington, DC 20005
          </>
        }
        contact={[
          { value: 'info@example.org', href: 'mailto:info@example.org' },
          { value: '202 555 0100', href: 'tel:+12025550100' },
        ]}
        social={[
          { label: 'Instagram', href: 'https://instagram.com/example', icon: <Mark /> },
          { label: 'Newsletter', href: '/newsletter' },
        ]}
        legal={[
          { label: 'Privacy', href: '/privacy' },
          { label: 'Accessibility', href: '/accessibility' },
          { label: 'Non-Discrimination', href: '/non-discrimination' },
        ]}
        copyright="© 2026 FairGarden"
        colophon="Set in Fraunces, Source Serif 4, Figtree and IBM Plex Mono. Last updated 22 Sept 2026."
        organization="FairGarden"
        backToTop={{ href: '#top' }}
      />
    </div>
  )
}
