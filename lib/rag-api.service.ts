// Конфигурация API - здесь можно менять URL Cloudflare Tunnel
const API_CONFIG = {
  BASE_URL: process.env.NEXT_PUBLIC_RAG_API_URL || 'http://localhost:8000',
  LANGUAGE_CODE: 'ru-RU',
  ENABLE_TTS: true,
}

export interface RagApiResponse {
  status: 'success' | 'error' | 'initializing'
  recognized_text?: string
  answer?: string
  citations?: string[]
  audio_base64?: string
  message?: string
}

export interface RagStatusResponse {
  status: 'ready' | 'in_progress' | 'error'
  tts_available: boolean
  stt_available: boolean
}

export class RagApiService {
  private static instance: RagApiService

  private constructor() {
    // Конструктор пустой - URL всегда берется из переменной окружения
  }

  public static getInstance(): RagApiService {
    if (!RagApiService.instance) {
      RagApiService.instance = new RagApiService()
    }
    return RagApiService.instance
  }

  // Получить текущий URL - ТОЛЬКО из переменной окружения
  public getBaseUrl(): string {
    return API_CONFIG.BASE_URL
  }

  // Проверить статус системы
  public async getStatus(): Promise<RagStatusResponse> {
    try {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 10000) // 10 секунд таймаут

      const response = await fetch(`${this.getBaseUrl()}/status`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        signal: controller.signal
      })
      
      clearTimeout(timeoutId)

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      return data
    } catch (error: any) {
      if (error.name === 'AbortError') {
        throw new Error('Превышено время ожидания соединения с сервером')
      }
      throw error
    }
  }

  // Инициализация системы
  public async initialize(): Promise<{ status: string; message: string }> {
    try {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 30000) // 30 секунд для инициализации

      const response = await fetch(`${this.getBaseUrl()}/initialize`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        signal: controller.signal
      })
      
      clearTimeout(timeoutId)

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      return data
    } catch (error: any) {
      if (error.name === 'AbortError') {
        throw new Error('Превышено время ожидания инициализации')
      }
      throw error
    }
  }

  // Отправка аудио для распознавания и получения ответа
  public async sendAudio(audioBlob: Blob): Promise<RagApiResponse> {
    try {
      const formData = new FormData()
      formData.append('audio', audioBlob, 'audio.wav')
      formData.append('enable_tts', 'true')

      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 60000) // 60 секунд для обработки аудио

      const response = await fetch(`${this.getBaseUrl()}/speech-to-text`, {
        method: 'POST',
        body: formData,
        signal: controller.signal
      })
      
      clearTimeout(timeoutId)

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      return data
    } catch (error: any) {
      if (error.name === 'AbortError') {
        throw new Error('Превышено время ожидания обработки аудио')
      }
      throw error
    }
  }

  // Отправка текстового вопроса
  public async askQuestion(question: string): Promise<RagApiResponse> {
    try {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 30000) // 30 секунд для текстового запроса

      const response = await fetch(`${this.getBaseUrl()}/ask`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          question: question,
          enable_tts: API_CONFIG.ENABLE_TTS
        }),
        signal: controller.signal
      })
      
      clearTimeout(timeoutId)

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      return data
    } catch (error: any) {
      if (error.name === 'AbortError') {
        throw new Error('Превышено время ожидания ответа')
      }
      throw error
    }
  }

  // Получить доступные языки STT
  public async getSttLanguages(): Promise<{ available: boolean; languages: string[] }> {
    try {
      const response = await fetch(`${this.getBaseUrl()}/stt/languages`)
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      return await response.json()
    } catch (error) {
      return { available: false, languages: [] }
    }
  }

  // Получить доступные голоса TTS
  public async getTtsVoices(): Promise<{ available: boolean; voices: Record<string, string[]> }> {
    try {
      const response = await fetch(`${this.getBaseUrl()}/tts/voices`)
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      return await response.json()
    } catch (error) {
      return { available: false, voices: {} }
    }
  }
}

export const ragApiService = RagApiService.getInstance()