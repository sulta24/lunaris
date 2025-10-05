import { useState, useRef, useCallback, useEffect } from 'react'
import { ragApiService, type RagApiResponse } from '@/lib/rag-api.service'

export type VoiceChatStatus = 'idle' | 'listening' | 'speaking' | 'processing' | 'error'

export interface UseVoiceChatReturn {
  status: VoiceChatStatus
  isListening: boolean
  isRecording: boolean
  recognizedText: string
  response: string
  error: string | null
  startRecording: () => Promise<void>
  stopRecording: () => void
  playResponse: (audioBase64: string) => void
  clearError: () => void
  toggleMute: () => void
}

export function useVoiceChat(): UseVoiceChatReturn {
  const [status, setStatus] = useState<VoiceChatStatus>('idle')
  const [isListening, setIsListening] = useState(false)
  const [isRecording, setIsRecording] = useState(false)
  const [recognizedText, setRecognizedText] = useState('')
  const [response, setResponse] = useState('')
  const [error, setError] = useState<string | null>(null)

  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])
  const streamRef = useRef<MediaStream | null>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  // Очистка ошибки
  const clearError = useCallback(() => {
    setError(null)
  }, [])

  // Переключение звука
  const toggleMute = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.muted = !audioRef.current.muted
    }
  }, [])

  // Воспроизведение аудио ответа
  const playResponse = useCallback((audioBase64: string) => {
    try {
      if (audioRef.current) {
        audioRef.current.pause()
      }
      
      const audio = new Audio(`data:audio/mp3;base64,${audioBase64}`)
      audioRef.current = audio
      
      audio.onplay = () => setStatus('speaking')
      audio.onended = () => {
        setStatus('idle')
      }
      audio.onerror = () => {
        setError('Ошибка воспроизведения аудио')
        setStatus('error')
      }
      
      audio.play()
    } catch (err) {
      setError('Не удалось воспроизвести аудио')
      setStatus('error')
    }
  }, [])

  // Обработка аудио данных
  const processAudio = useCallback(async (audioBlob: Blob) => {
    try {
      setStatus('processing')
      setIsRecording(false)
      setIsListening(false)
      
      const response: RagApiResponse = await ragApiService.sendAudio(audioBlob)

      if (response.status === 'success') {
        if (response.recognized_text) {
          setRecognizedText(response.recognized_text)
        }
        if (response.answer) {
          setResponse(response.answer)
        }
        if (response.audio_base64) {
          playResponse(response.audio_base64)
        } else {
          setStatus('idle')
        }
      } else if (response.status === 'initializing') {
        setError('Система инициализируется, попробуйте через несколько секунд')
        setStatus('error')
      } else {
        setError(response.message || 'Ошибка обработки запроса')
        setStatus('error')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка обработки аудио')
      setStatus('error')
      setIsRecording(false)
      setIsListening(false)
    }
  }, [playResponse])

  // Начать запись
  const startRecording = useCallback(async () => {
    if (isListening || isRecording || status === 'speaking' || status === 'processing') return

    try {
      setError(null)
      setStatus('listening')
      setIsListening(true)
      setIsRecording(true)
      setRecognizedText('')
      setResponse('')

      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        } 
      })
      
      streamRef.current = stream

      // Настраиваем MediaRecorder
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      })
      
      mediaRecorderRef.current = mediaRecorder
      audioChunksRef.current = []

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data)
        }
      }

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm;codecs=opus' })
        if (audioBlob.size > 0) {
          processAudio(audioBlob)
        } else {
          setStatus('idle')
          setIsListening(false)
          setIsRecording(false)
        }
      }

      mediaRecorder.start()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка доступа к микрофону')
      setStatus('error')
      setIsListening(false)
      setIsRecording(false)
    }
  }, [isListening, isRecording, status, processAudio])

  // Остановить запись
  const stopRecording = useCallback(() => {
    if (!isListening && !isRecording) return

    // Останавливаем MediaRecorder
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop()
    }

    // Останавливаем поток
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop())
      streamRef.current = null
    }
  }, [isListening, isRecording])

  // Очистка при размонтировании
  useEffect(() => {
    return () => {
      stopRecording()
      if (audioRef.current) {
        audioRef.current.pause()
      }
    }
  }, [stopRecording])

  return {
    status,
    isListening,
    isRecording,
    recognizedText,
    response,
    error,
    startListening: startRecording, // Для обратной совместимости
    stopListening: stopRecording,   // Для обратной совместимости
    playResponse,
    clearError,
    toggleMute
  }
}