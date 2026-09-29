// ABOUTME: Verifies the app document references a favicon that actually exists.
// ABOUTME: Guards against the bare /favicon.ico 404 and a missing browser-tab icon.
import { describe, expect, it } from 'vitest'
import indexHtml from '../index.html?raw'
import faviconSvg from '../public/favicon.svg?raw'

const publicAssets = import.meta.glob('../public/*', { eager: true })
const publicAssetNames = Object.keys(publicAssets).map(
  (path) => path.split('/').pop() ?? '',
)

describe('document favicon', () => {
  it('declares an icon link that resolves to a real public asset', () => {
    const iconLink = indexHtml.match(/<link[^>]*\brel=["']icon["'][^>]*>/i)?.[0]
    expect(iconLink, 'index.html must declare a <link rel="icon">').toBeTruthy()

    const href = iconLink?.match(/\bhref=["']([^"']+)["']/i)?.[1]
    expect(href, 'the icon link must have an href').toBeTruthy()

    const fileName = href!.replace(/^\//, '')
    expect(
      publicAssetNames,
      `favicon asset ${href} must exist in public/`,
    ).toContain(fileName)
  })

  it('draws the Falchion in the reference artwork colors', () => {
    expect(faviconSvg).toContain('aria-label="Marth Falchion icon"')

    const colors = new Set(
      Array.from(faviconSvg.matchAll(/(?:fill|stroke)="(#[0-9a-f]{6})"/gi), (match) =>
        match[1].toLowerCase(),
      ),
    )
    expect(colors).toEqual(
      new Set([
        '#18245a',
        '#d8c6a9',
        '#a58e74',
        '#b45825',
        '#83431e',
        '#411b08',
        '#b37b51',
        '#b12b31',
        '#65a54d',
      ]),
    )
  })

  it('draws smooth curved shapes instead of pixel blocks', () => {
    expect(faviconSvg).not.toContain('crispEdges')
    expect(faviconSvg).toMatch(/ d="[^"]*C[-\d.]+ /)
    expect(faviconSvg).not.toMatch(/h\d+v1h-\d+z/)
  })

  it('declares an apple-touch-icon PNG that exists in public/', () => {
    const touchLink = indexHtml.match(
      /<link[^>]*\brel=["']apple-touch-icon["'][^>]*>/i,
    )?.[0]
    expect(touchLink, 'index.html must declare an apple-touch-icon').toBeTruthy()

    const href = touchLink?.match(/\bhref=["']([^"']+)["']/i)?.[1]
    expect(href, 'the apple-touch-icon must have an href').toMatch(/\.png$/)
    expect(publicAssetNames).toContain(href!.replace(/^\//, ''))
  })
})
