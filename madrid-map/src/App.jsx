import {
  useState,
} from 'react'

import NeighborhoodExperience
  from './components/NeighborhoodExperience'

import AboutPage
  from './components/AboutPage'

import SiteNav
  from './components/SiteNav'


const GITHUB_URL = 'https://github.com/madelinenamy/my-madrid'


export default function App() {
  const [
    page,
    setPage,
  ] = useState(
    'explore',
  )

  return (
    <>
      <SiteNav
        page={
          page
        }
        onNavigate={
          setPage
        }
      />

      {page ===
        'explore' && (
        <NeighborhoodExperience />
      )}

      {page ===
        'about' && (
        <AboutPage
          githubUrl={
            GITHUB_URL
          }
        />
      )}
    </>
  )
}