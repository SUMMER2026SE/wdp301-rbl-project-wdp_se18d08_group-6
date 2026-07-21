"use client";

import { useEffect, useRef } from "react";

type GoogleSignInButtonProps = {
  clientId: string;
  disabled?: boolean;
  onCredential: (credential: string) => void | Promise<void>;
  className?: string;
};

type GoogleCredentialResponse = {
  credential?: string;
};

type GoogleAccountsId = {
  initialize: (config: {
    client_id: string;
    callback: (response: GoogleCredentialResponse) => void;
  }) => void;
  renderButton: (
    parent: HTMLElement,
    options: {
      theme?: "outline" | "filled_blue" | "filled_black";
      size?: "large" | "medium" | "small";
      width?: string | number;
      text?: "signin_with" | "signup_with" | "continue_with";
      shape?: "rectangular" | "pill" | "circle" | "square";
      logo_alignment?: "left" | "center";
    },
  ) => void;
  cancel?: () => void;
};

type GoogleWindow = Window & {
  google?: {
    accounts?: {
      id?: GoogleAccountsId;
    };
  };
};

let googleScriptPromise: Promise<void> | null = null;

function loadGoogleScript() {
  if (typeof window === "undefined") {
    return Promise.resolve();
  }

  if ((window as GoogleWindow).google?.accounts?.id) {
    return Promise.resolve();
  }

  if (!googleScriptPromise) {
    googleScriptPromise = new Promise<void>((resolve, reject) => {
      const existingScript = document.querySelector<HTMLScriptElement>('script[src="https://accounts.google.com/gsi/client"]');

      if (existingScript) {
        existingScript.addEventListener("load", () => resolve(), { once: true });
        existingScript.addEventListener("error", () => reject(new Error("Failed to load Google script")), { once: true });
        return;
      }

      const script = document.createElement("script");
      script.src = "https://accounts.google.com/gsi/client";
      script.async = true;
      script.defer = true;
      script.onload = () => resolve();
      script.onerror = () => reject(new Error("Failed to load Google script"));
      document.head.appendChild(script);
    });
  }

  return googleScriptPromise;
}

export function GoogleSignInButton({ clientId, disabled = false, onCredential, className }: GoogleSignInButtonProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    let isActive = true;

    async function setupButton() {
      if (!clientId || !containerRef.current) {
        return;
      }

      try {
        await loadGoogleScript();
        const googleAccounts = (window as GoogleWindow).google?.accounts?.id;

        if (!isActive || !googleAccounts || !containerRef.current) {
          return;
        }

        containerRef.current.innerHTML = "";
        googleAccounts.initialize({
          client_id: clientId,
          callback: (response) => {
            if (response.credential) {
              void onCredential(response.credential);
            }
          },
        });
        googleAccounts.renderButton(containerRef.current, {
          theme: "outline",
          size: "large",
          width: "100%",
          text: "signin_with",
          shape: "rectangular",
          logo_alignment: "left",
        });
      } catch {
        if (containerRef.current) {
          containerRef.current.innerHTML = "";
        }
      }
    }

    void setupButton();

    return () => {
      isActive = false;
      const googleAccounts = (window as GoogleWindow).google?.accounts?.id;
      googleAccounts?.cancel?.();
    };
  }, [clientId, onCredential]);

  return (
    <div className={`${disabled ? "pointer-events-none opacity-60" : ""} ${className ?? ""}`.trim()}>
      <div ref={containerRef} className="min-h-[44px] w-full" aria-busy={disabled ? "true" : "false"} />
    </div>
  );
}
