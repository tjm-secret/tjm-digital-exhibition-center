import type { 
  ExhibitionConfig, 
  ResourceConfig, 
  Scene 
} from '../types/index'

/**
 * ResourceManager handles loading exhibition content from different sources
 * Supports static files, API endpoints, and hybrid modes with fallback strategies
 */
export class ResourceManager {
  private config: ResourceConfig

  constructor(config: ResourceConfig) {
    this.config = config
  }

  /**
   * Load exhibition configuration based on the configured mode
   * @param exhibitionId - The ID of the exhibition to load
   * @returns Promise resolving to ExhibitionConfig
   */
  async loadExhibition(exhibitionId: string): Promise<ExhibitionConfig> {
    try {
      switch (this.config.mode) {
        case 'static':
          return await this.loadFromStatic(exhibitionId)
        case 'api':
          return await this.loadFromAPI(exhibitionId)
        case 'hybrid':
          return await this.loadHybrid(exhibitionId)
        default:
          throw new Error(`Unsupported resource mode: ${this.config.mode}`)
      }
    } catch (error) {
      return await this.handleFallback(exhibitionId, error as Error)
    }
  }

  /**
   * Load exhibition from static JSON files
   * @param exhibitionId - Exhibition ID
   * @returns Promise resolving to ExhibitionConfig
   */
  private async loadFromStatic(exhibitionId: string): Promise<ExhibitionConfig> {
    const staticPath = this.config.staticPath || '/assets/exhibitions/'
    const configPath = `${staticPath}${exhibitionId}/config.json`
    
    const response = await fetch(configPath)
    if (!response.ok) {
      throw new Error(`Failed to load static config from ${configPath}: ${response.status}`)
    }
    
    const config = await response.json()
    
    // Resolve relative paths to complete URLs for static mode
    return this.resolveStaticUrls(config, exhibitionId)
  }

  /**
   * Load exhibition from API endpoint
   * @param exhibitionId - Exhibition ID
   * @returns Promise resolving to ExhibitionConfig
   */
  private async loadFromAPI(exhibitionId: string): Promise<ExhibitionConfig> {
    if (!this.config.apiEndpoint) {
      throw new Error('API endpoint not configured for API mode')
    }
    
    const apiUrl = `${this.config.apiEndpoint}/${exhibitionId}`
    const response = await fetch(apiUrl)
    
    if (!response.ok) {
      throw new Error(`Failed to load from API ${apiUrl}: ${response.status}`)
    }
    
    return await response.json()
  }

  /**
   * Load exhibition using hybrid mode (API config + CDN media)
   * @param exhibitionId - Exhibition ID
   * @returns Promise resolving to ExhibitionConfig
   */
  private async loadHybrid(exhibitionId: string): Promise<ExhibitionConfig> {
    // Load configuration from API
    const config = await this.loadFromAPI(exhibitionId)
    
    // Resolve media URLs to CDN if configured
    return this.resolveCDNUrls(config)
  }

  /**
   * Resolve relative paths to complete URLs for static file mode
   * @param config - Exhibition configuration
   * @param exhibitionId - Exhibition ID
   * @returns Updated configuration with resolved URLs
   */
  private resolveStaticUrls(config: ExhibitionConfig, exhibitionId: string): ExhibitionConfig {
    const staticPath = this.config.staticPath || '/assets/exhibitions/'
    const basePath = `${staticPath}${exhibitionId}/`
    
    config.scenes.forEach((scene: Scene) => {
      // Resolve image URLs
      if (scene.image?.url && !scene.image.url.startsWith('http')) {
        scene.image.url = `${basePath}images/${scene.image.url}`
      }
      
      // Resolve thumbnail URLs if present
      if (scene.image?.thumbnail && !scene.image.thumbnail.startsWith('http')) {
        scene.image.thumbnail = `${basePath}images/${scene.image.thumbnail}`
      }
      
      // Resolve audio URLs for all languages
      if (scene.audio) {
        Object.keys(scene.audio).forEach(lang => {
          const audioFile = scene.audio[lang]
          if (audioFile?.url && !audioFile.url.startsWith('http')) {
            audioFile.url = `${basePath}audio/${audioFile.url}`
          }
        })
      }
    })
    
    return config
  }

