'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Mic, MicOff, PhoneOff, Volume2, VolumeX, AlertCircle, RefreshCw, Send, MessageSquare, Keyboard } from 'lucide-react'
import { useVoiceChat } from '@/hooks/use-voice-chat'
import { ragApiService } from '@/lib/rag-api.service'

type CallPhase = 'connecting' | 'loading-video' | 'playing-video' | 'conversation'

interface ChatMessage {
  id: string
  type: 'user' | 'assistant'
  content: string
  timestamp: Date
  isVoice?: boolean
}

export default function CallPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const videoRef = useRef<HTMLVideoElement>(null)
  const userVideoRef = useRef<HTMLVideoElement>(null)
  const chatContainerRef = useRef<HTMLDivElement>(null)
  
  const [callPhase, setCallPhase] = useState<CallPhase>('connecting')
  const [isMuted, setIsMuted] = useState(false)
  const [systemStatus, setSystemStatus] = useState<'checking' | 'ready' | 'initializing' | 'error'>('checking')
  const [connectionError, setConnectionError] = useState<string | null>(null)
  const [videoLoadProgress, setVideoLoadProgress] = useState(0)
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([])
  const [textInput, setTextInput] = useState('')
  const [isTextMode, setIsTextMode] = useState(false)
  const [isProcessingText, setIsProcessingText] = useState(false)
  const [userStream, setUserStream] = useState<MediaStream | null>(null)
  const [isCameraEnabled, setIsCameraEnabled] = useState(true)
  
  const characterName = searchParams.get('character') || 'Нил Армстронг'
  const videoPath = searchParams.get('video') || '/images/2025-10-05 12.21.18.mp4'
  
  const {
    isListening,
    isRecording,
    recognizedText,
    response,
    error,
    startListening,
    stopListening,
    toggleMute
  } = useVoiceChat()

  // Инициализация камеры пользователя
  const initializeUserCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: true, 
        audio: false 
      })
      setUserStream(stream)
      if (userVideoRef.current) {
        userVideoRef.current.srcObject = stream
      }
    } catch (error) {
      console.error('Ошибка доступа к камере:', error)
      setIsCameraEnabled(false)
    }
  }

  // Остановка камеры пользователя
  const stopUserCamera = () => {
    if (userStream) {
      userStream.getTracks().forEach(track => track.stop())
      setUserStream(null)
    }
  }

  // Переключение камеры
  const toggleCamera = () => {
    if (isCameraEnabled && userStream) {
      stopUserCamera()
      setIsCameraEnabled(false)
    } else {
      initializeUserCamera()
      setIsCameraEnabled(true)
    }
  }

  // Добавление сообщения в чат
  const addChatMessage = (type: 'user' | 'assistant', content: string, isVoice = false) => {
    const newMessage: ChatMessage = {
      id: Date.now().toString(),
      type,
      content,
      timestamp: new Date(),
      isVoice
    }
    setChatMessages(prev => [...prev, newMessage])
    
    // Автоскролл к последнему сообщению
    setTimeout(() => {
      if (chatContainerRef.current) {
        chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight
      }
    }, 100)
  }

  // Отправка текстового вопроса
  const handleSendTextQuestion = async () => {
    if (!textInput.trim() || isProcessingText || systemStatus !== 'ready') return
    
    const question = textInput.trim()
    setTextInput('')
    setIsProcessingText(true)
    
    // Добавляем вопрос пользователя в чат
    addChatMessage('user', question, false)
    
    try {
      const response = await ragApiService.askQuestion(question)
      
      if (response.status === 'success' && response.answer) {
        addChatMessage('assistant', response.answer, false)
        
        // Если есть аудио ответ, воспроизводим его
        if (response.audio_base64) {
          const audio = new Audio(`data:audio/mp3;base64,${response.audio_base64}`)
          audio.play().catch(console.error)
        }
      } else {
        addChatMessage('assistant', response.message || 'Извините, не удалось получить ответ', false)
      }
    } catch (error) {
      console.error('Ошибка отправки текстового вопроса:', error)
      addChatMessage('assistant', 'Произошла ошибка при обработке вопроса', false)
    } finally {
      setIsProcessingText(false)
    }
  }

  // Обработка Enter в текстовом поле
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendTextQuestion()
    }
  }

  // Отслеживание изменений в голосовом чате
  useEffect(() => {
    if (recognizedText && callPhase === 'conversation') {
      addChatMessage('user', recognizedText, true)
    }
  }, [recognizedText, callPhase])

  useEffect(() => {
    if (response && callPhase === 'conversation') {
      addChatMessage('assistant', response, true)
    }
  }, [response, callPhase])

  // Проверка статуса RAG системы
  const checkSystemStatus = async () => {
    try {
      setSystemStatus('checking')
      setConnectionError(null)
      const status = await ragApiService.getStatus()
      
      if (status.status === 'ready') {
        setSystemStatus('ready')
        // Когда система готова, начинаем загрузку видео
        if (callPhase === 'connecting') {
          startVideoLoading()
        }
      } else if (status.status === 'in_progress') {
        setSystemStatus('initializing')
        // Повторная проверка через 2 секунды
        setTimeout(checkSystemStatus, 2000)
      } else {
        setSystemStatus('error')
        setConnectionError('Система не готова к работе')
      }
    } catch (error) {
      setSystemStatus('error')
      setConnectionError(error instanceof Error ? error.message : 'Неизвестная ошибка')
    }
  }

  // Инициализация системы
  const handleInitializeSystem = async () => {
    try {
      setSystemStatus('initializing')
      setConnectionError(null)
      await ragApiService.initialize()
      // После инициализации проверяем статус
      setTimeout(checkSystemStatus, 1000)
    } catch (error) {
      setSystemStatus('error')
      setConnectionError(error instanceof Error ? error.message : 'Ошибка инициализации')
    }
  }

  // Загрузка видео
  const startVideoLoading = () => {
    setCallPhase('loading-video')
    setVideoLoadProgress(0)
    
    if (videoRef.current) {
      const video = videoRef.current
      
      // Обработчик прогресса загрузки
      const handleProgress = () => {
        if (video.buffered.length > 0) {
          const bufferedEnd = video.buffered.end(video.buffered.length - 1)
          const duration = video.duration
          if (duration > 0) {
            const progress = (bufferedEnd / duration) * 100
            setVideoLoadProgress(progress)
          }
        }
      }

      // Обработчик готовности к воспроизведению
      const handleCanPlayThrough = () => {
        setVideoLoadProgress(100)
        // Небольшая задержка для плавности
        setTimeout(() => {
          setCallPhase('playing-video')
          video.play().catch(console.error)
        }, 500)
      }

      // Обработчик начала воспроизведения
      const handlePlay = () => {
        setCallPhase('playing-video')
      }

      // Обработчик окончания видео
      const handleEnded = () => {
        setCallPhase('conversation')
        // Добавляем приветственное сообщение
        addChatMessage('assistant', `Привет! Я ${characterName}. Задавайте мне любые вопросы о космосе и моих миссиях!`, false)
        
        // Автоматически начинаем прослушивание через 2 секунды
        setTimeout(() => {
          if (systemStatus === 'ready' && !isTextMode) {
            startListening()
          }
        }, 2000)
      }

      // Обработчик ошибок загрузки
      const handleError = (e: Event) => {
        console.error('Ошибка загрузки видео:', e)
        // Если видео не загрузилось, переходим сразу в режим разговора
        setCallPhase('conversation')
        addChatMessage('assistant', `Привет! Я ${characterName}. Задавайте мне любые вопросы о космосе и моих миссиях!`, false)
      }

      video.addEventListener('progress', handleProgress)
      video.addEventListener('canplaythrough', handleCanPlayThrough)
      video.addEventListener('play', handlePlay)
      video.addEventListener('ended', handleEnded)
      video.addEventListener('error', handleError)
      
      // Начинаем загрузку видео
      video.load()

      return () => {
        video.removeEventListener('progress', handleProgress)
        video.removeEventListener('canplaythrough', handleCanPlayThrough)
        video.removeEventListener('play', handlePlay)
        video.removeEventListener('ended', handleEnded)
        video.removeEventListener('error', handleError)
      }
    }
  }

  useEffect(() => {
    // Проверяем статус RAG системы при загрузке
    checkSystemStatus()
    // Инициализируем камеру пользователя
    initializeUserCamera()
    
    // Очистка при размонтировании компонента
    return () => {
      stopUserCamera()
    }
  }, [])

  const handleEndCall = () => {
    // Останавливаем камеру перед закрытием
    stopUserCamera()
    // Немедленно перенаправляем на главную страницу
    window.location.href = '/'
  }

  const toggleMicrophone = () => {
    if (systemStatus !== 'ready' || callPhase !== 'conversation') return
    
    if (isListening || isRecording) {
      stopListening() // Остановить запись и отправить на обработку
    } else {
      startListening() // Начать запись
    }
  }

  const toggleVolume = () => {
    setIsMuted(!isMuted)
    if (videoRef.current) {
      videoRef.current.muted = !isMuted
    }
    toggleMute()
  }

  // Переключение режима ввода (голос/текст)
  const toggleInputMode = () => {
    setIsTextMode(!isTextMode)
    // Если переключаемся на голосовой режим и система готова, останавливаем прослушивание
    if (isTextMode && isListening) {
      stopListening()
    }
  }

  const getStatusMessage = () => {
    switch (callPhase) {
      case 'connecting':
        return systemStatus === 'error' ? 'Ошибка подключения' : 'Подключение...'
      case 'loading-video':
        return `Загрузка видео... ${Math.round(videoLoadProgress)}%`
      case 'playing-video':
        return 'Говорит...'
      case 'conversation':
        return isListening ? 'Слушает...' : 'Готов к разговору'
      default:
        return 'Подключение...'
    }
  }

  const getPhaseTitle = () => {
    switch (callPhase) {
      case 'connecting':
        return 'Звонок...'
      case 'loading-video':
        return 'Подготовка...'
      case 'playing-video':
        return 'На связи'
      case 'conversation':
        return 'Разговор'
      default:
        return 'Звонок...'
    }
  }

  return (
    <div className="fixed inset-0 bg-black z-50 flex flex-col">
      {/* Видео (скрыто во время загрузки) */}
      <div className="flex-1 relative overflow-hidden">
        <video
          ref={videoRef}
          className={`w-full h-full object-cover transition-opacity duration-500 ${
            callPhase === 'playing-video' ? 'opacity-100' : 'opacity-0'
          }`}
          muted={isMuted}
          playsInline
          preload="metadata"
        >
          <source src={videoPath} type="video/mp4" />
          Ваш браузер не поддерживает воспроизведение видео.
        </video>

        {/* Экран подключения */}
        {callPhase === 'connecting' && (
          <div className="absolute inset-0 bg-gradient-to-br from-gray-900 to-black flex flex-col items-center justify-center">
            <div className="w-32 h-32 rounded-full bg-gray-800 flex items-center justify-center mb-6 relative">
              <div className="w-24 h-24 rounded-full bg-gray-600 animate-pulse"></div>
              {systemStatus === 'checking' || systemStatus === 'initializing' ? (
                <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-blue-500 animate-spin"></div>
              ) : systemStatus === 'error' ? (
                <AlertCircle className="absolute w-8 h-8 text-red-500" />
              ) : (
                <div className="absolute w-4 h-4 bg-green-500 rounded-full top-2 right-2"></div>
              )}
            </div>
            
            <div className="text-white text-2xl font-semibold mb-2">
              {characterName}
            </div>
            
            <div className="text-gray-300 text-lg mb-4">
              {getPhaseTitle()}
            </div>
            
            <div className="text-gray-400 text-sm mb-6">
              {getStatusMessage()}
            </div>

            {/* Анимированные точки */}
            {systemStatus !== 'error' && (
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-white rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              </div>
            )}

            {/* Ошибки подключения */}
            {systemStatus === 'error' && connectionError && (
              <div className="mt-6 bg-red-900/50 border border-red-700 rounded-lg p-4 max-w-md">
                <div className="flex items-center space-x-2 mb-2">
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
          </div>
        )}

        {/* Экран загрузки видео */}
        {callPhase === 'loading-video' && (
          <div className="absolute inset-0 bg-gradient-to-br from-gray-900 to-black flex flex-col items-center justify-center">
            <div className="w-32 h-32 rounded-full bg-gray-800 flex items-center justify-center mb-6 relative">
              <div className="w-24 h-24 rounded-full bg-gray-600"></div>
              {/* Прогресс бар в виде кольца */}
              <svg className="absolute inset-0 w-32 h-32 transform -rotate-90">
                <circle
                  cx="64"
                  cy="64"
                  r="60"
                  stroke="currentColor"
                  strokeWidth="4"
                  fill="transparent"
                  className="text-gray-700"
                />
                <circle
                  cx="64"
                  cy="64"
                  r="60"
                  stroke="currentColor"
                  strokeWidth="4"
                  fill="transparent"
                  strokeDasharray={`${2 * Math.PI * 60}`}
                  strokeDashoffset={`${2 * Math.PI * 60 * (1 - videoLoadProgress / 100)}`}
                  className="text-blue-500 transition-all duration-300"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-white text-sm font-medium">
                  {Math.round(videoLoadProgress)}%
                </span>
              </div>
            </div>
            
            <div className="text-white text-2xl font-semibold mb-2">
              {characterName}
            </div>
            
            <div className="text-gray-300 text-lg mb-4">
              {getPhaseTitle()}
            </div>
            
            <div className="text-gray-400 text-sm">
              {getStatusMessage()}
            </div>
          </div>
        )}

        {/* Интерфейс разговора */}
        {callPhase === 'conversation' && (
          <div className="absolute inset-0 bg-gradient-to-br from-gray-900/90 to-black/90 flex flex-col">
            {/* Заголовок */}
            <div className="bg-black/50 p-4 border-b border-gray-700">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-full bg-gray-600 flex items-center justify-center">
                    <span className="text-white text-sm font-bold">
                      {characterName.charAt(0)}
                    </span>
                  </div>
                  <div>
                    <h3 className="text-white font-semibold">{characterName}</h3>
                    <p className="text-green-400 text-sm">В сети</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={toggleInputMode}
                    className={`${isTextMode ? 'bg-blue-600 text-white' : 'text-gray-400'}`}
                  >
                    {isTextMode ? <MessageSquare className="w-4 h-4" /> : <Keyboard className="w-4 h-4" />}
                  </Button>
                </div>
              </div>
            </div>

            {/* Чат */}
            <div 
              ref={chatContainerRef}
              className="flex-1 overflow-y-auto p-4 space-y-4"
            >
              {chatMessages.length === 0 && (
                <div className="text-center text-gray-400 mt-8">
                  <MessageSquare className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p className="text-lg mb-2">Начните разговор</p>
                  <p className="text-sm">
                    Нажмите на микрофон или используйте текстовый ввод
                  </p>
                </div>
              )}
              
              {chatMessages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                      message.type === 'user'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-700 text-white'
                    }`}
                  >
                    <p className="text-sm">{message.content}</p>
                    <div className="flex items-center justify-between mt-1">
                      <span className="text-xs opacity-70">
                        {message.timestamp.toLocaleTimeString()}
                      </span>
                      {message.isVoice && (
                        <Mic className="w-3 h-3 opacity-70" />
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Текстовый ввод */}
            {isTextMode && (
              <div className="bg-black/50 p-4 border-t border-gray-700">
                <div className="flex space-x-2">
                  <Input
                    value={textInput}
                    onChange={(e) => setTextInput(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Введите ваш вопрос..."
                    className="flex-1 bg-gray-800 border-gray-600 text-white placeholder-gray-400"
                    disabled={isProcessingText || systemStatus !== 'ready'}
                  />
                  <Button
                    onClick={handleSendTextQuestion}
                    disabled={!textInput.trim() || isProcessingText || systemStatus !== 'ready'}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    {isProcessingText ? (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <Send className="w-4 h-4" />
                    )}
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Камера пользователя - правый нижний угол */}
        {isCameraEnabled && userStream && (
          <div className="absolute bottom-20 right-4 w-48 h-36 bg-black rounded-lg overflow-hidden border-2 border-gray-600 shadow-lg">
            <video
              ref={userVideoRef}
              autoPlay
              muted
              playsInline
              className="w-full h-full object-cover"
            />
            <button
              onClick={toggleCamera}
              className="absolute top-2 right-2 w-8 h-8 bg-black/50 rounded-full flex items-center justify-center text-white text-sm hover:bg-black/70"
            >
              ×
            </button>
          </div>
        )}

        {/* Кнопка включения камеры если она выключена */}
        {!isCameraEnabled && (
          <button
            onClick={toggleCamera}
            className="absolute bottom-20 right-4 w-16 h-16 bg-gray-600 hover:bg-gray-700 rounded-full flex items-center justify-center text-white shadow-lg text-2xl"
          >
            📹
          </button>
        )}

        {/* Кнопки управления */}
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex items-center space-x-4">
          {/* Кнопка микрофона */}
          {callPhase === 'conversation' && (
            <Button
              variant="secondary"
              size="lg"
              className={`w-16 h-16 rounded-full ${
                isListening || isRecording
                  ? 'bg-red-600 hover:bg-red-700 animate-pulse' 
                  : 'bg-gray-600 hover:bg-gray-700'
              }`}
              onClick={toggleMicrophone}
              disabled={systemStatus !== 'ready' || status === 'processing'}
            >
              {isListening || isRecording ? (
                <MicOff className="w-6 h-6 text-white" />
              ) : (
                <Mic className="w-6 h-6 text-white" />
              )}
            </Button>
          )}

          {/* Кнопка переключения режима ввода */}
          {callPhase === 'conversation' && (
            <Button
              variant="secondary"
              size="lg"
              className={`w-16 h-16 rounded-full ${
                isTextMode ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gray-600 hover:bg-gray-700'
              }`}
              onClick={toggleInputMode}
            >
              {isTextMode ? (
                <Keyboard className="w-6 h-6 text-white" />
              ) : (
                <MessageSquare className="w-6 h-6 text-white" />
              )}
            </Button>
          )}

          {/* Кнопка завершения звонка */}
          <Button
            variant="destructive"
            size="lg"
            className="w-16 h-16 rounded-full bg-red-600 hover:bg-red-700"
            onClick={handleEndCall}
          >
            <PhoneOff className="w-6 h-6 text-white" />
          </Button>

          {/* Кнопка звука */}
          <Button
            variant="secondary"
            size="lg"
            className="w-16 h-16 rounded-full bg-gray-600 hover:bg-gray-700"
            onClick={toggleVolume}
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
            {callPhase === 'connecting' 
              ? (systemStatus === 'error' ? 'Проверьте подключение к серверу' : 'Установка соединения...')
              : callPhase === 'loading-video'
                ? 'Подготовка видео...'
                : callPhase === 'playing-video'
                  ? 'Видео воспроизводится...'
                  : callPhase === 'conversation'
                    ? (isTextMode 
                        ? 'Введите вопрос в текстовое поле'
                        : isListening 
                          ? 'Говорите сейчас...' 
                          : 'Нажмите на микрофон для начала разговора'
                      )
                    : 'Подготовка...'
            }
          </p>
        </div>
      </div>
    </div>
  )
}