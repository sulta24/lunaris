"use client"

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { 
  Dialog, 
  DialogContent, 
  DialogTitle, 
  DialogDescription 
} from '@/components/ui/dialog'
import { Mic, MicOff, Phone, Settings, Volume2, VolumeX, AlertCircle, RefreshCw } from 'lucide-react'
import { useVoiceChat } from '@/hooks/use-voice-chat'
import { ragApiService } from '@/lib/rag-api.service'
import { cn } from '@/lib/utils'

interface Character {
  name: string
  description: string
  imageSrc: string
}

interface VideoCallInterfaceProps {
  isOpen: boolean
  onClose: () => void
  character: Character | null
}

export function VideoCallInterface({ isOpen, onClose, character }: VideoCallInterfaceProps) {
  const {
    isListening,
    isRecording,
    recognizedText,
    response,
    error: voiceError,
    startListening,
    stopListening,
  } = useVoiceChat()

  const [isMuted, setIsMuted] = useState(false)
  const [systemStatus, setSystemStatus] = useState<'checking' | 'ready' | 'initializing' | 'error'>('checking')
  const [showSettings, setShowSettings] = useState(false)
  const [apiUrl, setApiUrl] = useState('')
  const [connectionError, setConnectionError] = useState<string | null>(null)

  // Проверка статуса системы при открытии
  useEffect(() => {
    if (isOpen && character) {
      checkSystemStatus()
    }
  }, [isOpen, character])

  // Загрузка сохраненного URL при монтировании
  useEffect(() => {
    setApiUrl(ragApiService.getBaseUrl())
  }, [])

  const checkSystemStatus = async () => {
    try {
      setSystemStatus('checking')
      setConnectionError(null)
      const status = await ragApiService.getStatus()
      
      if (status.status === 'ready') {
        setSystemStatus('ready')
        // Автоматически начинаем слушать
        setTimeout(() => {
          if (!isRecording) {
            startListening()
          }
        }, 1000)
      } else if (status.status === 'in_progress') {
        setSystemStatus('initializing')
        // Проверяем статус каждые 5 секунд
        setTimeout(checkSystemStatus, 5000)
      } else {
        setSystemStatus('error')
      }
    } catch (err) {
      console.error('Ошибка получения статуса:', err)
      setSystemStatus('error')
      setConnectionError(err instanceof Error ? err.message : 'Неизвестная ошибка')
    }
  }

  const handleInitializeSystem = async () => {
    try {
      setSystemStatus('initializing')
      setConnectionError(null)
      await ragApiService.initialize()
      // Проверяем статус через 3 секунды
      setTimeout(checkSystemStatus, 3000)
    } catch (err) {
      console.error('Ошибка инициализации:', err)
      setSystemStatus('error')
      setConnectionError(err instanceof Error ? err.message : 'Неизвестная ошибка')
    }
  }

  const handleMicToggle = () => {
    if (isMuted) {
      setIsMuted(false)
      if (!isRecording && systemStatus === 'ready') {
        startListening()
      }
    } else {
      setIsMuted(true)
      if (isRecording) {
        stopListening()
      }
    }
  }

  const handleUpdateApiUrl = () => {
    ragApiService.updateBaseUrl(apiUrl)
    setShowSettings(false)
    // Перепроверяем статус с новым URL
    checkSystemStatus()
  }

  const getStatusMessage = () => {
    switch (systemStatus) {
      case 'checking':
        return 'Проверка подключения...'
      case 'ready':
        return isRecording ? 'Слушаю...' : 'Готов к разговору'
      case 'initializing':
        return 'Инициализация системы...'
      case 'error':
        return connectionError || 'Ошибка подключения'
      default:
        return 'Неизвестное состояние'
    }
  }

  if (!character) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl h-[80vh] p-0 bg-gradient-to-br from-gray-900 to-black border-gray-700">
        <DialogTitle className="sr-only">
          Видеозвонок с {character.name}
        </DialogTitle>
        <DialogDescription className="sr-only">
          Интерфейс для голосового общения с AI-персонажем {character.name}
        </DialogDescription>
        
        <div className="flex flex-col h-full">
          {/* Заголовок */}
          <div className="flex items-center justify-between p-4 border-b border-gray-700">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-full overflow-hidden">
                <Image
                  src={character.imageSrc}
                  alt={character.name}
                  width={40}
                  height={40}
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <h3 className="text-white font-semibold">{character.name}</h3>
                <p className="text-gray-400 text-sm">{getStatusMessage()}</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowSettings(!showSettings)}
                className="text-gray-400 hover:text-white"
              >
                <Settings className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="text-gray-400 hover:text-white"
              >
                ✕
              </Button>
            </div>
          </div>

          {/* Настройки API */}
          {showSettings && (
            <div className="p-4 bg-gray-800 border-b border-gray-700">
              <div className="space-y-3">
                <label className="text-white text-sm font-medium">
                  URL RAG API:
                </label>
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={apiUrl}
                    onChange={(e) => setApiUrl(e.target.value)}
                    placeholder="http://localhost:8000"
                    className="flex-1 px-3 py-2 bg-gray-700 text-white rounded border border-gray-600 focus:border-blue-500 focus:outline-none"
                  />
                  <Button
                    onClick={handleUpdateApiUrl}
                    size="sm"
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    Обновить
                  </Button>
                </div>
                <p className="text-gray-400 text-xs">
                  Текущий URL: {ragApiService.getBaseUrl()}
                </p>
              </div>
            </div>
          )}

          {/* Основная область */}
          <div className="flex-1 flex flex-col items-center justify-center p-8 space-y-6">
            {/* Аватар персонажа */}
            <div className="relative">
              <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-gray-600">
                <Image
                  src={character.imageSrc}
                  alt={character.name}
                  width={128}
                  height={128}
                  className="w-full h-full object-cover"
                />
              </div>
              
              {/* Индикатор статуса */}
              <div className={cn(
                "absolute -bottom-2 -right-2 w-8 h-8 rounded-full border-4 border-gray-900 flex items-center justify-center",
                systemStatus === 'ready' ? 'bg-green-500' :
                systemStatus === 'checking' || systemStatus === 'initializing' ? 'bg-yellow-500' :
                'bg-red-500'
              )}>
                {systemStatus === 'checking' || systemStatus === 'initializing' ? (
                  <RefreshCw className="w-4 h-4 text-white animate-spin" />
                ) : systemStatus === 'error' ? (
                  <AlertCircle className="w-4 h-4 text-white" />
                ) : (
                  <div className="w-2 h-2 bg-white rounded-full" />
                )}
              </div>
            </div>

            {/* Сообщения об ошибках */}
            {systemStatus === 'error' && connectionError && (
              <div className="bg-red-900/50 border border-red-700 rounded-lg p-4 max-w-md text-center">
                <div className="flex items-center justify-center space-x-2 mb-2">
                  <AlertCircle className="w-5 h-5 text-red-400" />
                  <span className="text-red-400 font-medium">Ошибка подключения</span>
                </div>
                <p className="text-red-300 text-sm mb-3">{connectionError}</p>
                <div className="flex space-x-2 justify-center">
                  <Button
                    onClick={checkSystemStatus}
                    size="sm"
                    variant="outline"
                    className="border-red-600 text-red-400 hover:bg-red-900/50"
                  >
                    <RefreshCw className="w-4 h-4 mr-1" />
                    Повторить
                  </Button>
                  <Button
                    onClick={handleInitializeSystem}
                    size="sm"
                    className="bg-red-600 hover:bg-red-700"
                  >
                    Инициализировать
                  </Button>
                </div>
              </div>
            )}

            {/* Текстовые сообщения */}
            {(recognizedText || response || voiceError) && systemStatus === 'ready' && (
              <div className="w-full max-w-md space-y-3">
                {recognizedText && (
                  <div className="bg-blue-900/50 border border-blue-700 rounded-lg p-3">
                    <p className="text-blue-300 text-sm">Вы сказали:</p>
                    <p className="text-white">{recognizedText}</p>
                  </div>
                )}
                
                {response && (
                  <div className="bg-green-900/50 border border-green-700 rounded-lg p-3">
                    <p className="text-green-300 text-sm">{character.name} отвечает:</p>
                    <p className="text-white">{response}</p>
                  </div>
                )}
                
                {voiceError && (
                  <div className="bg-red-900/50 border border-red-700 rounded-lg p-3">
                    <p className="text-red-300 text-sm">Ошибка:</p>
                    <p className="text-white">{voiceError}</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Панель управления */}
          <div className="p-6 border-t border-gray-700">
            <div className="flex justify-center items-center space-x-6">
              {/* Кнопка микрофона */}
              <Button
                variant={isListening ? "default" : "secondary"}
                size="lg"
                className={cn(
                  "w-16 h-16 rounded-full",
                  isListening 
                    ? 'bg-green-600 hover:bg-green-700' 
                    : 'bg-gray-600 hover:bg-gray-700',
                  systemStatus !== 'ready' && 'opacity-50 cursor-not-allowed'
                )}
                onClick={handleMicToggle}
                disabled={systemStatus !== 'ready'}
              >
                {isListening ? (
                  <Mic className="w-6 h-6 text-white" />
                ) : (
                  <MicOff className="w-6 h-6 text-white" />
                )}
              </Button>

              {/* Кнопка завершения звонка */}
              <Button
                variant="destructive"
                size="lg"
                className="w-16 h-16 rounded-full bg-red-600 hover:bg-red-700"
                onClick={onClose}
              >
                <Phone className="w-6 h-6 text-white" />
              </Button>

              {/* Кнопка звука */}
              <Button
                variant="secondary"
                size="lg"
                className="w-16 h-16 rounded-full bg-gray-600 hover:bg-gray-700"
                onClick={() => setIsMuted(!isMuted)}
              >
                {isMuted ? (
                  <VolumeX className="w-6 h-6 text-white" />
                ) : (
                  <Volume2 className="w-6 h-6 text-white" />
                )}
              </Button>
            </div>

            {/* Подсказки */}
            <div className="text-center mt-4">
              <p className="text-gray-400 text-sm">
                {systemStatus === 'ready' 
                  ? (isListening ? 'Говорите сейчас...' : 'Нажмите на микрофон для начала разговора')
                  : systemStatus === 'error'
                    ? 'Проверьте подключение к серверу'
                    : 'Подготовка системы...'
                }
              </p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}