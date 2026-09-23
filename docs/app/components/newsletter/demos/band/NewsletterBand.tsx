import { Newsletter } from '@fairgarden-private/design/components/Newsletter'
import styles from './band.module.css'

/** The band on the page ground and in a leaf campaign field, and the ruled row. The ruled row shows a server failure. */
export function NewsletterBand() {
  return (
    <div className={styles.stack}>
      <Newsletter
        kind="band"
        heading="Field Notes, Every Friday"
        pitch="One story, one walk and one thing to do this weekend."
        printUrl="example.org/notes"
      />
      <Newsletter
        kind="band"
        field="leaf"
        heading="Join the Spring Planting"
        pitch="We'll send dates and places near you."
        submitLabel="Count Me In"
        printUrl="example.org/planting"
      />
      <Newsletter
        kind="ruled"
        heading="Letters from the Orchard"
        printUrl="example.org/letters"
        status="warning"
        statusMessage="We couldn't reach the server. Try again in a minute."
      />
    </div>
  )
}
