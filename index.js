import {
  appendCarousel,
  clear,
  createCarouselItem,
  start,
} from "./Carousel.js";

// import axios from "axios";

// The breed selection input element.
const breedSelect = document.getElementById("breedSelect");
// The information section div element.
const infoDump = document.getElementById("infoDump");
// The progress bar div element.
const progressBar = document.getElementById("progressBar");
// The get favourites button element.
const getFavouritesBtn = document.getElementById("getFavouritesBtn");

// Step 0: Store your API key here for reference and easy access.
const API_KEY =
  "live_oYy2dWvJzmU1YEKnTOcf707nAjtTTrqmWZNMdcTmbFZDH1CMBDOsdhVYbxMsXcsX";

axios.defaults.baseURL = "https://api.thecatapi.com/v1";
axios.defaults.headers.common["x-api-key"] = API_KEY;
axios.defaults.onDownloadProgress = function (progressEvent) {
  updateProgress(progressEvent);
};
axios.interceptors.request.use((request) => {
  request.metadata = request.metadata || {};
  request.metadata.start_time = new Date();
  progressBar.style.width = "0%";
  console.log(
    `Request started at: ${request.metadata.start_time.toLocaleTimeString(
      "en-US"
    )}`
  );
  document.body.style.cursor = "progress";
  return request;
});

axios.interceptors.response.use(function onFullfilled(response) {
  document.body.style.cursor = "default";
  progressBar.style.width = "100%";
  // Calculate how long the request took
  const timeElapsed =
    new Date().getTime() - response.config.metadata.start_time.getTime();
  console.log(`Request took ${timeElapsed} ms.`);
  return response;
});

/**
 * 1. Create an async function "initialLoad" that does the following:
 * - Retrieve a list of breeds from the cat API using fetch().
 * - Create new <options> for each of these breeds, and append them to breedSelect.
 *  - Each option should have a value attribute equal to the id of the breed.
 *  - Each option should display text equal to the name of the breed.
 * This function should execute immediately.
 */

// initialLoad()
const { data: breeds } = await axios.get("/breeds");
const frag = document.createDocumentFragment();
breeds.forEach((b) =>
  frag.appendChild(
    Object.assign(document.createElement("option"), {
      value: b.id,
      textContent: b.name,
    })
  )
);
breedSelect.appendChild(frag);

/**
 * 2. Create an event handler for breedSelect that does the following:
 * - Retrieve information on the selected breed from the cat API using fetch().
 *  - Make sure your request is receiving multiple array items!
 *  - Check the API documentation if you're only getting a single object.
 * - For each object in the response array, create a new element for the carousel.
 *  - Append each of these new elements to the carousel.
 * - Use the other data you have been given to create an informational section within the infoDump element.
 *  - Be creative with how you create DOM elements and HTML.
 *  - Feel free to edit index.html and styles.css to suit your needs, but be careful!
 *  - Remember that functionality comes first, but user experience and design are important.
 * - Each new selection should clear, re-populate, and restart the Carousel.
 * - Add a call to this function to the end of your initialLoad function above to create the initial carousel.
 */

function createCarousel(data, type) {
  clear();
  clearInfo();
  if (!Array.isArray(data) || data.length === 0) {
    infoDump.appendChild(
      Object.assign(document.createElement("h1"), {
        textContent:
          type === "favourites"
            ? "No favourites yet."
            : "No images found for this breed.",
      })
    );
    return;
  }
  if (type === "breed") {
    data.forEach((r) =>
      appendCarousel(
        createCarouselItem(
          r.url,
          `Picture of ${r.breeds?.[0]?.name ?? "Cat"}`,
          r.id
        )
      )
    );
  } else if (type === "favourites") {
    data.forEach((r) =>
      appendCarousel(
        createCarouselItem(r.image.url, "Favourite Cat Picture", r.image_id)
      )
    );
    infoDump.appendChild(
      Object.assign(document.createElement("h1"), {
        textContent: "Viewing Favourite Cat Pics!",
      })
    );
  }
  start();
}

// Add event listener to breedSelect
breedSelect.addEventListener("change", (e) => {
  if (e.target === e.currentTarget) {
    updateCarousel(e.target.value);
  }
});

// Removes infoDump's children
function clearInfo() {
  while (infoDump.firstElementChild) {
    infoDump.removeChild(infoDump.firstElementChild);
  }
}

