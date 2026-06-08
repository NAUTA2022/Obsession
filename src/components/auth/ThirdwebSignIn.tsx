import { useEffect, useRef } from "react";
import { ConnectEmbed, useActiveAccount } from "thirdweb/react";
import { inAppWallet, createWallet } from "thirdweb/wallets";
import { getUserEmail } from "thirdweb/wallets/in-app";
import { ethereum } from "thirdweb/chains";
import { thirdwebClient } from "../../config/thirdweb";
import { useAuthStore } from "../../store/auth";
import { useNavigate } from "react-router-dom";
import { ROUTES } from "../../constants/routes";
import { USER_ROLES } from "../../types/auth";

const wallets = [
  inAppWallet({
    auth: {
      options: ["email", "phone", "google", "apple", "facebook", "passkey"],
    },
  }),
  createWallet("io.metamask"),
];

interface ThirdwebSignInProps {
  onError?: (error: string) => void;
}

export function ThirdwebSignIn({ onError }: ThirdwebSignInProps) {
  const account = useActiveAccount();
  const navigate = useNavigate();
  const loginWithThirdweb = useAuthStore((s) => s.loginWithThirdweb);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const hasVerified = useRef(false);

  useEffect(() => {
    if (!account || hasVerified.current || isAuthenticated) return;

    const verify = async () => {
      hasVerified.current = true;
      try {
        let email: string | undefined;
        try {
          email = await getUserEmail({ client: thirdwebClient });
        } catch {
          // email no disponible (wallets externas como MetaMask)
        }

        await loginWithThirdweb({
          thirdwebUserId: account.address,
          walletAddress: account.address,
          email,
          chainId: ethereum.id,
        });

        // Si viene de un link público (/p/:username), volver ahí sin importar el rol
        const params = new URLSearchParams(window.location.search);
        const redirectTo = params.get('redirect');
        if (redirectTo) {
          navigate(redirectTo);
          return;
        }
        // Redirigir según el rol
        const state = useAuthStore.getState();
        if (state.user?.role === USER_ROLES.CUSTOMER) {
          navigate(ROUTES.creators);
        } else {
          navigate(ROUTES.dashboard);
        }
      } catch (error) {
        hasVerified.current = false;
        const msg = error instanceof Error ? error.message : "";
        onError?.(msg || "Error al conectar wallet");
      }
    };

    verify();
  }, [account, isAuthenticated, loginWithThirdweb, navigate, onError]);

  return (
    <ConnectEmbed
      client={thirdwebClient}
      wallets={wallets}
      chain={ethereum}
      theme="dark"
      style={{
        width: "100%",
        maxWidth: "420px",
        margin: "0 auto",
      }}
    />
  );
}

export default ThirdwebSignIn;
