declare namespace google.accounts.oauth2 {
  type TokenResponse = {
    access_token?: string;
    expires_in?: number;
    error?: string;
  };

  type TokenClientConfig = {
    client_id: string;
    scope: string;
    callback: (response: TokenResponse) => void;
  };

  type OverridableTokenClientConfig = {
    prompt?: '' | 'consent' | 'select_account';
  };

  type TokenClient = {
    callback: (response: TokenResponse) => void;
    requestAccessToken: (overrideConfig?: OverridableTokenClientConfig) => void;
  };

  function initTokenClient(config: TokenClientConfig): TokenClient;
  function revoke(token: string, done: () => void): void;
}

declare interface Window {
  google: {
    accounts: {
      oauth2: typeof google.accounts.oauth2;
    };
  };
}
