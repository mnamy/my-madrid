import {
  useEffect,
  useMemo,
  useState,
} from 'react'

import './NeighborhoodExperience.css'


const OVERVIEW_ORDER = [
  'malasana',
  'chueca',
  'salamanca',
  'palacio',
  'sol',
  'barrio-de-las-letras',
  'la-latina',
  'lavapies',
  'retiro',
]


const NEXT_STOP_ORDER = [
  'malasana',
  'chueca',
  'salamanca',
  'retiro',
  'barrio-de-las-letras',
  'lavapies',
  'la-latina',
  'palacio',
  'sol',
]


const MONTHS = [
  'January',
  'February',
  'March',
  'April',
  'May',
]


const NEIGHBORHOOD_NOTES = {
  sol:
    "shoutout to my #home, i lived in an 11-person flat and made some awesome friends and memories",

  malasana:
    "the BEST vintage shopping u will ever find. if i’m wearing something cool, there’s a 90% chance i got it in malasana",

  'la-latina':
    "i associate this neighborhood with tapas because i went to la musa latina with some friends and it was literally the most delicious food i’ve ever had",

  retiro:
    "rain or shine, walking around here is gorgeous!",

  salamanca:
    "all i remember about this neighborhood is it was suuuuper fancy LOL",

  chueca:
    "apparently based on these photos, all i did here was eat",

  'barrio-de-las-letras':
    "one of the projects i did in my art class was analyzing the history of the street calle de las huertas (located in this neighborhood!) and coming up with a fun way to visualize it. i remember walking up and down this street for hours and hours",

  palacio:
    "a very touristy place but the royal palace has the most insane architecture i've ever seen",

  lavapies:
    "i wish i explored here more!!!",
}


function formatCoordinates(
  latitude,
  longitude,
) {
  if (
    latitude == null ||
    longitude == null
  ) {
    return null
  }

  const latitudeDirection =
    latitude >= 0
      ? 'N'
      : 'S'

  const longitudeDirection =
    longitude >= 0
      ? 'E'
      : 'W'

  return `${Math.abs(latitude).toFixed(5)}° ${latitudeDirection}, ${Math.abs(longitude).toFixed(5)}° ${longitudeDirection}`
}


function formatDate(dateString) {
  return new Intl.DateTimeFormat(
    'en-US',
    {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
      timeZone: 'Europe/Madrid',
    },
  ).format(
    new Date(dateString),
  )
}


function formatTime(dateString) {
  return new Intl.DateTimeFormat(
    'en-US',
    {
      hour: 'numeric',
      minute: '2-digit',
      timeZone: 'Europe/Madrid',
    },
  ).format(
    new Date(dateString),
  )
}


function getSemesterSpan(
  firstMemory,
  lastMemory,
) {
  const formatter =
    new Intl.DateTimeFormat(
      'en-US',
      {
        month: 'long',
        timeZone: 'Europe/Madrid',
      },
    )

  const first = formatter.format(
    new Date(firstMemory),
  )

  const last = formatter.format(
    new Date(lastMemory),
  )

  return first === last
    ? first
    : `${first} → ${last}`
}


function getMostActiveMonthLabel(
  monthCounts = {},
) {
  const values = MONTHS.map(
    (month) => ({
      month,
      count:
        monthCounts[month] || 0,
    }),
  )

  const max = Math.max(
    ...values.map(
      (item) => item.count,
    ),
    0,
  )

  if (max === 0) {
    return ''
  }

  return values
    .filter(
      (item) =>
        item.count === max,
    )
    .map(
      (item) => item.month,
    )
    .join(' + ')
}


