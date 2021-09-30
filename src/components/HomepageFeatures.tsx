import React from 'react'
import clsx from 'clsx'
import styles from './HomepageFeatures.module.css'

type FeatureItem = {
  title: string
  image: string
  description?: JSX.Element
}

const FeatureList: FeatureItem[] = [
  {
    title: 'Software Development',
    image: '/img/undraw_programming.svg',
  },
  {
    title: 'Computer Science',
    image: '/img/undraw_mathematics.svg',
  },
  {
    title: 'Writing',
    image: '/img/undraw_typewriter.svg',
  },
  {
    title: 'Music',
    image: '/img/undraw_compose_music.svg',
  },
  {
    title: 'Sport',
    image: '/img/undraw_healthy_habit.svg',
  },
  {
    title: 'Traveling',
    image: '/img/undraw_adventure.svg',
  },
  {
    title: 'Healthy Lifestyle',
    image: '/img/undraw_meditation.svg',
  },
  {
    title: 'Reading',
    image: '/img/undraw_book_lover.svg',
  },
  {
    title: 'Teaching',
    image: '/img/undraw_teaching.svg',
  },
]

function Feature({ title, image, description }: FeatureItem) {
  return (
    <div className={clsx('col col--4')}>
      <div className="text--center">
        <img className={styles.featureSvg} alt={title} src={image} />
      </div>
      <div className="text--center padding-horiz--md">
        <h3>{title}</h3>
        {description && <p>{description}</p>}
      </div>
    </div>
  )
}

export default function HomepageFeatures(): JSX.Element {
  return (
    <section className={styles.features}>
      <div className="container">
        <div className="row">
          {FeatureList.map((props, idx) => (
            <Feature key={idx} {...props} />
          ))}
        </div>
      </div>
    </section>
  )
}
