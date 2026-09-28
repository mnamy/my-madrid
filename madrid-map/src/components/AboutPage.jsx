import './AboutPage.css'


export default function AboutPage({
  githubUrl,
}) {
  return (
    <main className="about-page">
      <header className="about-page__hero">
        <p className="about-page__eyebrow">
          about the project
        </p>

        <h1 className="display-xl">
          my madrid
        </h1>

        <p className="about-page__intro">
          i wanted to see if i could
          reconstruct a semester of my life
          from the data already sitting
          inside my apple photos library.
          the final experience is built from
          a pipeline that extracts photo
          metadata, groups images into
          memories using time + location,
          lets me manually curate those
          clusters, maps them into
          human-facing neighborhoods, and
          turns the resulting dataset into
          an interactive react experience.
        </p>
      </header>


      <section className="about-page__flow">
        <p className="about-page__section-label">
          the pipeline
        </p>

        <div className="about-page__flow-diagram">
          <span>
            apple photos
          </span>

          <span className="about-page__flow-arrow">
            →
          </span>

          <span>
            metadata extraction
          </span>

          <span className="about-page__flow-arrow">
            →
          </span>

          <span>
            spatiotemporal clustering
          </span>

          <span className="about-page__flow-arrow">
            →
          </span>

          <span>
            manual curation
          </span>

          <span className="about-page__flow-arrow">
            →
          </span>

          <span>
            geographic classification
          </span>

          <span className="about-page__flow-arrow">
            →
          </span>

          <span>
            react experience
          </span>
        </div>
      </section>


      <section className="about-page__steps">

        <article className="about-step">
          <div className="about-step__number">
            01
          </div>

          <div className="about-step__content">
            <h2>
              metadata extraction
            </h2>

            <p>
              i used python and
              <code> osxphotos </code>
              to query my apple photos
              library and extract each
              photo's uuid, timestamp,
              gps coordinates, albums,
              favorites, and
              apple-generated location
              metadata.
            </p>

            <p>
              the initial semester dataset
              contained
              <strong> 7,814 photos</strong>.
              after filtering by date and a
              geographic bounding area
              around madrid,
              <strong> 3,195 photos </strong>
              remained for processing.
            </p>
          </div>
        </article>


        <article className="about-step">
          <div className="about-step__number">
            02
          </div>

          <div className="about-step__content">
            <h2>
              spatiotemporal clustering
            </h2>

            <p>
              individual photos are not
              very useful as memories, so i
              wrote a clustering algorithm
              that groups photos based on
              both geographic distance and
              elapsed time.
            </p>

            <div className="about-step__parameters">
              <div>
                <strong>
                  150m
                </strong>

                <span>
                  max distance from
                  cluster centroid
                </span>
              </div>

              <div>
                <strong>
                  60 min
                </strong>

                <span>
                  max gap between
                  consecutive photos
                </span>
              </div>

              <div>
                <strong>
                  180 min
                </strong>

                <span>
                  max total memory
                  duration
                </span>
              </div>
            </div>

            <p>
              that process reduced
              3,195 madrid photos into
              <strong>
                {' '}336 candidate
                memories
              </strong>.
            </p>
          </div>
        </article>


        <article className="about-step">
          <div className="about-step__number">
            03
          </div>

          <div className="about-step__content">
            <h2>
              custom curation tool
            </h2>

            <p>
              clustering could identify
              likely events, but it could
              not decide which ones were
              personally meaningful. i
              built a separate react
              application to review all
              336 generated clusters.
            </p>

            <p>
              the tool let me preview
              representative images, keep
              or hide memories, and choose
              the specific photos that
              would appear in the final
              project.
            </p>

            <p>
              the curated dataset contains
              <strong>
                {' '}195 memories
              </strong>
              {' '}and
              <strong>
                {' '}365 selected photos
              </strong>.
            </p>
          </div>
        </article>


        <article className="about-step">
          <div className="about-step__number">
            04
          </div>

          <div className="about-step__content">
            <h2>
              geographic classification
            </h2>

            <p>
              apple's location labels did
              not map cleanly to the
              neighborhoods people
              actually use, so i built a
              classification layer between
              the raw metadata and the
              interface.
            </p>

            <div className="about-step__mapping">
              <div>
                <code>
                  Universidad
                </code>

                <span>
                  →
                </span>

                <strong>
                  Malasaña
                </strong>
              </div>

              <div>
                <code>
                  Justicia
                </code>

                <span>
                  →
                </span>

                <strong>
                  Chueca
                </strong>
              </div>

              <div>
                <code>
                  Cortes
                </code>

                <span>
                  →
                </span>

                <strong>
                  Barrio de las Letras
                </strong>
              </div>

              <div>
                <code>
                  Salamanca +
                  Recoletos
                </code>

                <span>
                  →
                </span>

                <strong>
                  Salamanca
                </strong>
              </div>

              <div>
                <code>
                  Retiro +
                  Jerónimos
                </code>

                <span>
                  →
                </span>

                <strong>
                  Retiro
                </strong>
              </div>
            </div>
          </div>
        </article>


        <article className="about-step">
          <div className="about-step__number">
            05
          </div>

          <div className="about-step__content">
            <h2>
              derived data
            </h2>

            <p>
              once each memory had a
              neighborhood, another python
              script generated the data
              used by the frontend,
              including memory counts,
              distinct days visited,
              monthly activity,
              time-of-day distributions,
              geographic centers, and the
              memory ids belonging to each
              neighborhood.
            </p>

            <p>
              the frontend loads these
              generated json datasets and
              connects them back to the
              curated photo assets at
              runtime.
            </p>
          </div>
        </article>


        <article className="about-step">
          <div className="about-step__number">
            06
          </div>

          <div className="about-step__content">
            <h2>
              image delivery +
              performance
            </h2>

            <p>
              the selected high-resolution
              photos originally totaled
              nearly 1 gb, which was far
              heavier than necessary for a
              browser.
            </p>

            <p>
              i built separate image
              pipelines for different
              interface contexts:
              lightweight images for the
              masonry gallery and larger
              web-optimized images for the
              memory modal.
            </p>

            <div className="about-step__parameters">
              <div>
                <strong>
                  64 MB
                </strong>

                <span>
                  optimized masonry
                  assets
                </span>
              </div>

              <div>
                <strong>
                  171 MB
                </strong>

                <span>
                  optimized modal
                  assets
                </span>
              </div>

              <div>
                <strong>
                  lazy
                </strong>

                <span>
                  image loading +
                  async decoding
                </span>
              </div>
            </div>
          </div>
        </article>

      </section>


      <section className="about-page__numbers">
        <div>
          <strong>
            7,814
          </strong>

          <span>
            semester photos
          </span>
        </div>

        <span className="about-page__number-arrow">
          →
        </span>

        <div>
          <strong>
            3,195
          </strong>

          <span>
            madrid photos
          </span>
        </div>

        <span className="about-page__number-arrow">
          →
        </span>

        <div>
          <strong>
            336
          </strong>

          <span>
            candidate memories
          </span>
        </div>

        <span className="about-page__number-arrow">
          →
        </span>

        <div>
          <strong>
            195
          </strong>

          <span>
            curated memories
          </span>
        </div>

        <span className="about-page__number-arrow">
          →
        </span>

        <div>
          <strong>
            365
          </strong>

          <span>
            final photos
          </span>
        </div>
      </section>


      <footer className="about-page__footer">
        <div>
          <p className="about-page__section-label">
            built with
          </p>

          <p className="about-page__stack">
            Python · osxphotos ·
            Pillow · React · Vite ·
            JavaScript · CSS ·
            Apple Photos metadata
          </p>
        </div>

        {githubUrl ? (
          <a
            className="about-page__github"
            href={
              githubUrl
            }
            target="_blank"
            rel="noopener noreferrer"
          >
            view source on github →
          </a>
        ) : (
          <span className="about-page__github about-page__github--disabled">
            github link coming next
          </span>
        )}
      </footer>
    </main>
  )
}