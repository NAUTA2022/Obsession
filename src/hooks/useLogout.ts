import { useCallback } from 'react';
import { useActiveWallet, useDisconnect } from 'thirdweb/react';
import { useAuthStore } from '../store/auth';
import { ROUTES } from '../constants/routes';

function clearThirdwebStorage() {
  try {
    const keysToRemove: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (!key) continue;
      if (
        key.startsWith('thirdweb:') ||
        key.startsWith('__TW__') ||
        key.toLowerCase().includes('thirdweb')
      ) {
        keysToRemove.push(key);
      }
    }
    keysToRemove.forEach((k) => localStorage.removeItem(k));

    if (typeof indexedDB !== 'undefined' && (indexedDB as any).databases) {
      (indexedDB as any).databases().then((dbs: { name?: string }[]) => {
        dbs.forEach((db) => {
          if (db.name && db.name.toLowerCase().includes('thirdweb')) {
            indexedDB.deleteDatabase(db.name);
          }
        });
      }).catch(() => {});
    }
  } catch (err) {
    console.error('[logout] error limpiando storage de Thirdweb:', err);
  }
}

/**
 * Logout completo: limpia el backend/store, desconecta la wallet de Thirdweb,
 * borra la sesión persistida y recarga para evitar auto-reconexión.
 */
export function useLogout() {
  const storeLogout = useAuthStore((s) => s.logout);
  const wallet = useActiveWallet();
  const { disconnect } = useDisconnect();

  return useCallback(async () => {
    try {
      await storeLogout();
    } finally {
      if (wallet) {
        try {
          await disconnect(wallet);
        } catch (err) {
          console.error('[logout] error desconectando wallet:', err);
        }
      }
      clearThirdwebStorage();
      // Hard reload para descartar cualquier estado en memoria de Thirdweb
      window.location.replace(ROUTES.login);
    }
  }, [storeLogout, wallet, disconnect]);
}
