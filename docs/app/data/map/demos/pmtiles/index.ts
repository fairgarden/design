import { createDemo } from '@/functions/createDemo';
import { MapLocation } from './MapLocation';

export const DemoMapLocation = createDemo(import.meta.url, MapLocation, {
  name: 'A location map on PMTiles',
  slug: 'pmtiles',
});
