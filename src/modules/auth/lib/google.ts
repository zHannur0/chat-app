declare global {
  interface Window {
    google?: any;
  }
}

export async function loadGoogleScript(): Promise<void> {
  if (typeof window === "undefined") return;
  if (window.google?.accounts?.id) return;
  await new Promise<void>((resolve, reject) => {
    const s = document.createElement("script");
    s.src = "https://accounts.google.com/gsi/client";
    s.async = true;
    s.defer = true;
    s.onload = () => {
      try {
        console.log("[auth] GIS loaded");
      } catch {
        // Ignore errors in onload
      }
      resolve();
    };
    s.onerror = () =>
      reject(new Error("Failed to load Google Identity Services"));
    document.head.appendChild(s);
  });
}

export async function getGoogleIdTokenViaPopup(): Promise<string> {
  await loadGoogleScript();
  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
  if (!clientId) throw new Error("Missing NEXT_PUBLIC_GOOGLE_CLIENT_ID");

  return new Promise<string>((resolve, reject) => {
    try {
      const client = window.google.accounts.oauth2.initTokenClient({
        client_id: clientId,
        scope: "openid email profile",
        callback: (resp: any) => {
          if (resp?.access_token) {
            reject(
              new Error(
                "Received access token; expected id_token. Use getGoogleIdTokenOneTap instead."
              )
            );
          } else if (resp?.error) {
            reject(new Error(resp.error));
          }
        },
      });
      client.requestAccessToken();
    } catch (e) {
      reject(e as Error);
    }
  });
}

export async function getGoogleIdTokenOneTap(): Promise<string> {
  await loadGoogleScript();
  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
  if (!clientId) throw new Error("Missing NEXT_PUBLIC_GOOGLE_CLIENT_ID");

  return new Promise<string>((resolve, reject) => {
    try {
      let settled = false;
      const finish = (token?: string, err?: Error) => {
        if (settled) return;
        settled = true;
        if (token) resolve(token);
        else reject(err || new Error("Google One Tap failed"));
      };

      const onCredential = (credentialResponse: any) => {
        if (credentialResponse?.credential) {
          finish(credentialResponse.credential as string);
        }
      };

      // Initialize with FedCM
      window.google.accounts.id.initialize({
        client_id: clientId,
        callback: onCredential,
        use_fedcm_for_prompt: true,
        auto_select: false,
        cancel_on_tap_outside: false,
      });

      const prompt = (label: string) => {
        try {
          window.google!.accounts.id.prompt(
            (notification: any) => {
              try {
                console.log(
                  "[auth] one-tap moment",
                  label,
                  notification.getMomentType?.(),
                  notification.getDismissedReason?.(),
                  notification.getSkippedReason?.()
                );
              } catch {
                // Ignore errors in notification callback
              }
            },
            { use_fedcm_for_prompt: true, itp_support: true }
          );
        } catch {
          // Ignore errors in credential creation
        }
      };

      // First prompt
      prompt("initial");

      // Retry and fallback chain
      window.setTimeout(() => {
        if (settled) return;
        prompt("retry");
        window.setTimeout(() => {
          if (settled) return;
          try {
            const containerId = "__gis_hidden_btn_container__";
            let container = document.getElementById(containerId);
            if (!container) {
              container = document.createElement("div");
              container.id = containerId;
              container.style.position = "fixed";
              container.style.left = "-9999px";
              container.style.top = "-9999px";
              document.body.appendChild(container);
            }
            window.google!.accounts.id.renderButton(container, {
              type: "standard",
              theme: "outline",
              size: "large",
            });
            const btn = container.querySelector(
              'div[role="button"],button'
            ) as HTMLElement | null;
            if (btn) btn.click();
            window.setTimeout(() => {
              if (!settled)
                finish(undefined, new Error("Google One Tap timeout"));
            }, 4000);
          } catch (e) {
            finish(undefined, e as Error);
          }
        }, 1200);
      }, 1200);
    } catch (e) {
      reject(e as Error);
    }
  });
}

// Redirect fallback: saves id_token on load and navigates to target path
export async function beginGoogleRedirectSignIn(
  navigatePath: string
): Promise<void> {
  await loadGoogleScript();
  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
  if (!clientId) throw new Error("Missing NEXT_PUBLIC_GOOGLE_CLIENT_ID");
  window.google!.accounts.id.initialize({
    client_id: clientId,
    callback: (credentialResponse: any) => {
      if (credentialResponse?.credential && typeof window !== "undefined") {
        try {
          localStorage.setItem(
            "google_redirect_credential",
            credentialResponse.credential as string
          );
        } catch {
          // Ignore errors when storing credential
        }
        window.location.href = navigatePath;
      }
    },
    use_fedcm_for_prompt: true,
    ux_mode: "redirect",
    auto_select: false,
  });
  window.google!.accounts.id.prompt(undefined, {
    use_fedcm_for_prompt: true,
    itp_support: true,
  });
}

// On the redirect destination page, await the Google credential delivered by GIS
export async function awaitGoogleRedirectCredential(
  timeoutMs = 10000
): Promise<string | undefined> {
  await loadGoogleScript();
  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
  if (!clientId) return undefined;
  return new Promise<string | undefined>(resolve => {
    let settled = false;
    window.google!.accounts.id.initialize({
      client_id: clientId,
      callback: (resp: any) => {
        if (resp?.credential && !settled) {
          settled = true;
          resolve(resp.credential as string);
        }
      },
      use_fedcm_for_prompt: true,
    });
    // No prompt here; for redirect UX GIS invokes callback on load
    setTimeout(() => {
      if (!settled) resolve(undefined);
    }, timeoutMs);
  });
}
