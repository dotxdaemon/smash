// ABOUTME: Verifies the app document references a favicon that actually exists.
// ABOUTME: Guards against the bare /favicon.ico 404 and a missing browser-tab icon.
import { describe, expect, it } from 'vitest'
import indexHtml from '../index.html?raw'

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
})
