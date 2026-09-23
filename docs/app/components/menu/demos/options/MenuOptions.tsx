'use client'

import * as React from 'react'
import { Ground } from '@fairgarden-private/design/components/Ground'
import {
  Menu,
  MenuCheckboxItem,
  MenuGroup,
  MenuGroupLabel,
  MenuPopup,
  MenuRadioGroup,
  MenuRadioItem,
  MenuSeparator,
  MenuTrigger,
} from '@fairgarden-private/design/components/Menu'
import styles from './options.module.css'

const orders = {
  distance: 'Distance',
  climb: 'Climb',
  name: 'Name',
} as const

type Order = keyof typeof orders

export function MenuOptions() {
  const [order, setOrder] = React.useState<Order>('distance')
  const [showClosed, setShowClosed] = React.useState(false)
  const [dogFriendly, setDogFriendly] = React.useState(true)

  return (
    <Ground preset="forest" kind="field" className={styles.face}>
      <p className={styles.caption}>
        The trigger follows the forest ground; the popup stays a white scope in the page mode.
      </p>
      <Menu>
        <MenuTrigger variant="outline" icon="expand_more" iconPosition="end">
          {`Sort: ${orders[order]}`}
        </MenuTrigger>
        <MenuPopup>
          <MenuGroup>
            <MenuGroupLabel>Sort by</MenuGroupLabel>
            <MenuRadioGroup value={order} onValueChange={(value: Order) => setOrder(value)}>
              {(Object.keys(orders) as Order[]).map((key) => (
                <MenuRadioItem key={key} value={key}>
                  {orders[key]}
                </MenuRadioItem>
              ))}
            </MenuRadioGroup>
          </MenuGroup>
          <MenuSeparator />
          <MenuGroup>
            <MenuGroupLabel>Show</MenuGroupLabel>
            <MenuCheckboxItem checked={showClosed} onCheckedChange={setShowClosed}>
              Closed trails
            </MenuCheckboxItem>
            <MenuCheckboxItem checked={dogFriendly} onCheckedChange={setDogFriendly}>
              Dog-friendly only
            </MenuCheckboxItem>
          </MenuGroup>
        </MenuPopup>
      </Menu>
      <p className={styles.caption} aria-live="polite">
        {`View: sorted by ${orders[order].toLowerCase()}`}
        {showClosed ? ' · closed trails shown' : ''}
        {dogFriendly ? ' · dog-friendly only' : ''}
      </p>
    </Ground>
  )
}
