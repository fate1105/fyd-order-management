import { useEffect, useState, useCallback, useRef } from 'react';
import SockJS from 'sockjs-client';
import Stomp from 'stompjs';
import { BASE_URL } from '../utils/api';

/**
 * Custom hook for WebSocket connections using STOMP and SockJS
 * @param {string} topic - The topic to subscribe to (e.g., '/topic/notifications')
 * @param {function} onMessageReceived - Callback when a message is received
 * @returns {object} - { connected, sendMessage }
 */
export const useWebSocket = (topic, onMessageReceived) => {
    const [connected, setConnected] = useState(false);
    const stompClientRef = useRef(null);
    const callbackRef = useRef(onMessageReceived);

    // Update callback ref so we don't need to re-subscribe when callback changes
    useEffect(() => {
        callbackRef.current = onMessageReceived;
    }, [onMessageReceived]);

    useEffect(() => {
        if (!topic) return;

        console.log('Initializing WebSocket connection to:', `${BASE_URL}/ws-notifications`);
        const socket = new SockJS(`${BASE_URL}/ws-notifications`);
        const client = Stomp.over(socket);

        // Disable debug logging in production if needed
        // client.debug = () => {};

        client.connect({}, (frame) => {
            console.log('Connected to WebSocket:', frame);
            setConnected(true);

            client.subscribe(topic, (message) => {
                if (message.body) {
                    try {
                        const data = JSON.parse(message.body);
                        if (callbackRef.current) {
                            callbackRef.current(data);
                        }
                    } catch (e) {
                        console.error('Error parsing WebSocket message:', e);
                    }
                }
            });
        }, (error) => {
            console.error('WebSocket connection error:', error);
            setConnected(false);

            // Attempt to reconnect after 5 seconds
            setTimeout(() => {
                setConnected(false); // Trigger re-effect if needed, though this effect will cleanup and re-run if dependencies change
            }, 5000);
        });

        stompClientRef.current = client;

        return () => {
            if (stompClientRef.current && stompClientRef.current.connected) {
                console.log('Disconnecting WebSocket');
                stompClientRef.current.disconnect();
            }
        };
    }, [topic]);

    const sendMessage = useCallback((destination, body) => {
        if (stompClientRef.current && stompClientRef.current.connected) {
            stompClientRef.current.send(destination, {}, JSON.stringify(body));
        } else {
            console.warn('Cannot send message: WebSocket not connected');
        }
    }, []);

    return { connected, sendMessage };
};
