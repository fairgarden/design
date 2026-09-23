import { Carousel, CarouselSlide } from '@fairgarden-private/design/components/Carousel'
import {
  Card,
  CardMedia,
  CardMeta,
  CardTitle,
  CardTitleLink,
} from '@fairgarden-private/design/components/Card'
import styles from './cards.module.css'

const portrait =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 3 4'%3E%3Crect width='3' height='4' fill='%23b7c4a8'/%3E%3Ccircle cx='1.5' cy='1.6' r='.8' fill='%23627a55'/%3E%3C/svg%3E"
const landscape =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 3 2'%3E%3Crect width='3' height='2' fill='%23c9c1a6'/%3E%3Cpath d='M0 1.4 .9.9l.7.4.8-.6.6.5V2H0z' fill='%237a6d4a'/%3E%3C/svg%3E"

const species = [
  ['Hermit Thrush', 'Catharus guttatus'],
  ['Veery', 'Catharus fuscescens'],
  ['Swainson’s Thrush', 'Catharus ustulatus'],
  ['Gray-cheeked Thrush', 'Catharus minimus'],
  ['Bicknell’s Thrush', 'Catharus bicknelli'],
  ['American Robin', 'Turdus migratorius'],
]

const posts = [
  ['The river comes back', 'Feature · 12 min read'],
  ['What an easement protects', 'Explainer · 6 min read'],
  ['A year on the prairie', 'Photo essay · 9 min read'],
  ['Counting owls after dark', 'Field notes · 4 min read'],
  ['Seed libraries, explained', 'Explainer · 5 min read'],
]

/** Portrait species cards (2 + peek) and editorial post cards (`post`: 3 + peek from 1024 px of container). */
export function CarouselCards() {
  return (
    <div className={styles.stack}>
      <Carousel
        kind="cards"
        label="Similar species"
        header={<h3 className={styles.head}>Similar Species</h3>}
      >
        {species.map(([name, latin]) => (
          <CarouselSlide key={name}>
            <Card>
              <CardMedia>
                {/* A data-URI stand-in photo; next/image adds nothing here. */}
                <img src={portrait} alt="" />
              </CardMedia>
              <CardTitle>
                <CardTitleLink href="#species">{name}</CardTitleLink>
              </CardTitle>
              <CardMeta>
                <i>{latin}</i>
              </CardMeta>
            </Card>
          </CarouselSlide>
        ))}
      </Carousel>
      <Carousel
        kind="cards"
        post
        label="Related stories"
        header={<h3 className={styles.head}>Related Stories</h3>}
      >
        {posts.map(([title, meta]) => (
          <CarouselSlide key={title}>
            <Card>
              <CardMedia>
                <img src={landscape} alt="" />
              </CardMedia>
              <CardTitle>
                <CardTitleLink href="#post">{title}</CardTitleLink>
              </CardTitle>
              <CardMeta>{meta}</CardMeta>
            </Card>
          </CarouselSlide>
        ))}
      </Carousel>
    </div>
  )
}
