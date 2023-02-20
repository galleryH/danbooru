
$(() => {
  $('[data-fancybox]').fancybox({
    loop: true,
    arrows: true,
    buttons: [
      'zoom',
      'slideShow',
      'fullScreen',
      'thumbs',
      'close'
    ],
    animationEffect: 'fade',
    transitionEffect: 'slide',
    transitionDuration: 800,
    thumbs: {
      autoStart: true,
      hideOnClose: true
    },
    image: {
      fitToView: false // add this line to disable fitting the image to the viewport
    }
  });
});

const apiKey = '8iuKM7gbTomg3hcCoMNHAEfH';
const endpoint = 'https://danbooru.donmai.us/posts.json';

let page = 1; // starting page number
let isLoading = false; // flag to prevent multiple simultaneous requests

// Set the search parameters
const tags = localStorage.getItem("searchTerm"); // example search tags
console.log(tags)
const limit = 20; // number of images to retrieve per page

// Build the API request URL
const buildUrl = (pageNum) => {
  return `https://danbooru.donmai.us/posts.json?api_key=${apiKey}&login=6e616d6577617374616b656e&tags=${tags}&limit=${limit}&page=${pageNum}`;
};

// Create the IntersectionObserver
const intersectionObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    const target = entry.target;
    if (entry.isIntersecting) {
      // Load the image
      const imageUrl = target.dataset.src;
      const fileExtension = imageUrl.slice(-4);
      let mediaElement;
      if (fileExtension === '.mp4') {
        mediaElement = document.createElement('video');
        mediaElement.autoplay = true;
        mediaElement.loop = true;
        mediaElement.muted = true;
        mediaElement.controls = true; // Add controls to video element
        mediaElement.src = imageUrl; // Set the src attribute
        mediaElement.type = 'video/mp4'; // Set the MIME type
      } else {
        mediaElement = document.createElement('a'); // Wrap image with link
        mediaElement.setAttribute('data-fancybox', 'gallery');
        mediaElement.setAttribute('href', imageUrl);
        mediaElement.setAttribute('data-caption', target.dataset.tags);
        mediaElement.setAttribute('data-width', '640');
        mediaElement.setAttribute('data-height', '480');
        const img = document.createElement('img');
        img.alt = target.dataset.tags;
        img.src = imageUrl;
        mediaElement.appendChild(img);
      }
      target.appendChild(mediaElement);
      target.classList.remove('loading');
      intersectionObserver.unobserve(target);
    } else {
      // Unload the image
      target.innerHTML = '';
    }
  });
});

const loadNextPage = () => {
  if (isLoading) {
    return;
  }
  isLoading = true;

  const url = buildUrl(page);
  fetch(url)
    .then(response => response.json())
    .then(data => {
      const container = document.getElementById('container');
      // Process the image data
      data.forEach(image => {
        const imageUrl = image.file_url;
        const imageTags = image.tag_string;

        if (!imageUrl) {
          console.warn(`Skipping image with ID ${image.id} because file_url is undefined`);
          return;
        }
        if (imageUrl.endsWith('.zip')) {
          console.warn(`Skipping image with ID ${image.id} because it has a .zip extension`);
          return;
        }

        // Create a container element for the image
        const imageContainer = document.createElement('div');
        imageContainer.classList.add('image-container');
        imageContainer.dataset.src = imageUrl;
        imageContainer.dataset.tags = imageTags;
        imageContainer.classList.add('loading');

        // Add the container element to the page
        container.appendChild(imageContainer);

        // Observe the container element
        intersectionObserver.observe(imageContainer);
      });

      isLoading = false;
      page += 1;
    })
    .catch(error => {
      isLoading = false;
      console.error(error);
    });
};

loadNextPage(); // load the first page

window.addEventListener('scroll', () => {
  const bottomOfWindow = document.documentElement.scrollTop + window.innerHeight === document.documentElement.offsetHeight;
  if (bottomOfWindow) {
    loadNextPage();
  }
});