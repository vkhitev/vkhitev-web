import React from 'react'
import Layout from '@theme/Layout'

const About = () => {
  return (
    <Layout title="Hello">
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '50vh',
          fontSize: '20px',
        }}
      >
        <p>Hello, I'm Vlad.</p>
      </div>
    </Layout>
  )
}

export default About