function getTimePersonality(
  timeOfDay = {},
) {
  const options = [
    {
      key: 'morning',
      prefix:
        'mostly remembered in the',
      emphasis:
        'morning',
    },
    {
      key: 'afternoon',
      prefix:
        'mostly remembered in the',
      emphasis:
        'afternoon',
    },
    {
      key: 'evening',
      prefix:
        'mostly remembered in the',
      emphasis:
        'evening',
    },
    {
      key: 'lateNight',
      prefix:
        'mostly remembered',
      emphasis:
        'after dark',
    },
  ]

  const max = Math.max(
    ...options.map(
      (option) =>
        timeOfDay[option.key] || 0,
    ),
    0,
  )

  const winners =
    options.filter(
      (option) =>
        (
          timeOfDay[option.key] ||
          0
        ) === max &&
        max > 0,
    )

  if (
    winners.length === 1
  ) {
    return winners[0]
  }

  if (
    winners.length > 1
  ) {
    return {
      prefix:
        'mostly remembered in the',
      emphasis:
        winners
          .map(
            (winner) =>
              winner.emphasis,
          )
          .join(' + '),
    }
  }

  return {
    prefix:
      'memories spread across',
    emphasis:
      'the day',
  }
}


function NeighborhoodOverview({
  neighborhoods,
  onSelect,
}) {
  const ordered =
    OVERVIEW_ORDER
      .map(
        (id) =>
          neighborhoods.find(
            (item) =>
              item.id === id,
          ),
      )
      .filter(Boolean)

  return (
    <section className="neighborhood-overview">
      <header className="neighborhood-overview__header">
      <h1 className="display-lg">
        explore my madrid
      </h1>

      <p className="body-lg">
        nine neighborhoods that became
        part of my semester. hover around
        and click into each one to explore
        the memories behind it.
      </p>

      <a
        className="neighborhood-overview__source-link"
        href="https://github.com/mnamy/my-madrid"
        target="_blank"
        rel="noopener noreferrer"
      >
        view source on github ↗
      </a>
    </header>

      <div className="neighborhood-grid">
        {ordered.map(
          (
            neighborhood,
            index,
          ) => (
            <button
              key={
                neighborhood.id
              }
              className={`neighborhood-grid__item neighborhood-grid__item--${
                index + 1
              }`}
              onClick={() =>
                onSelect(
                  neighborhood.id,
                )
              }
            >
              <span className="neighborhood-grid__icon-wrap">
                <img
                  src={
                    neighborhood.icon
                  }
                  alt=""
                  className="neighborhood-grid__icon"
                />
              </span>

              <span className="neighborhood-grid__label">
                {
                  neighborhood.name
                }
              </span>
            </button>
          ),
        )}
      </div>
    </section>
  )
}


function ActivityStrip({
  monthCounts,
}) {
  return (
    <section
      className="activity-strip"
      aria-label="Memories by month"
    >
      {MONTHS.map(
        (month) => {
          const count =
            monthCounts?.[
              month
            ] || 0

          return (
            <div
              className="activity-strip__month"
              key={month}
            >
              <span className="activity-strip__label">
                {
                  month.slice(
                    0,
                    3,
                  )
                }
              </span>

              <div className="activity-strip__dots">
                {Array.from({
                  length:
                    count,
                }).map(
                  (
                    _,
                    index,
                  ) => (
                    <span
                      key={
                        index
                      }
                      className="activity-strip__dot"
                      title={`${month}: ${count} memories`}
                    />
                  ),
                )}
              </div>
            </div>
          )
        },
      )}
    </section>
  )
}


function GridPhoto({
  photo,
  memory,
  onOpen,
  onLoad,
  revealIndex,
}) {
  const highResSource =
    `/photos-modal/${photo.uuid}.jpeg`

  const gridSource =
    `/photos-grid/${photo.uuid}.jpeg`

  return (
    <button
      className="neighborhood-photo"
      style={{
        '--photo-reveal-index':
          revealIndex,
      }}
      onClick={onOpen}
      aria-label={`Open memory from ${formatDate(
        memory.start,
      )}`}
    >
      <img
        src={gridSource}
        alt=""
        loading="eager"
        decoding="async"
        fetchPriority="low"
        onLoad={onLoad}
        onError={(
          event,
        ) => {
          if (
            event.currentTarget
              .src !==
            new URL(
              highResSource,
              window.location.href,
            ).href
          ) {
            event.currentTarget.src =
              highResSource
          }
        }}
      />
    </button>
  )
}