  /**
   * Resolve media URLs to CDN for hybrid mode
   * @param config - Exhibition configuration
   * @returns Updated configuration with CDN URLs
   */
  private resolveCDNUrls(config: ExhibitionConfig): ExhibitionConfig {
    if (!this.config.cdnBaseUrl) {
      return config
    }
    
    const cdnBase = this.config.cdnBaseUrl.endsWith('/') 
      ? this.config.cdnBaseUrl 
      : `${this.config.cdnBaseUrl}/`
    
    config.scenes.forEach((scene: Scene) => {
      // Resolve image URLs to CDN if they are relative paths
      if (scene.image?.url && !scene.image.url.startsWith('http')) {
        scene.image.url = `${cdnBase}${scene.image.url}`
      }
      
      // Resolve thumbnail URLs to CDN if present and relative
      if (scene.image?.thumbnail && !scene.image.thumbnail.startsWith('http')) {
        scene.image.thumbnail = `${cdnBase}${scene.image.thumbnail}`
      }
      
      // Resolve audio URLs to CDN for all languages
      if (scene.audio) {
        Object.keys(scene.audio).forEach(lang => {
          const audioFile = scene.audio[lang]
          if (audioFile?.url && !audioFile.url.startsWith('http')) {
            audioFile.url = `${cdnBase}${audioFile.url}`
          }
        })
      }
    })
    
    return config
  }

  /**
   * Handle fallback loading when primary method fails
   * @param exhibitionId - Exhibition ID
   * @param error - The original error
   * @returns Promise resolving to ExhibitionConfig
   */
  private async handleFallback(exhibitionId: string, error: Error): Promise<ExhibitionConfig> {
    console.warn(`Primary resource loading failed: ${error.message}`)
    
    if (this.config.fallbackStrategy === 'none') {
      throw error
    }
    
    // Create temporary config for fallback attempt
    const fallbackConfig: ResourceConfig = {
      ...this.config,
      mode: this.config.fallbackStrategy as 'static' | 'api'
    }
    
    const fallbackManager = new ResourceManager(fallbackConfig)
    
    try {
      return await fallbackManager.loadExhibition(exhibitionId)
    } catch (fallbackError) {
      console.error(`Fallback loading also failed: ${(fallbackError as Error).message}`)
      throw new Error(`Both primary and fallback loading failed. Primary: ${error.message}, Fallback: ${(fallbackError as Error).message}`)
    }
  }

  /**
   * Validate that a resource configuration is properly set up for its mode
   * @param config - Resource configuration to validate
   * @returns boolean indicating if configuration is valid
   */
  static validateConfig(config: ResourceConfig): boolean {
    switch (config.mode) {
      case 'static':
        // Static mode can work with or without staticPath (defaults to /assets/exhibitions/)
        return true
        
      case 'api':
        // API mode requires apiEndpoint
        return !!config.apiEndpoint
        
      case 'hybrid':
        // Hybrid mode requires apiEndpoint, cdnBaseUrl is optional
        return !!config.apiEndpoint
        
      default:
        return false
    }
  }

  /**
   * Get the current resource configuration
   * @returns Current ResourceConfig
   */
  getConfig(): ResourceConfig {
    return { ...this.config }
  }

  /**
   * Update the resource configuration
   * @param newConfig - New resource configuration
   */
  updateConfig(newConfig: ResourceConfig): void {
    if (!ResourceManager.validateConfig(newConfig)) {
      throw new Error(`Invalid resource configuration for mode: ${newConfig.mode}`)
    }
    this.config = newConfig
  }
}