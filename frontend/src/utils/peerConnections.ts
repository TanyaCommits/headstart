type SignalType = 'offer' | 'answer' | 'ice-candidate';

interface SignalMessage {
  type: SignalType;
  sender: string;
  target?: string;
  sdp?: RTCSessionDescriptionInit;
  candidate?: RTCIceCandidateInit;
}

type OnTrackCallback = (userId: string, stream: MediaStream) => void;

const peerConnections: Map<string, RTCPeerConnection> = new Map();

const config: RTCConfiguration = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' }
  ]
};

export function createPeerConnection(
  userId: string,
  localStream: MediaStream,
  sendSignal: (msg: SignalMessage) => void,
  onTrack: OnTrackCallback
): RTCPeerConnection {
  const pc = new RTCPeerConnection(config);

  // Add local tracks to the connection
  localStream.getTracks().forEach(track => {
    pc.addTrack(track, localStream);
  });

  // When receiving a remote track
  pc.ontrack = (event) => {
    const remoteStream = event.streams[0];
    onTrack(userId, remoteStream);
  };

  // When ICE candidate is found, send it
  pc.onicecandidate = (event) => {
    if (event.candidate) {
      sendSignal({
        type: 'ice-candidate',
        target: userId,
        candidate: event.candidate.toJSON(),
        sender: 'local-user'
      });
    }
  };

  peerConnections.set(userId, pc);
  return pc;
}

export function getPeerConnection(userId: string): RTCPeerConnection | undefined {
  return peerConnections.get(userId);
}

export async function handleSignal(
  message: SignalMessage,
  localStream: MediaStream,
  sendSignal: (msg: SignalMessage) => void,
  onTrack: OnTrackCallback
) {
  const { type, sender, sdp, candidate } = message;

  if (!sender) return;

  let pc = getPeerConnection(sender);
  if (!pc) {
    pc = createPeerConnection(sender, localStream, sendSignal, onTrack);
  }

  switch (type) {
    case 'offer':
        if (!candidate) {
            console.warn('Missing ICE candidate in message');
            return;
        }
        await pc.addIceCandidate(new RTCIceCandidate(candidate));
          
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);
      sendSignal({
        type: 'answer',
        target: sender,
        sender: 'local-user',
        sdp: pc.localDescription!
      });
      break;

    case 'answer':
        if (!sdp) {
            console.warn('Missing SDP in signal message');
            return;
          }
          
          await pc.setRemoteDescription(new RTCSessionDescription(sdp));
          break;          

    case 'ice-candidate':
      if (candidate) {
        await pc.addIceCandidate(new RTCIceCandidate(candidate));
      }
      break;

    default:
      console.warn('Unknown signal type:', type);
  }
}

export function closeAllPeerConnections() {
  peerConnections.forEach((pc, id) => {
    pc.close();
  });
  peerConnections.clear();
}
export function removePeerConnection(userId: string) {
    const pc = peerConnections.get(userId);
    if (pc) {
      pc.close();
      peerConnections.delete(userId);
    }
  }
  
