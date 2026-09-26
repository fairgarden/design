import {
  Timeline,
  TimelineDateHead,
  TimelineDay,
  TimelineDescription,
  TimelineList,
  TimelineMeta,
  TimelineScope,
  TimelineSession,
  TimelineSessionTitle,
} from '@fairgarden/design/content/timeline'

/** Date heads in the heading ink, one scope caption, sessions led by the » marker. */
export function TimelineAgenda() {
  return (
    <Timeline kind="agenda">
      <TimelineDay>
        <TimelineDateHead>Saturday, 3 October</TimelineDateHead>
        <TimelineScope>All times are Eastern.</TimelineScope>
        <TimelineList>
          <TimelineSession>
            <TimelineSessionTitle meta={['Walk', '9–11 a.m.']}>Warblers of the ravine</TimelineSessionTitle>
            <TimelineMeta>Happening now</TimelineMeta>
            <TimelineDescription>A slow loop with the bird count leaders.</TimelineDescription>
          </TimelineSession>
          <TimelineSession>
            <TimelineSessionTitle meta={['Talk', '1–2 p.m.']}>Why meadows burn</TimelineSessionTitle>
            <TimelineDescription>Our stewardship director on fire as a tool.</TimelineDescription>
          </TimelineSession>
        </TimelineList>
      </TimelineDay>
    </Timeline>
  )
}
