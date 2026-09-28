import { useEffect, useMemo, useState } from 'react'
import './App.css'

const STORAGE_KEY = 'madrid-memory-curation-v1'

const FILTERS = [
  { value: 'all', label: 'all' },
  { value: 'undecided', label: 'undecided' },
  { value: 'keep', label: 'keep' },
  { value: 'hide', label: 'hide' },
  { value: 'split', label: 'split later' },
]

function formatDate(dateString) {
  const date = new Date(dateString)

  return new Intl.DateTimeFormat('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'Europe/Madrid',
  }).format(date)
}

function formatTime(dateString) {
  const date = new Date(dateString)

  return new Intl.DateTimeFormat('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    timeZone: 'Europe/Madrid',
  }).format(date)
}

function getLabelValues(items = []) {
  return items
    .map((item) => {
      if (typeof item === 'string') {
        return item
      }

      return item?.value
    })
    .filter(Boolean)
}

function App() {
  const [memories, setMemories] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('undecided')
  const [currentIndex, setCurrentIndex] = useState(0)

  useEffect(() => {
    async function loadMemories() {
      try {
        const response = await fetch('/curation-manifest.json')

        if (!response.ok) {
          throw new Error('Could not load curation-manifest.json')
        }

        const manifest = await response.json()

        const saved = JSON.parse(
          localStorage.getItem(STORAGE_KEY) || '{}',
        )

        const merged = manifest.map((memory) => {
          const savedMemory = saved[memory.id] || {}

          return {
            ...memory,

            decision:
              savedMemory.decision ??
              memory.decision ??
              null,

            notes:
              savedMemory.notes ??
              memory.notes ??
              '',

            selectedPhotoUuids:
              savedMemory.selectedPhotoUuids ??
              memory.preview_photos.map(
                (photo) => photo.uuid,
              ),
          }
        })

        setMemories(merged)
      } catch (error) {
        console.error(error)
      } finally {
        setLoading(false)
      }
    }

    loadMemories()
  }, [])

  useEffect(() => {
    if (!memories.length) {
      return
    }

    const saveData = {}

    memories.forEach((memory) => {
      saveData[memory.id] = {
        decision: memory.decision,
        notes: memory.notes,
        selectedPhotoUuids:
          memory.selectedPhotoUuids,
      }
    })

    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(saveData),
    )
  }, [memories])

  const filteredMemories = useMemo(() => {
    if (filter === 'all') {
      return memories
    }

    if (filter === 'undecided') {
      return memories.filter(
        (memory) => !memory.decision,
      )
    }

    return memories.filter(
      (memory) =>
        memory.decision === filter,
    )
  }, [memories, filter])

  useEffect(() => {
    if (
      currentIndex >
      filteredMemories.length - 1
    ) {
      setCurrentIndex(
        Math.max(
          filteredMemories.length - 1,
          0,
        ),
      )
    }
  }, [
    filteredMemories.length,
    currentIndex,
  ])

  const currentMemory =
    filteredMemories[currentIndex]

  const counts = useMemo(() => {
    return {
      total: memories.length,

      undecided: memories.filter(
        (memory) => !memory.decision,
      ).length,

      keep: memories.filter(
        (memory) =>
          memory.decision === 'keep',
      ).length,

      hide: memories.filter(
        (memory) =>
          memory.decision === 'hide',
      ).length,

      split: memories.filter(
        (memory) =>
          memory.decision === 'split',
      ).length,
    }
  }, [memories])

  const decidedCount =
    counts.total - counts.undecided

  const progress =
    counts.total === 0
      ? 0
      : Math.round(
          (decidedCount / counts.total) *
            100,
        )

  function updateMemory(
    memoryId,
    changes,
  ) {
    setMemories((current) =>
      current.map((memory) =>
        memory.id === memoryId
          ? {
              ...memory,
              ...changes,
            }
          : memory,
      ),
    )
  }

  function goNext() {
    if (!filteredMemories.length) {
      return
    }

    setCurrentIndex((index) =>
      Math.min(
        index + 1,
        filteredMemories.length - 1,
      ),
    )
  }

  function goPrevious() {
    setCurrentIndex((index) =>
      Math.max(index - 1, 0),
    )
  }

  function makeDecision(decision) {
    if (!currentMemory) {
      return
    }

    const memoryId = currentMemory.id

    updateMemory(memoryId, {
      decision,
    })

    /*
      When reviewing "undecided", the
      current memory disappears from
      the filtered list automatically.

      For other filters, advance normally.
    */

    if (filter !== 'undecided') {
      setTimeout(() => {
        goNext()
      }, 0)
    }
  }

  function togglePhoto(uuid) {
    if (!currentMemory) {
      return
    }

    const selected =
      currentMemory.selectedPhotoUuids ||
      []

    const nextSelected = selected.includes(
      uuid,
    )
      ? selected.filter(
          (selectedUuid) =>
            selectedUuid !== uuid,
        )
      : [...selected, uuid]

    updateMemory(currentMemory.id, {
      selectedPhotoUuids:
        nextSelected,
    })
  }

  function handleNotesChange(event) {
    if (!currentMemory) {
      return
    }

    updateMemory(currentMemory.id, {
      notes: event.target.value,
    })
  }

  function handleFilterChange(
    nextFilter,
  ) {
    setFilter(nextFilter)
    setCurrentIndex(0)
  }

  function exportCuration() {
    const output = memories.map(
      (memory) => ({
        ...memory,

        selected_preview_photos:
          memory.preview_photos.filter(
            (photo) =>
              memory.selectedPhotoUuids.includes(
                photo.uuid,
              ),
          ),
      }),
    )

    const blob = new Blob(
      [
        JSON.stringify(
          output,
          null,
          2,
        ),
      ],
      {
        type: 'application/json',
      },
    )

    const url =
      URL.createObjectURL(blob)

    const link =
      document.createElement('a')

    link.href = url
    link.download =
      'madrid-curation-results.json'

    document.body.appendChild(link)
    link.click()
    link.remove()

    URL.revokeObjectURL(url)
  }

  useEffect(() => {
    function handleKeyDown(event) {
      const tag =
        event.target.tagName.toLowerCase()

      const isTyping =
        tag === 'input' ||
        tag === 'textarea'

      if (isTyping) {
        return
      }

      if (event.key === 'ArrowRight') {
        event.preventDefault()
        goNext()
      }

      if (event.key === 'ArrowLeft') {
        event.preventDefault()
        goPrevious()
      }

      if (
        event.key.toLowerCase() === 'k'
      ) {
        makeDecision('keep')
      }

      if (
        event.key.toLowerCase() === 'h'
      ) {
        makeDecision('hide')
      }

      if (
        event.key.toLowerCase() === 's'
      ) {
        makeDecision('split')
      }
    }

    window.addEventListener(
      'keydown',
      handleKeyDown,
    )

    return () => {
      window.removeEventListener(
        'keydown',
        handleKeyDown,
      )
    }
  })

  if (loading) {
    return (
      <main className="app app--center">
        <p>loading your madrid memories...</p>
      </main>
    )
  }

  if (!memories.length) {
    return (
      <main className="app app--center">
        <p>
          couldn't load the curation
          manifest.
        </p>
      </main>
    )
  }

  const neighborhoods =
    currentMemory
      ? getLabelValues(
          currentMemory.apple_neighborhoods,
        )
      : []

  const places =
    currentMemory
      ? getLabelValues(
          currentMemory.places,
        )
      : []

  return (
    <main className="app">
      <header className="topbar">
        <div>
          <p className="eyebrow">
            madrid memory map
          </p>

          <h1>
            curate your semester
          </h1>
        </div>

        <button
          className="export-button"
          onClick={exportCuration}
        >
          export curation json
        </button>
      </header>

      <section className="progress-section">
        <div className="progress-copy">
          <span>
            {decidedCount} /{' '}
            {counts.total} reviewed
          </span>

          <span>
            {progress}%
          </span>
        </div>

        <div className="progress-track">
          <div
            className="progress-fill"
            style={{
              width: `${progress}%`,
            }}
          />
        </div>
      </section>

      <nav className="filters">
        {FILTERS.map((item) => {
          const count =
            item.value === 'all'
              ? counts.total
              : counts[item.value]

          return (
            <button
              key={item.value}
              className={`filter-button ${
                filter === item.value
                  ? 'is-active'
                  : ''
              }`}
              onClick={() =>
                handleFilterChange(
                  item.value,
                )
              }
            >
              {item.label}
              <span>{count}</span>
            </button>
          )
        })}
      </nav>

      {!currentMemory ? (
        <section className="empty-state">
          <h2>
            nothing left here ✦
          </h2>

          <p>
            You've reviewed every memory
            in this filter.
          </p>

          <button
            onClick={() =>
              handleFilterChange('all')
            }
          >
            view all memories
          </button>
        </section>
      ) : (
        <section className="workspace">
          <div className="memory-header">
            <div>
              <p className="memory-number">
                memory{' '}
                {currentMemory.id.replace(
                  'memory-',
                  '',
                )}
              </p>

              <h2>
                {formatDate(
                  currentMemory.start,
                )}
              </h2>

              <p className="memory-time">
                {formatTime(
                  currentMemory.start,
                )}
                {' → '}
                {formatTime(
                  currentMemory.end,
                )}
              </p>
            </div>

            <div className="memory-position">
              {currentIndex + 1} /{' '}
              {filteredMemories.length}
            </div>
          </div>

          <div className="metadata">
            <div className="metadata-item">
              <span className="metadata-label">
                photos
              </span>

              <span>
                {
                  currentMemory.photo_count
                }
              </span>
            </div>

            <div className="metadata-item">
              <span className="metadata-label">
                duration
              </span>

              <span>
                {Math.round(
                  currentMemory.duration_minutes,
                )}{' '}
                min
              </span>
            </div>

            <div className="metadata-item">
              <span className="metadata-label">
                favorites
              </span>

              <span>
                {
                  currentMemory.favorite_count
                }
              </span>
            </div>

            {neighborhoods.length >
              0 && (
              <div className="metadata-item metadata-item--wide">
                <span className="metadata-label">
                  apple location labels
                </span>

                <span>
                  {neighborhoods.join(
                    ' · ',
                  )}
                </span>
              </div>
            )}

            {places.length > 0 && (
              <div className="metadata-item metadata-item--wide">
                <span className="metadata-label">
                  place
                </span>

                <span>
                  {places.join(' · ')}
                </span>
              </div>
            )}
          </div>

          <div className="photo-section">
            <div className="photo-section-heading">
              <div>
                <h3>
                  preview photos
                </h3>

                <p>
                  click a photo to include
                  or exclude it
                </p>
              </div>

              <span>
                {
                  currentMemory
                    .selectedPhotoUuids
                    .length
                }
                {' / '}
                {
                  currentMemory
                    .preview_photos.length
                }{' '}
                selected
              </span>
            </div>

            <div className="photo-grid">
              {currentMemory.preview_photos.map(
                (photo) => {
                  const selected =
                    currentMemory.selectedPhotoUuids.includes(
                      photo.uuid,
                    )

                  return (
                    <button
                      key={photo.uuid}
                      className={`photo-card ${
                        selected
                          ? 'is-selected'
                          : 'is-deselected'
                      }`}
                      onClick={() =>
                        togglePhoto(
                          photo.uuid,
                        )
                      }
                      title={
                        photo.filename
                      }
                    >
                      <img
                        src={`/previews/${photo.uuid}_preview.jpeg`}
                        alt={
                          photo.filename ||
                          'Madrid memory'
                        }
                      />

                      <span className="photo-check">
                        {selected
                          ? '✓'
                          : '×'}
                      </span>

                      {photo.favorite && (
                        <span className="favorite-badge">
                          ★ favorite
                        </span>
                      )}
                    </button>
                  )
                },
              )}
            </div>
          </div>

          <div className="notes-section">
            <label htmlFor="memory-notes">
              notes
            </label>

            <textarea
              id="memory-notes"
              value={
                currentMemory.notes || ''
              }
              onChange={
                handleNotesChange
              }
              placeholder="optional: what was this memory? anything you want to remember later?"
            />
          </div>

          <div className="decision-section">
            <button
              className={`decision-button decision-button--keep ${
                currentMemory.decision ===
                'keep'
                  ? 'is-active'
                  : ''
              }`}
              onClick={() =>
                makeDecision('keep')
              }
            >
              <span>keep</span>
              <kbd>K</kbd>
            </button>

            <button
              className={`decision-button decision-button--hide ${
                currentMemory.decision ===
                'hide'
                  ? 'is-active'
                  : ''
              }`}
              onClick={() =>
                makeDecision('hide')
              }
            >
              <span>hide</span>
              <kbd>H</kbd>
            </button>

            <button
              className={`decision-button decision-button--split ${
                currentMemory.decision ===
                'split'
                  ? 'is-active'
                  : ''
              }`}
              onClick={() =>
                makeDecision('split')
              }
            >
              <span>
                flag to split
              </span>
              <kbd>S</kbd>
            </button>
          </div>

          <div className="navigation">
            <button
              onClick={goPrevious}
              disabled={
                currentIndex === 0
              }
            >
              ← previous
            </button>

            <p>
              decisions save
              automatically
            </p>

            <button
              onClick={goNext}
              disabled={
                currentIndex >=
                filteredMemories.length -
                  1
              }
            >
              next →
            </button>
          </div>
        </section>
      )}
    </main>
  )
}

export default App