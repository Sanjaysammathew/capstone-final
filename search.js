const accesskey = "XhSd737h0gKjAx8fTcjqr30pbueZGQSyjvS5opN8_5M";
const searchForm = document.getElementById("Search-form");
const searchBox = document.getElementById("Search-box");
const searchResult = document.getElementById("Search-result");
const showMoreBtn = document.getElementById("show-more-btn");

const customizationPanel = document.getElementById("customization-panel");
const customText = document.getElementById("custom-text");
const fontSelect = document.getElementById("font-select");
const colorPicker = document.getElementById("color-picker");
const fontSize = document.getElementById("font-size");
const applyCustomizationBtn = document.getElementById("apply-customization");
const canvas = document.getElementById("canvas");
const saveImageBtn = document.getElementById("save-image");
const gallery = document.getElementById("gallery");

const filtersPanel = document.getElementById("filters");
const advancedEditingPanel = document.getElementById("advanced-editing");
const collageMakerPanel = document.getElementById("collage-maker");
const collageContainer = document.getElementById("collage");
const createCollageBtn = document.getElementById("create-collage");

let keyword = "";
let page = 1;
let selectedImage = null;
let collageImages = [];

async function searchImages() {
    keyword = searchBox.value;
    const url = `https://api.unsplash.com/search/photos?page=${page}&query=${keyword}&client_id=${accesskey}`;
    const response = await fetch(url);
    const data = await response.json();
    displayImages(data.results);
    if (data.total_pages > page) {
        showMoreBtn.style.display = "block";
    } else {
        showMoreBtn.style.display = "none";
    }
}

function displayImages(images) {
    if (page === 1) {
        searchResult.innerHTML = "";
    }

    images.forEach(image => {
        const imgElement = document.createElement("img");
        imgElement.src = image.urls.small;
        imgElement.alt = "Search result image";
        imgElement.addEventListener("click", () => selectImage(image.urls.full));
        searchResult.appendChild(imgElement);
    });
}

function selectImage(url) {
    selectedImage = url;
    
    // Show the canvas and other panels
    canvas.classList.remove("hidden");
    canvas.style.display = "block"; // Ensure the canvas is visible

    customizationPanel.classList.remove("hidden");
    saveImageBtn.classList.remove("hidden");
    filtersPanel.classList.remove("hidden");
    advancedEditingPanel.classList.remove("hidden");
    collageMakerPanel.classList.remove("hidden");

    const img = new Image();
    img.src = url;
    img.onload = () => {
        const ctx = canvas.getContext("2d");
        const maxWidth = window.innerWidth * 0.9;
        const maxHeight = window.innerHeight * 0.7;
        const aspectRatio = img.width / img.height;

        if (img.width > maxWidth || img.height > maxHeight) {
            if (img.width / maxWidth > img.height / maxHeight) {
                canvas.width = maxWidth;
                canvas.height = maxWidth / aspectRatio;
            } else {
                canvas.height = maxHeight;
                canvas.width = maxHeight * aspectRatio;
            }
        } else {
            canvas.width = img.width;
            canvas.height = img.height;
        }

        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    };
}

function applyCustomization() {
    if (!selectedImage) return;

    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const img = new Image();
    img.src = selectedImage;
    img.onload = () => {
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        ctx.font = `${fontSize.value}px ${fontSelect.value}`;
        ctx.fillStyle = colorPicker.value;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(customText.value, canvas.width / 2, canvas.height / 2);
    };
}

function saveImage() {
    if (!canvas) return;

    const dataURL = canvas.toDataURL("image/png");
    const link = document.createElement("a");
    link.href = dataURL;
    link.download = "customized-image.png";

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    const img = document.createElement("img");
    img.src = dataURL;
    img.style.width = "200px";
    img.style.height = "auto";
    img.style.borderRadius = "8px";
    img.style.margin = "10px";
    img.style.cursor = "pointer";
    img.addEventListener("click", () => {
        window.open(img.src, "_blank");
    });
    gallery.appendChild(img);
}

function applyFilter(filter) {
    if (!selectedImage) return;

    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const img = new Image();
    img.src = selectedImage;
    img.onload = () => {
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        ctx.filter = filter;
        ctx.drawImage(canvas, 0, 0);
    };
}

function applyEdit(edit, value) {
    if (!selectedImage) return;

    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const img = new Image();
    img.src = selectedImage;
    img.onload = () => {
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        switch (edit) {
            case 'brightness':
                ctx.filter = `brightness(${value}%)`;
                break;
            case 'contrast':
                ctx.filter = `contrast(${value}%)`;
                break;
            case 'saturation':
                ctx.filter = `saturate(${value}%)`;
                break;
            case 'hue':
                ctx.filter = `hue-rotate(${value}deg)`;
                break;
        }
        ctx.drawImage(canvas, 0, 0);
    };
}

function createCollage() {
    collageContainer.innerHTML = "";
    collageImages.forEach((src, index) => {
        const img = new Image();
        img.src = src;
        img.style.width = "200px";
        img.style.height = "auto";
        img.style.margin = "10px";
        collageContainer.appendChild(img);
    });
}

searchForm.addEventListener("submit", (e) => {
    e.preventDefault();
    page = 1;
    searchImages();
});

showMoreBtn.addEventListener("click", () => {
    page++;
    searchImages();
});

applyCustomizationBtn.addEventListener("click", applyCustomization);
saveImageBtn.addEventListener("click", saveImage);

filtersPanel.addEventListener("click", (e) => {
    if (e.target.tagName === 'BUTTON') {
        const filter = e.target.getAttribute('data-filter');
        switch (filter) {
            case 'grayscale':
                applyFilter('grayscale(100%)');
                break;
            case 'sepia':
                applyFilter('sepia(100%)');
                break;
            case 'blur':
                applyFilter('blur(5px)');
                break;
        }
    }
});

advancedEditingPanel.addEventListener("click", (e) => {
    if (e.target.tagName === 'BUTTON') {
        const edit = e.target.getAttribute('data-edit');
        const value = prompt(`Enter value for ${edit}`);
        applyEdit(edit, value);
    }
});

createCollageBtn.addEventListener("click", createCollage);

searchResult.addEventListener("click", (e) => {
    if (e.target.tagName === 'IMG') {
        if (collageImages.length < 6) {
            collageImages.push(e.target.src);
            e.target.style.border = "2px solid #00bcd4";
        }
    }
});