// Update the carousel based on the id of the selector
async function updateCarousel(id) {
  try {
    const { data: imgs } = await axios.get("/images/search", {
      params: { breed_ids: id, limit: 10, include_breeds: 1 },
      onDownloadProgress: updateProgress,
    });
    createCarousel(imgs, "breed");
    const info = imgs[0]?.breeds?.[0] || {};
    showInfo(info);
  } catch (e) {
    console.error(e);
  }

  function showInfo(breedInfo) {
    clearInfo();
    const frag = new DocumentFragment();
    // h1 with cat's name
    frag.appendChild(
      Object.assign(document.createElement("h1"), {
        id: "info-header",
        textContent: `Information on the ${breedInfo.name}`,
      })
    );

    // p element with cat's origin
    frag.appendChild(
      Object.assign(document.createElement("p"), {
        id: "cat-origin",
        innerHTML: `<strong>Origin:</strong> ${breedInfo.origin}`,
      })
    );

    // p element with cat's weight (pounds)
    frag.appendChild(
      Object.assign(document.createElement("p"), {
        id: "cat-weight",
        innerHTML: `<strong>Weight:</strong> ${breedInfo.weight.imperial} lbs`,
      })
    );

    // p element with cat's life span (years)
    frag.appendChild(
      Object.assign(document.createElement("p"), {
        id: "cat-desc",
        innerHTML: `<strong>Life Span:</strong> ${breedInfo.life_span} years`,
      })
    );

    // p element with cat's temperament (listed as traits here)
    frag.appendChild(
      Object.assign(document.createElement("p"), {
        id: "cat-traits",
        innerHTML: `<strong>Traits:</strong> ${breedInfo.temperament}`,
      })
    );

    // p element with cat description
    frag.appendChild(
      Object.assign(document.createElement("p"), {
        id: "cat-desc",
        textContent: breedInfo.description,
      })
    );

    // p element with link to more info (wikipedia link)
    frag.appendChild(
      Object.assign(document.createElement("p"), {
        id: "wikipedia",
        innerHTML: `Click <a id="link" href=${breedInfo.wikipedia_url} target="_blank">here</a> to learn more about the ${breedInfo.name} cat.`,
      })
    );

    // Append frag to infoDump
    infoDump.appendChild(frag);
  }
}

/**
 * 3. Fork your own sandbox, creating a new one named "JavaScript Axios Lab."
 */
/**
 * 4. Change all of your fetch() functions to axios!
 * - axios has already been imported for you within index.js.
 * - If you've done everything correctly up to this point, this should be simple.
 * - If it is not simple, take a moment to re-evaluate your original code.
 * - Hint: Axios has the ability to set default headers. Use this to your advantage
 *   by setting a default header with your API key so that you do not have to
 *   send it manually with all of your requests! You can also set a default base URL!
 */
/**
 * 5. Add axios interceptors to log the time between request and response to the console.
 * - Hint: you already have access to code that does this!
 * - Add a console.log statement to indicate when requests begin.
 * - As an added challenge, try to do this on your own without referencing the lesson material.
 */

/**
 * 6. Next, we'll create a progress bar to indicate the request is in progress.
 * - The progressBar element has already been created for you.
 *  - You need only to modify its "width" style property to align with the request progress.
 * - In your request interceptor, set the width of the progressBar element to 0%.
 *  - This is to reset the progress with each request.
 * - Research the axios onDownloadProgress config option.
 * - Create a function "updateProgress" that receives a ProgressEvent object.
 *  - Pass this function to the axios onDownloadProgress config option in your event handler.
 * - console.log your ProgressEvent object within updateProgess, and familiarize yourself with its structure.
 *  - Update the progress of the request using the properties you are given.
 * - Note that we are not downloading a lot of data, so onDownloadProgress will likely only fire
 *   once or twice per request to this API. This is still a concept worth familiarizing yourself
 *   with for future projects.
 */

async function updateProgress(progress_event) {
  console.log("ProgressEvent obj:\n", progress_event);
}

/**
 * 7. As a final element of progress indication, add the following to your axios interceptors:
 * - In your request interceptor, set the body element's cursor style to "progress."
 * - In your response interceptor, remove the progress cursor style from the body element.
 */
/**
 * 8. To practice posting data, we'll create a system to "favourite" certain images.
 * - The skeleton of this function has already been created for you.
 * - This function is used within Carousel.js to add the event listener as items are created.
 *  - This is why we use the export keyword for this function.
 * - Post to the cat API's favourites endpoint with the given ID.
 * - The API documentation gives examples of this functionality using fetch(); use Axios!
 * - Add additional logic to this function such that if the image is already favourited,
 *   you delete that favourite using the API, giving this function "toggle" functionality.
 * - You can call this function by clicking on the heart at the top right of any image.
 */

export async function favourite(imgId) {
  const { data: favs } = await axios.get("/favourites");
  const existing = favs.find((f) => f.image_id === imgId);
  if (existing) {
    await axios.delete(`/favourites/${existing.id}`);
  } else {
    await axios.post("/favourites", { image_id: imgId /*, sub_id: "tobi" */ });
  }
}

/**
 * 9. Test your favourite() function by creating a getFavourites() function.
 * - Use Axios to get all of your favourites from the cat API.
 * - Clear the carousel and display your favourites when the button is clicked.
 *  - You will have to bind this event listener to getFavouritesBtn yourself.
 *  - Hint: you already have all of the logic built for building a carousel.
 *    If that isn't in its own function, maybe it should be so you don't have to
 *    repeat yourself in this section.
 */

getFavouritesBtn.addEventListener("click", async () => {
  const { data } = await axios.get("/favourites", {
    onDownloadProgress: updateProgress,
  });
  createCarousel(data, "favourites");
});

async function getFavResults() {
  const getFavResponse = await axios.get("/favourites");
  return getFavResponse;
}

async function getFavourites(e) {
  if (e.target === e.currentTarget) {
    const results = await getFavResults();
    clearInfo();
    createCarousel(results.data, "favourites");
  }
}

/**
 * 10. Test your site, thoroughly!
 * - What happens when you try to load the Malayan breed?
 *  - If this is working, good job! If not, look for the reason why and fix it!
 * - Test other breeds as well. Not every breed has the same data available, so
 *   your code should account for this.
 */
