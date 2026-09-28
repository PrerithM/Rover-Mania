"use client";

import { useEffect, useRef, useState, useCallback } from "react";

export type ConnectionStatus = "Disconnected" | "Connecting" | "Connected";

interface UseRoverWebSocketOptions {
  ip: string;
  port?: number;
  autoConnect?: boolean;
}

export function useRoverWebSocket({
  ip,
  port = 8765,
  autoConnect = true,
}: UseRoverWebSocketOptions) {
  const ws = useRef<WebSocket | null>(null);
  const [status, setStatus] = useState<ConnectionStatus>("Disconnected");
  const [activeDirection, setActiveDirection] = useState<string | null>(null);
  const [speedMultiplier, setSpeedMultiplier] = useState<number>(1.0);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const sendCommand = useCallback(
    (left: number, right: number) => {
      if (ws.current?.readyState === WebSocket.OPEN) {
        const scaledL = Number((left * speedMultiplier).toFixed(2));
        const scaledR = Number((right * speedMultiplier).toFixed(2));
        ws.current.send(JSON.stringify({ L: scaledL, R: scaledR }));
      }
    },
    [speedMultiplier]
  );

  const connect = useCallback(() => {
    if (ws.current && (ws.current.readyState === WebSocket.OPEN || ws.current.readyState === WebSocket.CONNECTING)) {
      return;
    }

    setStatus("Connecting");
    try {
      const socket = new WebSocket(`ws://${ip}:${port}`);
      ws.current = socket;

      socket.onopen = () => {
        setStatus("Connected");
      };

      socket.onclose = () => {
        setStatus("Disconnected");
        ws.current = null;
        if (autoConnect) {
          reconnectTimeoutRef.current = setTimeout(() => {
            connect();
          }, 3000);
        }
      };

      socket.onerror = () => {
        setStatus("Disconnected");
        socket.close();
      };
    } catch (e) {
      setStatus("Disconnected");
    }
  }, [ip, port, autoConnect]);

  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }
    if (ws.current) {
      ws.current.close();
      ws.current = null;
    }
    setStatus("Disconnected");
  }, []);

  useEffect(() => {
    connect();
    return () => {
      disconnect();
    };
  }, [connect, disconnect]);

  // Keyboard controls listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.repeat ||
        document.activeElement?.tagName === "INPUT" ||
        document.activeElement?.tagName === "TEXTAREA"
      )
        return;

      const key = e.key.toLowerCase();
      if (key === "w" || e.key === "ArrowUp") {
        setActiveDirection("up");
        sendCommand(1.0, 1.0);
      } else if (key === "s" || e.key === "ArrowDown") {
        setActiveDirection("down");
        sendCommand(-1.0, -1.0);
      } else if (key === "a" || e.key === "ArrowLeft") {
        setActiveDirection("left");
        sendCommand(-1.0, 1.0);
      } else if (key === "d" || e.key === "ArrowRight") {
        setActiveDirection("right");
        sendCommand(1.0, -1.0);
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (
        document.activeElement?.tagName === "INPUT" ||
        document.activeElement?.tagName === "TEXTAREA"
      )
        return;

      const key = e.key.toLowerCase();
      if (
        ["w", "s", "a", "d"].includes(key) ||
        ["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(e.key)
      ) {
        setActiveDirection(null);
        sendCommand(0.0, 0.0);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [sendCommand]);

  return {
    status,
    activeDirection,
    setActiveDirection,
    sendCommand,
    speedMultiplier,
    setSpeedMultiplier,
    reconnect: connect,
  };
}
