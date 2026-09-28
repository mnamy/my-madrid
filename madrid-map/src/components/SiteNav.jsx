import './SiteNav.css'


export default function SiteNav({
  page,
  onNavigate,
}) {
  const isAbout =
    page === 'about'

  return (
    <nav
      className={`site-nav ${
        isAbout
          ? 'site-nav--about'
          : 'site-nav--explore'
      }`}
      aria-label="Site navigation"
    >
      <button
        type="button"
        onClick={() =>
          onNavigate(
            isAbout
              ? 'explore'
              : 'about',
          )
        }
      >
        {isAbout
          ? 'explore →'
          : 'about'}
      </button>
    </nav>
  )
}