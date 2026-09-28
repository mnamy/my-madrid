from pathlib import Path
from PIL import Image, ImageOps

SOURCE_DIR = Path(
    "madrid-map/public/photos"
)

OUTPUT_DIR = Path(
    "madrid-map/public/photos-modal"
)

MAX_LONG_EDGE = 2000
JPEG_QUALITY = 85

OUTPUT_DIR.mkdir(
    parents=True,
    exist_ok=True,
)

photos = list(
    SOURCE_DIR.glob("*.jpeg")
)

print(
    f"Preparing {len(photos)} modal images..."
)

for index, source in enumerate(
    photos,
    start=1,
):
    destination = (
        OUTPUT_DIR / source.name
    )

    try:
        with Image.open(source) as image:
            image = (
                ImageOps.exif_transpose(
                    image
                )
            )

            if image.mode != "RGB":
                image = image.convert(
                    "RGB"
                )

            image.thumbnail(
                (
                    MAX_LONG_EDGE,
                    MAX_LONG_EDGE,
                ),
                Image.Resampling.LANCZOS,
            )

            image.save(
                destination,
                "JPEG",
                quality=JPEG_QUALITY,
                optimize=True,
                progressive=True,
            )

        print(
            f"[{index}/{len(photos)}] "
            f"{source.name}"
        )

    except Exception as error:
        print(
            f"ERROR {source.name}: "
            f"{error}"
        )

print()
print("Done.")
print(
    f"Saved to: {OUTPUT_DIR}"
)