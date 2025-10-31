@echo off
rem Generate PNG icons from the SVG logo using ImageMagick (Windows)
rem Requires: ImageMagick installed and `magick` available on PATH

nrem Convert logo.svg to 192x192 and 512x512 PNGs
magick convert "assets/logo.svg" -background none -resize 192x192 "assets/logo-192.png"
magick convert "assets/logo.svg" -background none -resize 512x512 "assets/logo-512.png"

nrem Generate og-image (1200x630) from SVG template (assets/og-image.svg)
magick convert "assets/og-image.svg" -background none -resize 1200x630 "assets/og-image.png"
echo Icons generated: assets/logo-192.png assets/logo-512.png assets/og-image.png
pause