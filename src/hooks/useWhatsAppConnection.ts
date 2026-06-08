import { useState, useCallback } from 'react';

export interface WhatsAppConnection {
  isConnected: boolean;
  connectionStatus: 'disconnected' | 'connecting' | 'connected' | 'error';
  errorMessage?: string;
}

export const useWhatsAppConnection = () => {
  const [connection, setConnection] = useState<WhatsAppConnection>({
    isConnected: false,
    connectionStatus: 'disconnected'
  });

  const connect = useCallback(async () => {
    setConnection(prev => ({ ...prev, connectionStatus: 'connecting' }));
    
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setConnection({
        isConnected: true,
        connectionStatus: 'connected'
      });
    } catch (error) {
      setConnection({
        isConnected: false,
        connectionStatus: 'error',
        errorMessage: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }, []);

  const disconnect = useCallback(() => {
    setConnection({
      isConnected: false,
      connectionStatus: 'disconnected'
    });
  }, []);

  const sendMessage = useCallback(async (message: string, phoneNumber: string) => {
    if (!connection.isConnected) {
      throw new Error('No connection with WhatsApp');
    }

    try {
      console.log(`Sending message: "${message}" to ${phoneNumber}`);
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      return { success: true, messageId: Date.now().toString() };
    } catch (error) {
      throw new Error('Error sending message');
    }
  }, [connection.isConnected]);

  return {
    ...connection,
    connect,
    disconnect,
    sendMessage
  };
};
