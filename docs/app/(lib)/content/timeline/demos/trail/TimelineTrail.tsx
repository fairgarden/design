import {
  Timeline,
  TimelineCaption,
  TimelineDateStack,
  TimelineEntry,
  TimelineList,
  TimelineText,
  TimelineTitle,
  TimelineTitleLink,
} from '@fairgarden/design/content/timeline'
import styles from './trail.module.css'

/** A trail timeline (origin, waypoints, "now", terminal past the end) and a date-block schedule. */
export function TimelineTrail() {
  return (
    <div className={styles.stack}>
      <Timeline ongoing>
        <TimelineList>
          <TimelineEntry stage="past" date={<time dateTime="1987">1987</time>}>
            <TimelineTitle>The first 40 acres</TimelineTitle>
            <TimelineText>Neighbors pool their savings to buy the ravine.</TimelineText>
          </TimelineEntry>
          <TimelineEntry stage="past" date={<time dateTime="2004">2004</time>}>
            <TimelineTitle>
              <TimelineTitleLink href="#trail">The meadow comes back</TimelineTitleLink>
            </TimelineTitle>
            <TimelineText>Controlled burns return the prairie grasses.</TimelineText>
          </TimelineEntry>
          <TimelineEntry stage="current" date={<time dateTime="2026-09-22">Today, 22 Sep 2026</time>}>
            <TimelineTitle>Headwaters campaign</TimelineTitle>
            <TimelineText>Raising funds to protect the upper creek.</TimelineText>
          </TimelineEntry>
          <TimelineEntry stage="planned" date="2028 · Planned">
            <TimelineTitle>Trail to the ridge</TimelineTitle>
          </TimelineEntry>
        </TimelineList>
        <TimelineCaption>● marks today, 22 Sep 2026.</TimelineCaption>
      </Timeline>

      <Timeline kind="date-block">
        <TimelineList>
          <TimelineEntry
            date={<TimelineDateStack dateTime="2026-10-03" month="Oct" day="3" weekday="Sat" />}
          >
            <TimelineTitle>Night walk</TimelineTitle>
            <TimelineText>North kiosk, 7 p.m.</TimelineText>
          </TimelineEntry>
          <TimelineEntry
            date={<TimelineDateStack dateTime="2026-10-11" month="Oct" day="11" weekday="Sun" />}
          >
            <TimelineTitle>Seed swap</TimelineTitle>
            <TimelineText>Barn, 10 a.m.</TimelineText>
          </TimelineEntry>
        </TimelineList>
      </Timeline>
    </div>
  )
}
