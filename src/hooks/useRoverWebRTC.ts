"use client";

import { useEffect, useRef, useState, useCallback } from "react";

interface UseRoverWebRTCOptions {
  ip: string;
  port?: number;
  streamName?: string;
}

export function useRoverWebRTC({
  ip,
  port = 8889,
  streamName = "cam",
}: UseRoverWebRTCOptions) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const pcRef = useRef<RTCPeerConnection | null>(null);
  const [isVideoLive, setIsVideoLive] = useState(false);
  const [fps, setFps] = useState<number>(30);
  const [streamError, setStreamError] = useState<string | null>(null);

  const startStream = useCallback(async () => {
    if (pcRef.current) {
      pcRef.current.close();
      pcRef.current = null;
    }

    setStreamError(null);
    try {
      const pc = new RTCPeerConnection({
        iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
      });
      pcRef.current = pc;

      pc.addTransceiver("video", { direction: "recvonly" });

      pc.ontrack = (event) => {
        if (videoRef.current && event.streams[0]) {
          videoRef.current.srcObject = event.streams[0];
          setIsVideoLive(true);
        }
      };

      pc.onconnectionstatechange = () => {
        if (
          pc.connectionState === "disconnected" ||
          pc.connectionState === "failed" ||
          pc.connectionState === "closed"
        ) {
          setIsVideoLive(false);
        }
      };

      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);

      const whepUrl = `http://${ip}:${port}/${streamName}/whep`;
      const response = await fetch(whepUrl, {
        method: "POST",
        headers: { "Content-Type": "application/sdp" },
        body: offer.sdp,
      });

      if (response.ok) {
        const answer = await response.text();
        await pc.setRemoteDescription(
          new RTCSessionDescription({ type: "answer", sdp: answer })
        );
      } else {
        setStreamError("Camera stream unavailable. Please check rover connection.");
        setIsVideoLive(false);
      }
    } catch {
      setStreamError("Could not connect to camera.");
      setIsVideoLive(false);
    }
  }, [ip, port, streamName]);

  useEffect(() => {
    startStream();
    return () => {
      if (pcRef.current) {
        pcRef.current.close();
        pcRef.current = null;
      }
    };
  }, [startStream]);

  return {
    videoRef,
    isVideoLive,
    streamError,
    fps,
    reloadStream: startStream,
  };
}
