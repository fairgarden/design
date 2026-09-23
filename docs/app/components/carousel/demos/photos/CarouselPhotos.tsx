import { Carousel, CarouselPhoto } from '@fairgarden-private/design/components/Carousel'
import styles from './photos.module.css'

function stand(width: number, height: number, sky: string, land: string) {
  return `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 ${width} ${height}'%3E%3Crect width='${width}' height='${height}' fill='%23${sky}'/%3E%3Cpath d='M0 ${height * 0.7}L${width * 0.3} ${height * 0.45}L${width * 0.55} ${height * 0.62}L${width} ${height * 0.4}V${height}H0z' fill='%23${land}'/%3E%3C/svg%3E`
}

const photos = [
  {
    ratio: 3 / 2,
    caption: 'Adult male in spring, singing from a low perch.',
    credit: 'Photo: A. Díaz',
  },
  {
    ratio: 4 / 5,
    caption: 'Nest of dead leaves and mud in a sapling fork.',
    credit: 'Photo: J. Okafor',
  },
  {
    ratio: 16 / 9,
    caption: 'Breeding habitat: mature eastern hardwood forest.',
    credit: 'Photo: M. Chen',
  },
  {
    ratio: 1,
    caption: 'Juvenile, spotted on the back as well as the breast.',
    credit: 'Photo: A. Díaz',
  },
  { ratio: 3 / 2, caption: 'Foraging in leaf litter along a stream.', credit: 'Photo: R. Silva' },
  {
    ratio: 2 / 3,
    caption: 'Winter range in the lowland forests of Central America.',
    credit: 'Photo: L. Park',
  },
  { ratio: 3 / 2, caption: 'Banding station, early May.', credit: 'Photo: J. Okafor' },
  { ratio: 5 / 4, caption: 'Eggs: three to four, pale blue.', credit: 'Photo: M. Chen' },
]

/** Eight photos: ≈ 88% single slides, and from 1024 px of container a 480 px strip at each photo's own ratio. */
export function CarouselPhotos() {
  return (
    <div className={styles.frame}>
      <Carousel kind="photos" label="Wood Thrush photos" printUrl="example.org/wood-thrush/photos">
        {photos.map((photo, index) => (
          <CarouselPhoto
            key={photo.caption}
            src={stand(
              Math.round(photo.ratio * 120),
              120,
              index % 2 ? 'b7c4a8' : 'c9c1a6',
              index % 2 ? '627a55' : '7a6d4a',
            )}
            alt={photo.caption}
            ratio={photo.ratio}
            caption={photo.caption}
            credit={photo.credit}
          />
        ))}
      </Carousel>
    </div>
  )
}
