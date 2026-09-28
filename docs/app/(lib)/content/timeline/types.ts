import { createMultipleTypes } from '@/functions/createTypes';
import {
  Timeline,
  TimelineList,
  TimelineEntry,
  TimelineTitle,
  TimelineTitleLink,
  TimelineText,
  TimelineCaption,
  TimelineDateStack,
  TimelineDay,
  TimelineDateHead,
  TimelineScope,
  TimelineSession,
  TimelineSessionTitle,
  TimelineMeta,
  TimelineDescription,
} from '@fairgarden/design/content/timeline';

const { types, AdditionalTypes } = createMultipleTypes(import.meta.url, {
  Timeline,
  TimelineList,
  TimelineEntry,
  TimelineTitle,
  TimelineTitleLink,
  TimelineText,
  TimelineCaption,
  TimelineDateStack,
  TimelineDay,
  TimelineDateHead,
  TimelineScope,
  TimelineSession,
  TimelineSessionTitle,
  TimelineMeta,
  TimelineDescription,
});

export const TypesTimeline = types;
export const TypesTimelineAdditional = AdditionalTypes;
