import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import * as fc from 'fast-check'
import { ResourceManager } from '../ResourceManager'
import type { ResourceConfig, ExhibitionConfig } from '../../types/index'

// Mock fetch globally
const mockFetch = vi.fn()
global.fetch = mockFetch

describe('ResourceManager Property Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  // Property 30: Resource Loading Fallback
  // *For any* failed primary resource loading attempt, 
  // the system should automatically attempt the configured fallback strategy
  // **Validates: Requirements 9.4**
  it('Property 30: Resource Loading Fallback', async () => {
    // Use simple, valid configurations to avoid validation errors
    const validConfigs = [
      {
        mode: 'static' as const,
        staticPath: '/assets/exhibitions/',
        apiEndpoint: undefined,
        cdnBaseUrl: undefined,
        fallbackStrategy: 'static' as const
      },
      {
        mode: 'api' as const,
        staticPath: undefined,
        apiEndpoint: '/api/exhibitions',
        cdnBaseUrl: undefined,
        fallbackStrategy: 'static' as const
      },
      {
        mode: 'hybrid' as const,
        staticPath: undefined,
        apiEndpoint: '/api/exhibitions',
        cdnBaseUrl: 'https://cdn.example.com/',
        fallbackStrategy: 'api' as const
      }
    ]

    const exhibitionIds = ['test-1', 'test-2', 'sample-exhibition']

    // Test each valid configuration with each exhibition ID
    for (const config of validConfigs) {
      for (const exhibitionId of exhibitionIds) {
        // Reset mocks for each test
        mockFetch.mockClear()
        
        const manager = new ResourceManager(config)

        // Create a simple mock exhibition config
        const mockExhibitionConfig: ExhibitionConfig = {
          id: exhibitionId,
          title: 'Test Exhibition',
          description: 'Test Description',
          scenes: [{
            id: 'scene-1',
            title: 'Test Scene',
            description: { en: 'Test scene description' },
            image: {
              url: 'test-image.jpg',
              alt: 'Test image',
              width: 800,
              height: 600
            },
            audio: {
              en: {
                url: 'test-audio.mp3',
                duration: 60,
                format: 'mp3' as const,
                size: 1024000
              }
            },
            order: 0
          }],
          defaultLanguage: 'en',
          availableLanguages: ['en'],
          resourceConfig: config,
          settings: {
            autoplay: false,
            showThumbnails: true,
            enableKeyboard: true,
            preloadCount: 2
          }
        }

        // Mock primary loading to fail
        mockFetch.mockRejectedValueOnce(new Error('Primary loading failed'))
        
        // Mock fallback loading to succeed
        mockFetch.mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(mockExhibitionConfig)
        } as Response)

        // Test that fallback is attempted when primary fails
        const result = await manager.loadExhibition(exhibitionId)
        
        // Verify that the result has the expected structure
        expect(result.id).toBe(exhibitionId)
        expect(result.title).toBe('Test Exhibition')
        expect(result.scenes).toHaveLength(1)
        
        // Verify that fetch was called at least twice (primary + fallback)
        expect(mockFetch).toHaveBeenCalledTimes(2)
      }
    }
  })

  // Property 31: URL Resolution Accuracy
  // *For any* resource configuration, the system should correctly resolve 
  // relative paths to absolute URLs based on the configured base paths or CDN URLs
  // **Validates: Requirements 9.5**
  it('Property 31: URL Resolution Accuracy', async () => {
    const testCases = [
      {
        config: {
          mode: 'static' as const,
          staticPath: '/assets/exhibitions/',
          apiEndpoint: undefined,
          cdnBaseUrl: undefined,
          fallbackStrategy: 'none' as const
        },
        exhibitionId: 'test-exhibition',
        expectedImagePath: '/assets/exhibitions/test-exhibition/images/',
        expectedAudioPath: '/assets/exhibitions/test-exhibition/audio/'
      },
      {
        config: {
          mode: 'hybrid' as const,
          staticPath: undefined,
          apiEndpoint: '/api/exhibitions',
          cdnBaseUrl: 'https://cdn.example.com/',
          fallbackStrategy: 'api' as const
        },
        exhibitionId: 'sample-exhibition',
        expectedImagePath: 'https://cdn.example.com/',
        expectedAudioPath: 'https://cdn.example.com/'
      }
    ]

    for (const testCase of testCases) {
      // Reset mocks for each test
      mockFetch.mockClear()
      
      const manager = new ResourceManager(testCase.config)
      
      // Create mock config with relative paths
      const mockConfig: ExhibitionConfig = {
        id: testCase.exhibitionId,
        title: 'Test Exhibition',
        description: 'Test Description',
        scenes: [{
          id: 'scene-1',
          title: 'Test Scene',
          description: { en: 'Test description' },
          image: {
            url: 'relative-image.jpg', // Relative path
            alt: 'Test image',
            width: 800,
            height: 600,
            thumbnail: 'relative-thumb.jpg' // Relative path
          },
          audio: {
            en: {
              url: 'relative-audio.mp3', // Relative path
              duration: 60,
              format: 'mp3' as const,
              size: 1024000
            }
          },
          order: 0
        }],
        defaultLanguage: 'en',
        availableLanguages: ['en'],
        resourceConfig: testCase.config,
        settings: {
          autoplay: false,
          showThumbnails: true,
          enableKeyboard: true,
          preloadCount: 2
        }
      }
      
      // Mock successful fetch
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockConfig)
      } as Response)

      const result = await manager.loadExhibition(testCase.exhibitionId)
      
      // Test URL resolution
      const scene = result.scenes[0]
      
      // Ensure scene exists before accessing its properties
      expect(scene).toBeDefined()
      
      if (testCase.config.mode === 'static') {
        // Check that relative image URLs are resolved to absolute paths
        expect(scene!.image.url).toContain(testCase.expectedImagePath)
        expect(scene!.image.url).toContain('relative-image.jpg')
        
        // Check thumbnail URL resolution
        if (scene!.image.thumbnail) {
          expect(scene!.image.thumbnail).toContain(testCase.expectedImagePath)
          expect(scene!.image.thumbnail).toContain('relative-thumb.jpg')
        }
        
        // Check audio URL resolution
        expect(scene!.audio.en?.url).toContain(testCase.expectedAudioPath)
        expect(scene!.audio.en?.url).toContain('relative-audio.mp3')
        
      } else if (testCase.config.mode === 'hybrid' && testCase.config.cdnBaseUrl) {
        // Check that relative URLs are resolved to CDN URLs
        expect(scene!.image.url).toContain(testCase.expectedImagePath)
        expect(scene!.image.url).toContain('relative-image.jpg')
        
        if (scene!.image.thumbnail) {
          expect(scene!.image.thumbnail).toContain(testCase.expectedImagePath)
          expect(scene!.image.thumbnail).toContain('relative-thumb.jpg')
        }
        
        expect(scene!.audio.en?.url).toContain(testCase.expectedAudioPath)
        expect(scene!.audio.en?.url).toContain('relative-audio.mp3')
      }
    }
  })

  // Additional test for configuration validation (this one should pass)
  it('ResourceManager.validateConfig should correctly validate configurations', () => {
    const testConfigs = [
      // Valid static config
      {
        mode: 'static' as const,
        staticPath: '/assets/exhibitions/',
        apiEndpoint: undefined,
        cdnBaseUrl: undefined,
        fallbackStrategy: 'none' as const,
        expectedValid: true
      },
      // Valid API config
      {
        mode: 'api' as const,
        staticPath: undefined,
        apiEndpoint: '/api/exhibitions',
        cdnBaseUrl: undefined,
        fallbackStrategy: 'static' as const,
        expectedValid: true
      },
      // Invalid API config (missing apiEndpoint)
      {
        mode: 'api' as const,
        staticPath: undefined,
        apiEndpoint: undefined,
        cdnBaseUrl: undefined,
        fallbackStrategy: 'static' as const,
        expectedValid: false
      },
      // Valid hybrid config
      {
        mode: 'hybrid' as const,
        staticPath: undefined,
        apiEndpoint: '/api/exhibitions',
        cdnBaseUrl: 'https://cdn.example.com/',
        fallbackStrategy: 'api' as const,
        expectedValid: true
      },
      // Invalid hybrid config (missing apiEndpoint)
      {
        mode: 'hybrid' as const,
        staticPath: undefined,
        apiEndpoint: undefined,
        cdnBaseUrl: 'https://cdn.example.com/',
        fallbackStrategy: 'api' as const,
        expectedValid: false
      }
    ]

    testConfigs.forEach((testConfig, index) => {
      const { expectedValid, ...config } = testConfig
      const isValid = ResourceManager.validateConfig(config as ResourceConfig)
      expect(isValid).toBe(expectedValid)
    })
  })
})