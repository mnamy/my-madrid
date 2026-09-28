# my madrid

A personal geospatial reconstruction of my semester abroad in Madrid, built from Apple Photos metadata.

Rather than organizing thousands of photos manually, I built a pipeline that extracts metadata from my Apple Photos library, groups photos into candidate memories using location + time, provides a custom interface for manual curation, maps those memories into Madrid neighborhoods, and turns the final dataset into an interactive React experience.

## pipeline

### 1. metadata extraction

Using Python and `osxphotos`, I extracted photo metadata including:

- UUID
- timestamp
- GPS coordinates
- album information
- favorites
- Apple-generated location metadata

The initial date range contained **7,814 photos**. After filtering geographically to Madrid, **3,195 photos** remained.

### 2. spatiotemporal clustering

I wrote a clustering script that groups photos using both geographic distance and elapsed time.

A candidate memory can grow while photos remain within:

- **150 meters** of the cluster centroid
- **60 minutes** between consecutive photos
- **180 minutes** total memory duration

This reduced 3,195 individual photos into **336 candidate memories**.

### 3. custom curation tool

Automatic clustering provided a first pass, but deciding what counted as a meaningful memory still required human judgment.

I built a separate React application to review all 336 candidate memories, preview representative photos, hide irrelevant clusters, and choose the photos that would appear in the final experience.

The curated dataset contains:

- **195 memories**
- **365 selected photos**

### 4. geographic classification

Apple's location metadata did not map cleanly to the neighborhoods I wanted to use in the final interface.

I created a classification layer that maps source labels into nine featured neighborhoods.

Examples:

    Universidad            → Malasaña
    Justicia               → Chueca
    Cortes                 → Barrio de las Letras
    Salamanca + Recoletos  → Salamanca
    Retiro + Jerónimos     → Retiro

### 5. derived neighborhood data

A Python script generates the neighborhood-level data used by the frontend, including:

- memory counts
- distinct days visited
- monthly activity
- time-of-day distributions
- geographic centers
- associated memory IDs

### 6. image optimization

The selected high-resolution photos originally totaled nearly 1 GB.

To improve browser performance, I created separate image pipelines for different UI contexts:

- lightweight images for the masonry gallery
- larger web-optimized images for memory modals
- lazy loading and asynchronous image decoding in the frontend

The final web assets are split into a smaller gallery set and a larger modal set so the interface does not need to load full-resolution source images up front.

## project structure

    my-madrid/
    ├── scripts/          # metadata, clustering, data-processing + image pipelines
    ├── curation-app/     # custom React tool used to curate generated memories
    ├── madrid-map/       # final React/Vite experience
    ├── DESIGN_SYSTEM.md
    └── README.md

## built with

Python · osxphotos · Pillow · React · Vite · JavaScript · CSS · Apple Photos metadata

## privacy

The public repository intentionally excludes my personal photos, raw Apple Photos metadata, exact source location history, and private intermediate datasets.

The repository contains the code used to build the project without publishing the underlying personal source data.

## local development

### final experience

    cd madrid-map
    npm install
    npm run dev

### curation tool

    cd curation-app
    npm install
    npm run dev

The curation tool requires local/private curation data and previews that are intentionally not included in the public repository.

## notes

This repository focuses on the code and technical pipeline behind the project. The deployed experience uses private curated data and photo assets that are excluded from source control.
