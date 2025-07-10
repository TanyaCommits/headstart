import { useState, useEffect, useCallback, useRef } from 'react';
import { MediaState, AudioChunkData } from '../types';

interface UseMediaStreamOptions {
  onAudioChunk?: (chunk: AudioChunkData) => void;
  chunkDuration?: number; // in milliseconds
}

interface UseMediaStreamReturn {
  stream: MediaStream | null;
  mediaState: MediaState;
  error: string | null;
  toggleVideo: () => void;
  toggleAudio: () => void;
  startStream: () => Promise<void>;
  stopStream: () => void;
}

export const useMediaStream = (options: UseMediaStreamOptions = {}): UseMediaStreamReturn => {
  const { onAudioChunk, chunkDuration = 500 } = options;
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [mediaState, setMediaState] = useState<MediaState>({ video: true, audio: true });
  const [error, setError] = useState<string | null>(null);

  const audioContextRef = useRef<AudioContext | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const recordingBufferRef = useRef<Float32Array[]>([]);
  const lastChunkTimeRef = useRef<number>(0);

  const startStream = useCallback(async () => {
    // Don't start if already have a stream
    if (stream) {
      console.log('Stream already exists, skipping...');
      return;
    }

    try {
      console.log('Requesting media access...');
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: mediaState.video,
        audio: mediaState.audio
      });

      setStream(mediaStream);
      setError(null);
      console.log('Media stream started successfully');

      // Set up audio processing for chunk extraction
      if (mediaState.audio && onAudioChunk) {
        const audioContext = new AudioContext();
        const source = audioContext.createMediaStreamSource(mediaStream);
        
        // Create processor node (deprecated but still widely supported)
        const processor = audioContext.createScriptProcessor(4096, 1, 1);
        
        processor.onaudioprocess = (audioProcessingEvent) => {
          // Check if audio track is enabled
          const audioTrack = mediaStream.getAudioTracks()[0];
          if (!audioTrack || !audioTrack.enabled) {
            return; // Skip processing if audio is disabled
          }

          const inputBuffer = audioProcessingEvent.inputBuffer;
          const inputData = inputBuffer.getChannelData(0);
          
          // Check if there's actual audio content (not just silence)
          const hasAudio = inputData.some(sample => Math.abs(sample) > 0.01); // Threshold for detecting actual audio
          if (!hasAudio) {
            return; // Skip if it's just silence
          }
          
          // Convert Float32Array to ArrayBuffer
          const float32Buffer = new Float32Array(inputData);
          recordingBufferRef.current.push(float32Buffer);
          
          const currentTime = Date.now();
          const timeSinceLastChunk = currentTime - lastChunkTimeRef.current;
          
          if (timeSinceLastChunk >= chunkDuration) {
            // Concatenate all accumulated buffers
            const totalLength = recordingBufferRef.current.reduce((acc, buf) => acc + buf.length, 0);
            const concatenatedBuffer = new Float32Array(totalLength);
            
            let offset = 0;
            for (const buffer of recordingBufferRef.current) {
              concatenatedBuffer.set(buffer, offset);
              offset += buffer.length;
            }
            
            // Convert to ArrayBuffer
            const arrayBuffer = concatenatedBuffer.buffer.slice(
              concatenatedBuffer.byteOffset,
              concatenatedBuffer.byteOffset + concatenatedBuffer.byteLength
            );
            
            onAudioChunk({
              buffer: arrayBuffer,
              timestamp: currentTime
            });
            
            // Clear the recording buffer
            recordingBufferRef.current = [];
            lastChunkTimeRef.current = currentTime;
          }
        };
        
        source.connect(processor);
        processor.connect(audioContext.destination);
        
        audioContextRef.current = audioContext;
        processorRef.current = processor;
        sourceRef.current = source;
        lastChunkTimeRef.current = Date.now();
      }
    } catch (err) {
      setError(`Failed to access media devices: ${err instanceof Error ? err.message : 'Unknown error'}`);
      console.error('Error accessing media devices:', err);
    }
  }, [stream, mediaState, onAudioChunk, chunkDuration]);

  const stopStream = useCallback(() => {
    console.log('Stopping media stream...');
    
    if (stream) {
      stream.getTracks().forEach(track => {
        track.stop();
        console.log(`Stopped ${track.kind} track`);
      });
      setStream(null);
    }
    
    // Clean up audio processing
    if (processorRef.current) {
      processorRef.current.disconnect();
      processorRef.current = null;
    }
    
    if (sourceRef.current) {
      sourceRef.current.disconnect();
      sourceRef.current = null;
    }
    
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
    
    recordingBufferRef.current = [];
    console.log('Media stream stopped');
  }, [stream]);

  const toggleVideo = useCallback(() => {
    if (stream) {
      const videoTrack = stream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setMediaState(prev => ({ ...prev, video: videoTrack.enabled }));
        console.log(`Video ${videoTrack.enabled ? 'enabled' : 'disabled'}`);
      }
    }
  }, [stream]);

  const toggleAudio = useCallback(() => {
    if (stream) {
      const audioTrack = stream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setMediaState(prev => ({ ...prev, audio: audioTrack.enabled }));
        console.log(`Audio ${audioTrack.enabled ? 'enabled' : 'disabled'}`);
      }
    }
  }, [stream]);

  useEffect(() => {
    return () => {
      stopStream();
    };
  }, []); // Empty dependency to prevent re-running cleanup

  return {
    stream,
    mediaState,
    error,
    toggleVideo,
    toggleAudio,
    startStream,
    stopStream
  };
}; 