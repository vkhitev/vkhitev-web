import React from 'react'
import clsx from 'clsx'
import Layout from '@theme/Layout'
import Link from '@docusaurus/Link'
import useDocusaurusContext from '@docusaurus/useDocusaurusContext'
import styles from './index.module.css'
import HomepageFeatures from '../components/HomepageFeatures'

function HomepageHeader() {
  const { siteConfig } = useDocusaurusContext()

  return (
    <header className={clsx('hero hero--primary', styles.heroBanner)}>
      <div className="container">
        <div class="avatar avatar--vertical margin-bottom--md">
          <img
            class={clsx('avatar__photo avatar__photo--xl', styles.avatar)}
            src="https://media-exp1.licdn.com/dms/image/C4E03AQFIJTYzBY7xfg/profile-displayphoto-shrink_800_800/0/1599642100884?e=1638403200&v=beta&t=V7zG5-Hxt4BT55LmuXmzmWtDu_P_psjt-YdY8UgOc64"
            alt=""
          />
        </div>

        <h1 className="hero__title">{siteConfig.title}</h1>
        <p className="hero__subtitle">
          Software Engineer | Head of Front-End Chapter at{' '}
          <a
            href="https://www.axon.dev/"
            className={styles.link}
            target="_blank"
            rel="noopener noreferrer"
          >
            Axon
          </a>
        </p>
        <div className={styles.buttons}>
          <Link className="button button--lg" to="/docs/intro">
            Blog
          </Link>

          <Link className="button button--lg" to="/docs/intro">
            About
          </Link>
        </div>
      </div>
    </header>
  )
}

export default function Home() {
  const { siteConfig } = useDocusaurusContext()
  return (
    <Layout
      title={`${siteConfig.title}`}
      description="Vlad Khitev. Personal blog by Vlad Khitev."
    >
      <HomepageHeader />
      <main>
        <HomepageFeatures />
      </main>
    </Layout>
  )
}
