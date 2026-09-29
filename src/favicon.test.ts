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

  it('draws the Palutena stock icon in the reference colors', () => {
    expect(faviconSvg).toContain('aria-label="Palutena stock icon"')

    const fills = new Set(
      Array.from(faviconSvg.matchAll(/fill="(#[0-9a-f]{6})"/gi), (match) =>
        match[1].toLowerCase(),
      ),
    )
    expect(fills).toEqual(
      new Set([
        '#373635',
        '#3d8900',
        '#3ea600',
        '#3fc600',
        '#d5d000',
        '#ccb40c',
        '#ffe8cc',
        '#ea00d1',
      ]),
    )
  })

  it('renders the icon with hard pixel edges', () => {
    expect(faviconSvg).toContain('shape-rendering="crispEdges"')
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
