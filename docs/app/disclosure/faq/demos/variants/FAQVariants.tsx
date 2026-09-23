import {
  FAQ,
  FAQContact,
  FAQHeader,
  FAQIntro,
  FAQItem,
  FAQList,
  FAQTitle,
} from '@fairgarden/design/disclosure/faq'
import { Link } from '@fairgarden/design/actions/link'
import styles from './variants.module.css'

/** The ruled FAQ (default) with header, intro and contact line, and the barred form. */
export function FAQVariants() {
  return (
    <div className={styles.stack}>
      <FAQ>
        <FAQHeader>
          <FAQTitle>Visiting the preserves</FAQTitle>
          <FAQIntro>Answers to the questions we hear most at the trailhead.</FAQIntro>
        </FAQHeader>
        <FAQList defaultValue={['dogs']}>
          <FAQItem value="dogs" question="Can I bring my dog?">
            Yes, on a leash no longer than six feet. Please pack out what your dog leaves behind.
          </FAQItem>
          <FAQItem value="fees" question="Is there an entry fee?">
            No. Every FairGarden preserve is free and open from dawn to dusk.
          </FAQItem>
          <FAQItem value="bikes" question="Are bikes allowed on the trails?">
            Only on the gravel service roads, marked with a green post at each junction.
          </FAQItem>
          <FAQItem value="groups" question="Can our school group book a guided walk?">
            Yes. Walks run April to October for groups of up to 30.
          </FAQItem>
        </FAQList>
        <FAQContact>
          Still have a question? <Link href="#contact">Write to the stewardship team</Link>.
        </FAQContact>
      </FAQ>

      <FAQ barred>
        <FAQList defaultValue={['easement']}>
          <FAQItem value="easement" question="What is a conservation easement?">
            A legal agreement that limits development on land while it stays in private hands.
          </FAQItem>
          <FAQItem value="taxes" question="Does an easement change my property taxes?">
            It can lower them. Talk to your assessor before you sign.
          </FAQItem>
          <FAQItem value="sell" question="Can I still sell the land?">
            Yes. The easement travels with the deed to every future owner.
          </FAQItem>
        </FAQList>
      </FAQ>
    </div>
  )
}