function MemoryModal({
  neighborhood,
  memory,
  startingPhotoUuid,
  onClose,
}) {
  const initialIndex =
    Math.max(
      memory.photos.findIndex(
        (photo) =>
          photo.uuid ===
          startingPhotoUuid,
      ),
      0,
    )

  const [
    activePhotoIndex,
    setActivePhotoIndex,
  ] = useState(
    initialIndex,
  )

  useEffect(() => {
    setActivePhotoIndex(
      initialIndex,
    )
  }, [
    memory.id,
    initialIndex,
  ])

  useEffect(() => {
    const oldOverflow =
      document.body.style
        .overflow

    document.body.style
      .overflow = 'hidden'

    function handleKeyDown(
      event,
    ) {
      if (
        event.key ===
        'Escape'
      ) {
        onClose()
      }

      if (
        event.key ===
        'ArrowRight'
      ) {
        setActivePhotoIndex(
          (index) =>
            (
              index + 1
            ) %
            memory.photos
              .length,
        )
      }

      if (
        event.key ===
        'ArrowLeft'
      ) {
        setActivePhotoIndex(
          (index) =>
            (
              index -
              1 +
              memory.photos
                .length
            ) %
            memory.photos
              .length,
        )
      }
    }

    window.addEventListener(
      'keydown',
      handleKeyDown,
    )

    return () => {
      document.body.style
        .overflow =
        oldOverflow

      window.removeEventListener(
        'keydown',
        handleKeyDown,
      )
    }
  }, [
    memory.photos.length,
    onClose,
  ])

  const photo =
    memory.photos[
      activePhotoIndex
    ]

  const coordinates =
    formatCoordinates(
      memory.latitude,
      memory.longitude,
    )

  function goPrevious() {
    setActivePhotoIndex(
      (index) =>
        (
          index -
          1 +
          memory.photos.length
        ) %
        memory.photos.length,
    )
  }

  function goNext() {
    setActivePhotoIndex(
      (index) =>
        (
          index + 1
        ) %
        memory.photos.length,
    )
  }

  return (
    <div
      className="memory-modal"
      role="dialog"
      aria-modal="true"
      aria-label="Memory details"
    >
      <button
        className="memory-modal__backdrop"
        onClick={
          onClose
        }
        aria-label="Close memory"
      />

      <div className="memory-modal__content">
        <button
          className="memory-modal__close"
          onClick={
            onClose
          }
          aria-label="Close memory"
        >
          ×
        </button>

        <div className="memory-modal__image-wrap">
          <img
            src={`/photos-modal/${photo.uuid}.jpeg`}
            alt=""
            className="memory-modal__image"
            decoding="async"
          />

          {memory.photos
            .length > 1 && (
            <>
              <button
                className="memory-modal__arrow memory-modal__arrow--left"
                onClick={
                  goPrevious
                }
                aria-label="Previous photo"
              >
                ←
              </button>

              <button
                className="memory-modal__arrow memory-modal__arrow--right"
                onClick={
                  goNext
                }
                aria-label="Next photo"
              >
                →
              </button>
            </>
          )}
        </div>

        <div className="memory-modal__info">
          <p className="label">
            {formatDate(
              memory.start,
            )}
            {' · '}
            {formatTime(
              memory.start,
            )}
          </p>

          <h2>
            {
              neighborhood.name
            }
          </h2>

          {coordinates && (
            <p className="memory-modal__coordinates">
              {
                coordinates
              }
            </p>
          )}

          {memory.notes && (
            <p className="memory-modal__notes">
              {
                memory.notes
              }
            </p>
          )}

          {memory.photos
            .length > 1 && (
            <div className="memory-modal__thumbnails">
              {memory.photos.map(
                (
                  item,
                  index,
                ) => (
                  <button
                    key={
                      item.uuid
                    }
                    className={`memory-modal__thumbnail ${
                      index ===
                      activePhotoIndex
                        ? 'is-active'
                        : ''
                    }`}
                    onClick={() =>
                      setActivePhotoIndex(
                        index,
                      )
                    }
                    aria-label={`View photo ${index + 1}`}
                  >
                    <img
                      src={`/photos-modal/${item.uuid}.jpeg`}
                      alt=""
                      loading="lazy"
                      decoding="async"
                    />
                  </button>
                ),
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}


function NeighborhoodDetail({
  neighborhood,
  memories,
  neighborhoods,
  onBack,
  onSelect,
}) {
  const [
    modalPhoto,
    setModalPhoto,
  ] = useState(null)

  const [
    loadedPhotoIds,
    setLoadedPhotoIds,
  ] = useState(
    () => new Set(),
  )

  const neighborhoodMemories =
    useMemo(
      () =>
        neighborhood
          .memoryIds
          .map(
            (id) =>
              memories.find(
                (
                  memory,
                ) =>
                  memory.id ===
                  id,
              ),
          )
          .filter(Boolean),
      [
        neighborhood,
        memories,
      ],
    )

  const photoItems =
    useMemo(
      () =>
        neighborhoodMemories
          .flatMap(
            (memory) =>
              memory.photos.map(
                (photo) => ({
                  photo,
                  memory,
                }),
              ),
          ),
      [
        neighborhoodMemories,
      ],
    )

  useEffect(() => {
    setLoadedPhotoIds(
      new Set(),
    )
  }, [
    neighborhood.id,
  ])

  const galleryReady =
    photoItems.length === 0 ||
    loadedPhotoIds.size >=
      photoItems.length

  function markPhotoLoaded(
    photoKey,
  ) {
    setLoadedPhotoIds(
      (current) => {
        if (
          current.has(
            photoKey,
          )
        ) {
          return current
        }

        const next =
          new Set(
            current,
          )

        next.add(
          photoKey,
        )

        return next
      },
    )
  }

  const currentRouteIndex =
    NEXT_STOP_ORDER
      .indexOf(
        neighborhood.id,
      )

  const nextId =
    NEXT_STOP_ORDER[
      (
        currentRouteIndex +
        1
      ) %
      NEXT_STOP_ORDER.length
    ]

  const nextNeighborhood =
    neighborhoods.find(
      (item) =>
        item.id ===
        nextId,
    )

  const semesterSpan =
    getSemesterSpan(
      neighborhood
        .firstMemory,
      neighborhood
        .lastMemory,
    )

  const mostActiveMonth =
    getMostActiveMonthLabel(
      neighborhood
        .monthCounts,
    )

  const timePersonality =
    getTimePersonality(
      neighborhood
        .timeOfDay,
    )

  const neighborhoodNote =
    NEIGHBORHOOD_NOTES[
      neighborhood.id
    ]

  function goNextStop() {
    onSelect(
      nextId,
    )

    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    })
  }

  return (
    <section className="neighborhood-detail">
      <button
        className="neighborhood-detail__back"
        onClick={
          onBack
        }
      >
        ← back to neighborhoods
      </button>

      <div className="neighborhood-detail__layout">
        <aside className="neighborhood-detail__sidebar">
          <div className="neighborhood-detail__sidebar-inner">
            <img
              src={
                neighborhood.icon
              }
              alt=""
              className="neighborhood-detail__hero-icon"
            />

            <h1 className="display-lg neighborhood-detail__name">
              {
                neighborhood.name
              }
            </h1>

            {neighborhoodNote && (
              <div className="neighborhood-detail__notes">
                <p className="neighborhood-detail__notes-label">
                  maddie's notes:
                </p>

                <p className="neighborhood-detail__notes-text">
                  “{
                    neighborhoodNote
                  }”
                </p>
              </div>
            )}
          </div>
        </aside>

        <main className="neighborhood-detail__content">
          <section className="neighborhood-stats">
            <div className="neighborhood-stats__primary">
              <div>
                <strong>
                  {
                    neighborhood
                      .memoryCount
                  }
                </strong>

                <span>
                  memories
                </span>
              </div>

              <div>
                <strong>
                  {
                    neighborhood
                      .daysVisited
                  }
                </strong>

                <span>
                  days visited
                </span>
              </div>

              <div>
                <strong>
                  {
                    semesterSpan
                  }
                </strong>

                <span>
                  semester span
                </span>
              </div>
            </div>

            <div className="neighborhood-stats__secondary">
              <p>
                most active in{' '}
                <strong>
                  {
                    mostActiveMonth
                  }
                </strong>
              </p>

              <p>
                {
                  timePersonality
                    .prefix
                }{' '}
                <strong>
                  {
                    timePersonality
                      .emphasis
                  }
                </strong>
              </p>
            </div>
          </section>

          <ActivityStrip
            monthCounts={
              neighborhood
                .monthCounts
            }
          />

          <section className="neighborhood-photos">
            <div
              className={`neighborhood-photos__masonry ${
                galleryReady
                  ? 'is-ready'
                  : ''
              }`}
              aria-busy={
                !galleryReady
              }
            >
              {photoItems.map(
                (
                  {
                    photo,
                    memory,
                  },
                  index,
                ) => {
                  const photoKey =
                    `${memory.id}-${photo.uuid}`

                  return (
                    <GridPhoto
                      key={
                        photoKey
                      }
                      photo={
                        photo
                      }
                      memory={
                        memory
                      }
                      revealIndex={
                        index
                      }
                      onLoad={() =>
                        markPhotoLoaded(
                          photoKey,
                        )
                      }
                      onOpen={() =>
                        setModalPhoto({
                          memory,
                          photoUuid:
                            photo.uuid,
                        })
                      }
                    />
                  )
                },
              )}
            </div>
          </section>

          {nextNeighborhood && (
            <button
              className="next-stop"
              onClick={
                goNextStop
              }
            >
              <span className="label">
                view the next stop →
              </span>

              <strong>
                {
                  nextNeighborhood
                    .name
                }
              </strong>
            </button>
          )}
        </main>
      </div>

      {modalPhoto && (
        <MemoryModal
          neighborhood={
            neighborhood
          }
          memory={
            modalPhoto.memory
          }
          startingPhotoUuid={
            modalPhoto
              .photoUuid
          }
          onClose={() =>
            setModalPhoto(
              null,
            )
          }
        />
      )}
    </section>
  )
}


export default function NeighborhoodExperience() {
  const [
    neighborhoods,
    setNeighborhoods,
  ] = useState([])

  const [
    memories,
    setMemories,
  ] = useState([])

  const [
    selectedNeighborhoodId,
    setSelectedNeighborhoodId,
  ] = useState(null)

  const [
    loading,
    setLoading,
  ] = useState(true)

  const [
    error,
    setError,
  ] = useState(null)

  useEffect(() => {
    async function loadData() {
      try {
        const [
          statsResponse,
          memoriesResponse,
        ] =
          await Promise.all([
            fetch(
              '/neighborhood-stats.json',
            ),
            fetch(
              '/curated-memories.json',
            ),
          ])

        if (
          !statsResponse.ok ||
          !memoriesResponse.ok
        ) {
          throw new Error(
            'Could not load neighborhood data.',
          )
        }

        const [
          stats,
          memoryData,
        ] =
          await Promise.all([
            statsResponse.json(),
            memoriesResponse.json(),
          ])

        setNeighborhoods(
          stats,
        )

        setMemories(
          memoryData,
        )

      } catch (
        loadError
      ) {
        console.error(
          loadError,
        )

        setError(
          loadError.message,
        )

      } finally {
        setLoading(
          false,
        )
      }
    }

    loadData()
  }, [])

  if (loading) {
    return (
      <main className="neighborhood-state">
        loading neighborhoods...
      </main>
    )
  }

  if (error) {
    return (
      <main className="neighborhood-state">
        {error}
      </main>
    )
  }

  const selectedNeighborhood =
    neighborhoods.find(
      (item) =>
        item.id ===
        selectedNeighborhoodId,
    )

  return (
    <div className="neighborhood-experience">
      {!selectedNeighborhood && (
        <NeighborhoodOverview
          neighborhoods={
            neighborhoods
          }
          onSelect={
            setSelectedNeighborhoodId
          }
        />
      )}

      {selectedNeighborhood && (
        <NeighborhoodDetail
          neighborhood={
            selectedNeighborhood
          }
          memories={
            memories
          }
          neighborhoods={
            neighborhoods
          }
          onBack={() =>
            setSelectedNeighborhoodId(
              null,
            )
          }
          onSelect={
            setSelectedNeighborhoodId
          }
        />
      )}
    </div>
  )
}
