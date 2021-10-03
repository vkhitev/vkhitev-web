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
        <div className="avatar avatar--vertical margin-bottom--md">
          <img
            className={clsx('avatar__photo avatar__photo--xl', styles.avatar)}
            src="https://media-exp1.licdn.com/dms/image/C4E03AQFIJTYzBY7xfg/profile-displayphoto-shrink_800_800/0/1599642100884?e=1638403200&v=beta&t=V7zG5-Hxt4BT55LmuXmzmWtDu_P_psjt-YdY8UgOc64"
            alt=""
          />
        </div>

        <h1 className="hero__title">{siteConfig.title}</h1>
        <p className="hero__subtitle">{siteConfig.tagline}</p>
        <div className={styles.buttons}>
          <Link className="button button--lg button--outline" to="/docs/intro">
            Blog
          </Link>

          <Link className="button button--lg button--outline" to="/about">
            About
          </Link>
        </div>
      </div>
    </header>
  )
}

export default function Home(): JSX.Element {
  return (
    <Layout>
      <HomepageHeader />
      <main>
        <HomepageFeatures />
      </main>
    </Layout>
  )
}
