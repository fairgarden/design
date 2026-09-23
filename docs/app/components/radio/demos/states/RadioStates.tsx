'use client'

import * as React from 'react'
import { Radio, RadioFeedback } from '@fairgarden-private/design/components/Radio'
import { RadioGroup } from '@fairgarden-private/design/components/RadioGroup'
import styles from './states.module.css'

/**
 * A preselected group with a disabled option, a disabled group, and a quiz
 * whose answers gain a glyph and a word once checked.
 */
export function RadioStates() {
  const deliveryId = React.useId()
  const lockedId = React.useId()
  const quizId = React.useId()
  const [answer, setAnswer] = React.useState<string | undefined>(undefined)

  return (
    <div className={styles.stack}>
      <div className={styles.group}>
        <p id={deliveryId} className={styles.legend}>
          Delivery
        </p>
        <RadioGroup aria-labelledby={deliveryId} defaultValue="standard">
          <Radio value="standard" description="Arrives in 5–7 days.">
            Standard Post
          </Radio>
          <Radio value="express">Express Post</Radio>
          <Radio value="pickup" disabled>
            Store Pickup (unavailable)
          </Radio>
        </RadioGroup>
      </div>
      <div className={styles.group}>
        <p id={lockedId} className={styles.legend}>
          Membership Tier
        </p>
        <RadioGroup aria-labelledby={lockedId} defaultValue="family" disabled>
          <Radio value="single">Single</Radio>
          <Radio value="family">Family</Radio>
        </RadioGroup>
      </div>
      <div className={styles.group}>
        <p id={quizId} className={styles.legend}>
          Which bird nests on the ground?
        </p>
        <RadioGroup
          aria-labelledby={quizId}
          value={answer}
          onValueChange={(value) => setAnswer(value as string)}
        >
          <Radio
            value="killdeer"
            feedback={answer ? <RadioFeedback status="success" /> : null}
          >
            Killdeer
          </Radio>
          <Radio
            value="heron"
            feedback={answer === 'heron' ? <RadioFeedback status="danger" /> : null}
          >
            Great Blue Heron
          </Radio>
          <Radio
            value="swift"
            feedback={answer === 'swift' ? <RadioFeedback status="danger" /> : null}
          >
            Chimney Swift
          </Radio>
        </RadioGroup>
      </div>
    </div>
  )
}
