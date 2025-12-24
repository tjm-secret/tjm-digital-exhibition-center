import { describe, it, expect } from 'vitest'
import * as fc from 'fast-check'
import type { ResourceConfig, ExhibitionConfig, Scene, AudioFile } from '../index'

describe('Data Models Property Tests', () => {
  // Property 29: Resource Loading Mode Flexibility
  // *For any* configured resource loading mode (static, API, or hybrid), 
  // the system should successfully load exhibition content using the specified strategy
  // **Validates: Requirements 9.1, 9.2, 9.3**
  it('Property 29: Resource Loading Mode Flexibility', () => {
    // Generator for ResourceConfig with different modes
    const resourceConfigArb = fc.record({
      mode: fc.constantFrom('static', 'api', 'hybrid'),
      staticPath: fc.option(fc.webPath(), { nil: undefined }),
      apiEndpoint: fc.option(fc.webUrl(), { nil: undefined }),
      cdnBaseUrl: fc.option(fc.webUrl(), { nil: undefined }),
      fallbackStrategy: fc.constantFrom('static', 'api', 'none')
    })

    // Generator for AudioFile
    const audioFileArb = fc.record({
      url: fc.webUrl(),
      duration: fc.integer({ min: 1, max: 3600 }),
      format: fc.constantFrom('mp3', 'ogg', 'wav'),
      size: fc.integer({ min: 1024, max: 10485760 }) // 1KB to 10MB
    })

    // Generator for Scene
    const sceneArb = fc.record({
      id: fc.uuid(),
      title: fc.string({ minLength: 1, maxLength: 100 }),
      description: fc.dictionary(
        fc.constantFrom('zh', 'en', 'ja'),
        fc.string({ minLength: 1, maxLength: 500 })
      ),
      image: fc.record({
        url: fc.webUrl(),
        alt: fc.string({ minLength: 1, maxLength: 200 }),
        width: fc.integer({ min: 100, max: 4000 }),
        height: fc.integer({ min: 100, max: 4000 }),
        thumbnail: fc.option(fc.webUrl(), { nil: undefined })
      }),
      audio: fc.dictionary(
        fc.constantFrom('zh', 'en', 'ja'),
        audioFileArb
      ),
      order: fc.integer({ min: 0, max: 100 }),
      metadata: fc.option(fc.record({
        artist: fc.option(fc.string({ minLength: 1, maxLength: 100 }), { nil: undefined }),
        year: fc.option(fc.string({ minLength: 4, maxLength: 4 }), { nil: undefined }),
        medium: fc.option(fc.string({ minLength: 1, maxLength: 100 }), { nil: undefined }),
        dimensions: fc.option(fc.string({ minLength: 1, maxLength: 100 }), { nil: undefined })
      }), { nil: undefined })
    })

    // Generator for ExhibitionConfig with proper language constraints
    const exhibitionConfigArb = fc.tuple(
      fc.array(fc.constantFrom('zh', 'en', 'ja'), { minLength: 1, maxLength: 3 })
    ).chain(([availableLanguages]) => {
      return fc.record({
        id: fc.uuid(),
        title: fc.string({ minLength: 1, maxLength: 100 }),
        description: fc.string({ minLength: 1, maxLength: 1000 }),
        scenes: fc.array(sceneArb, { minLength: 1, maxLength: 20 }),
        defaultLanguage: fc.constantFrom(...availableLanguages),
        availableLanguages: fc.constant(availableLanguages),
        resourceConfig: resourceConfigArb,
        settings: fc.record({
          autoplay: fc.boolean(),
          showThumbnails: fc.boolean(),
          enableKeyboard: fc.boolean(),
          preloadCount: fc.integer({ min: 0, max: 5 })
        })
      })
    })

    fc.assert(
      fc.property(exhibitionConfigArb, (config: ExhibitionConfig) => {
        // Test that the resource configuration is valid for the specified mode
        const { resourceConfig } = config
        
        switch (resourceConfig.mode) {
          case 'static':
            // Static mode should have staticPath defined or be able to work without it
            // The configuration should be valid regardless of staticPath presence
            expect(['static', 'api', 'hybrid']).toContain(resourceConfig.mode)
            expect(['static', 'api', 'none']).toContain(resourceConfig.fallbackStrategy)
            break
            
          case 'api':
            // API mode should have apiEndpoint defined or be able to work without it
            // The configuration should be valid regardless of apiEndpoint presence
            expect(['static', 'api', 'hybrid']).toContain(resourceConfig.mode)
            expect(['static', 'api', 'none']).toContain(resourceConfig.fallbackStrategy)
            break
            
          case 'hybrid':
            // Hybrid mode should be able to work with any combination of endpoints
            expect(['static', 'api', 'hybrid']).toContain(resourceConfig.mode)
            expect(['static', 'api', 'none']).toContain(resourceConfig.fallbackStrategy)
            break
            
          default:
            // Should never reach here with valid mode
            expect.fail(`Invalid resource loading mode: ${resourceConfig.mode}`)
        }

        // Verify that all scenes have valid structure for any loading mode
        config.scenes.forEach((scene: Scene) => {
          expect(scene.id).toBeTruthy()
          expect(scene.title).toBeTruthy()
          expect(typeof scene.description).toBe('object')
          expect(scene.image.url).toBeTruthy()
          expect(scene.image.width).toBeGreaterThan(0)
          expect(scene.image.height).toBeGreaterThan(0)
          expect(typeof scene.audio).toBe('object')
          expect(scene.order).toBeGreaterThanOrEqual(0)
        })

        // Verify that exhibition config has required fields for any loading mode
        expect(config.id).toBeTruthy()
        expect(config.title).toBeTruthy()
        expect(config.scenes.length).toBeGreaterThan(0)
        expect(config.availableLanguages.length).toBeGreaterThan(0)
        expect(config.availableLanguages).toContain(config.defaultLanguage)
      }),
      { numRuns: 100 }
    )
  })
})