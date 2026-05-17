// Auth0 client instance
let auth0 = null;

/**
 * Starts the authentication flow
 * @param {string} targetUrl - Optional route to redirect after login
 */
const login = async (targetUrl = "/") => {
  try {
    console.log("[Auth] Starting login flow", { targetUrl });

    const options = {
      redirect_uri: window.location.origin
    };

    if (targetUrl) {
      options.appState = { targetUrl };
    }

    await auth0.loginWithRedirect(options);
  } catch (error) {
    console.error("[Auth] Login failed:", error);
  }
};

/**
 * Executes the logout flow
 */
const logout = async () => {
  try {
    console.log("[Auth] Logging out");

    await auth0.logout({
      returnTo: window.location.origin
    });
  } catch (error) {
    console.error("[Auth] Logout failed:", error);
  }
};

/**
 * Fetches Auth0 configuration
 * @returns {Promise<Object>}
 */
const fetchAuthConfig = async () => {
  try {
    const response = await fetch("/auth_config.json");

    if (!response.ok) {
      throw new Error(`Failed to load config: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("[Auth] Unable to fetch configuration:", error);
    throw error;
  }
};

/**
 * Initializes the Auth0 SDK client
 */
const configureClient = async () => {
  try {
    const config = await fetchAuthConfig();

    auth0 = await createAuth0Client({
      domain: config.domain,
      client_id: config.clientId,
      cacheLocation: "localstorage",
      useRefreshTokens: true
    });

    console.log("[Auth] Auth0 client initialized");
  } catch (error) {
    console.error("[Auth] Client configuration failed:", error);
  }
};

/**
 * Checks authentication before executing a function
 * @param {Function} fn
 * @param {string} targetUrl
 */
const requireAuth = async (fn, targetUrl) => {
  try {
    const isAuthenticated = await auth0.isAuthenticated();

    if (isAuthenticated) {
      return fn();
    }

    return login(targetUrl);
  } catch (error) {
    console.error("[Auth] Authentication check failed:", error);
  }
};

/**
 * Handles redirect callback after login
 */
const handleAuthRedirect = async () => {
  const query = window.location.search;

  const shouldParseResult =
    query.includes("code=") && query.includes("state=");

  if (!shouldParseResult) {
    return;
  }

  try {
    console.log("[Auth] Parsing redirect callback");

    const result = await auth0.handleRedirectCallback();

    const targetUrl =
      result?.appState?.targetUrl || window.location.pathname;

    showContentFromUrl(targetUrl);

    window.history.replaceState({}, document.title, targetUrl);

    console.log("[Auth] Login successful");
  } catch (error) {
    console.error("[Auth] Error handling redirect callback:", error);
  }
};

/**
 * Initializes client-side routing
 */
const initializeRouting = () => {
  const bodyElement = document.body;

  bodyElement.addEventListener("click", (event) => {
    const target = event.target;

    if (!isRouteLink(target)) {
      return;
    }

    const url = target.getAttribute("href");

    if (!url) {
      return;
    }

    const isValidRoute = showContentFromUrl(url);

    if (isValidRoute) {
      event.preventDefault();

      window.history.pushState({ url }, "", url);
    }
  });

  window.addEventListener("popstate", () => {
    showContentFromUrl(window.location.pathname);
  });
};

/**
 * Initializes the application
 */
const initializeApp = async () => {
  try {
    await configureClient();

    initializeRouting();

    // Default route fallback
    if (!showContentFromUrl(window.location.pathname)) {
      showContentFromUrl("/");
      window.history.replaceState({ url: "/" }, "", "/");
    }

    await handleAuthRedirect();

    const isAuthenticated = await auth0.isAuthenticated();

    if (isAuthenticated) {
      console.log("[Auth] User authenticated");
    } else {
      console.log("[Auth] User not authenticated");
    }

    updateUI();
  } catch (error) {
    console.error("[App] Initialization failed:", error);
  }
};

// Initialize app after page load
window.addEventListener("load", initializeApp);
