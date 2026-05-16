// URL route mapping for SPA navigation
const router = {
  "/": () => showContent("content-home"),

  "/profile": () =>
    requireAuth(
      () => showContent("content-profile"),
      "/profile"
    ),

  "/login": () => login(),

  "/logout": () => logout(),

  "/settings": () =>
    requireAuth(
      () => showContent("content-settings"),
      "/settings"
    )
};

/**
 * Executes a callback for each matched DOM element
 * @param {string} selector - CSS selector
 * @param {Function} fn - Callback function
 */
const eachElement = (selector, fn) => {
  document.querySelectorAll(selector).forEach(fn);
};

/**
 * Safely retrieves a DOM element by ID
 * @param {string} id - Element ID
 * @returns {HTMLElement|null}
 */
const getElement = (id) => document.getElementById(id);

/**
 * Displays content based on the provided route URL
 * @param {string} url - Route path
 * @returns {boolean}
 */
const showContentFromUrl = (url) => {
  const routeHandler = router[url];

  if (!routeHandler) {
    console.warn(`No route found for: ${url}`);
    return false;
  }

  routeHandler();
  return true;
};

/**
 * Checks whether the provided element is an SPA route link
 * @param {HTMLElement} element
 * @returns {boolean}
 */
const isRouteLink = (element) =>
  element?.tagName === "A" &&
  element.classList.contains("route-link");

/**
 * Hides all pages and displays the requested page
 * @param {string} id - Content panel ID
 */
const showContent = (id) => {
  eachElement(".page", (page) => {
    page.classList.add("hidden");
  });

  const targetPage = getElement(id);

  if (!targetPage) {
    console.error(`Content panel not found: ${id}`);
    return;
  }

  targetPage.classList.remove("hidden");

  window.scrollTo({
    top: 0,
    behavior: "smooth"
  });
};

/**
 * Updates authentication-driven UI elements
 */
const updateUI = async () => {
  try {
    const isAuthenticated = await auth0.isAuthenticated();

    document.body.classList.toggle(
      "authenticated",
      isAuthenticated
    );

    if (!isAuthenticated) {
      eachElement(".auth-invisible", (el) =>
        el.classList.remove("hidden")
      );

      eachElement(".auth-visible", (el) =>
        el.classList.add("hidden")
      );

      console.log("User is not authenticated");
      return;
    }

    const user = await auth0.getUser();

    if (!user) {
      console.warn("Authenticated user data unavailable");
      return;
    }

    const profileDataElement = getElement("profile-data");

    if (profileDataElement) {
      profileDataElement.innerText = JSON.stringify(
        user,
        null,
        2
      );
    }

    document.querySelectorAll("pre code").forEach((block) => {
      hljs.highlightBlock(block);
    });

    eachElement(".profile-image", (el) => {
      el.src = user.picture || "";
      el.alt = `${user.name || "User"} profile image`;
    });

    eachElement(".user-name", (el) => {
      el.innerText = user.name || "Unknown User";
    });

    eachElement(".user-email", (el) => {
      el.innerText = user.email || "No email available";
    });

    eachElement(".auth-invisible", (el) =>
      el.classList.add("hidden")
    );

    eachElement(".auth-visible", (el) =>
      el.classList.remove("hidden")
    );

    console.log("Authenticated UI rendered successfully");
  } catch (error) {
    console.error("Error updating UI:", error);

    eachElement(".auth-visible", (el) =>
      el.classList.add("hidden")
    );

    eachElement(".auth-invisible", (el) =>
      el.classList.remove("hidden")
    );
  }
};

/**
 * Browser navigation handler
 */
window.onpopstate = (event) => {
  const route = event?.state?.url;

  if (!route) {
    return;
  }

  showContentFromUrl(route);
};

/**
 * Handles SPA navigation clicks
 */
document.addEventListener("click", (event) => {
  const target = event.target.closest("a");

  if (!isRouteLink(target)) {
    return;
  }

  event.preventDefault();

  const url = target.getAttribute("href");

  history.pushState({ url }, "", url);

  showContentFromUrl(url);
});
