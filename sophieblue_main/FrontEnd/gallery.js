import { checkAuth, logoutUser } from './auth.js'


const gallery = document.querySelector(".gallery");
const categoryWrapper = document.querySelector(".categories");
const editModalWrapper = document.getElementById("editPortfolioModalWrapper");
const editModal = document.getElementById("editPortfolioModal");
const galleryEditBtn = document.getElementById("galleryEditBtn");
const modalTitle = document.getElementById("modalTitle");
const modalMainContent = document.getElementById("modalMainContent");
const modalConfirmationBtn = document.getElementById("modalConfirmationBtn");
const modalNavBtnsWrapper = document.getElementById("modalNavBtnsWrapper");
const modalAddPictureBtn = document.getElementById("modalAddPictureBtn");
const modalBackBtn = document.getElementById("modalBackBtn");
let globalCategories;


const fetchGetData = async (endpoint) => {
  try {
    const res = await fetch(`http://localhost:5678/api/${endpoint}`)
    return await res.json()
  } catch (error) {
    console.log(error);
  }
}

const alertMsg = (message, feature) => {
  const alert = document.querySelector(".alertMsg");
  alert.textContent = message;

  if(feature === "delete") {
    alert.style.backgroundColor = "darkred"
  }
  if(feature === "add") {
    alert.style.backgroundColor = "darkgreen"
  }

  alert.classList.add("alert");
  alert.classList.remove("inactive");

  setTimeout(() => {
    alert.classList.remove("alert");
    alert.classList.add("inactive");
  }, 1010)
}

const deletePhoto = async (id) => {
  const token = sessionStorage.getItem('authToken');

  try {
    await fetch(`http://localhost:5678/api/works/${id}`, {
      method: "delete",
      headers: {
        "Authorization" : "Bearer " + token,
        "Content-Type": "application/json"
      }
    })
    
    const elsToRemove = document.querySelectorAll(`[data-id="${id}"]`);
    elsToRemove.forEach((el) => el.remove());

  } catch (error) {
    console.log(error);
  }
} 

const addNewImage = async (body) => {
  const token = sessionStorage.getItem('authToken');

  try {
    const data = await fetch(`http://localhost:5678/api/works`, {
      method: "post",
      headers: {
        "Authorization" : "Bearer " + token
      },
      body: body
    })
    await fillGallery();
    console.log(data);
  } catch (error) {
    console.log(error);
  }
}

const fillGallery = async () => {

  const works = await fetchGetData("works");
  
  gallery.innerHTML = '';

  works.forEach((work) => {
    const item = 
    `
    <figure class="workFigure" data-category-id="${work.categoryId}" data-id="${work.id}">
    <img src="${work.imageUrl}" alt="${work.title}" class="figureImg" data-id="${work.id}">
    <figcaption>${work.title}</figcaption>
    </figure>
    `
    
    gallery.innerHTML += item
  })
}

const filterGallery = (id = "0") => {

  const works = document.querySelectorAll(".workFigure");
  
  works.forEach((work) => {
    const shouldBeInactive = id !== "0" && work.dataset.categoryId !== id
    
    work.classList.toggle("inactive", shouldBeInactive)
  })
}


const fillCategories = async () => {
  const categories = await fetchGetData("categories");
  globalCategories = categories;
  
  categories.map((category) => {
    const item = `<button type="button" data-category-id="${category.id}" class="btn-categories">${category.name}</button>`
    categoryWrapper.innerHTML += item;
  })
  
  const categoryBtns = document.querySelectorAll(".categories > .btn-categories");
  
 
  categoryBtns.forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      
    
      const previousSelected = document.querySelector(".categories > .selected")
      previousSelected.classList.remove("selected")
      
      e.target.classList.add("selected")
      const id = e.target.dataset.categoryId
      
      filterGallery(id)
    })
  })
}

loginBtn.addEventListener("click", (e) => {
  sessionStorage.getItem("authToken") && logoutUser()
})

const addDeletePicturesContent = () => {
  modalTitle.innerText = "Galerie photo";
  modalConfirmationBtn.value = "Ajouter une photo";
  modalMainContent.innerHTML = '';
  modalConfirmationBtn.classList.add("inactive");
  modalAddPictureBtn.classList.remove("inactive");
  modalBackBtn.setAttribute("disabled", "");
  modalBackBtn.classList.add("invisible");

  const images = document.querySelectorAll(".figureImg");

  images.forEach((image) => {
    const item = 
    `
    <div class="modalImgWrapper" data-id="${image.dataset.id}">
      <button class="removeImgBtn">
        <i class="fa-solid fa-trash-can fa-sm"></i>
      </button>
      <img src="${image.src}" alt="${image.alt}" class="modalImg" data-id="${image.dataset.id}" />
    </div>
    `

    modalMainContent.innerHTML += item;
  })

  const imagesRemoveBtn = document.querySelectorAll(".removeImgBtn");
  imagesRemoveBtn.forEach((btn) => {
    btn.addEventListener(("click"), (e) => {
      e.stopImmediatePropagation();
      const photoId = e.target.closest(".removeImgBtn").nextElementSibling.dataset.id;
      deletePhoto(photoId);
      addDeletePicturesContent();
      alertMsg("Image supprimée", "delete");
    })
  })
}


galleryEditBtn && galleryEditBtn.addEventListener(("click"), (e) => {
  editModalWrapper.showModal();
  addDeletePicturesContent();
  e.stopImmediatePropagation()
})

document.addEventListener("click", (e) => {
  if (editModalWrapper.hasAttribute("open")) {
   
    if ((e.target !== editModal && !editModal.contains(e.target)) && e.target !== modalNavBtnsWrapper) {
      editModalWrapper.close();
    }
  }
});

const addNewPictureContent = async () => {
  modalAddPictureBtn.classList.toggle("inactive");
  modalConfirmationBtn.classList.toggle("inactive");
  modalBackBtn.classList.remove("invisible");
  modalBackBtn.removeAttribute("disabled");
  modalTitle.innerText = "Ajouter une photo";
  modalMainContent.innerHTML = ''
  modalAddPictureBtn.classList.add("inactive");
  let categories = [];
  globalCategories.forEach((category) => categories.push({"name": category.name, "id": category.id}));
  
  modalMainContent.innerHTML = 
  `
    <form id="addImgForm" action="" method="dialog">
      <div id="addImgInputWrapper">
        <div class="addImgOverlay"></div>
        <i class="fa-regular fa-image addImgIcon"></i>
        <label for="image" id="addImgBtn"><i class="fa-solid fa-plus fa-sm"></i> Ajouter photo</label>
        <input type="file" name="image" id="image" accept=".jpg, .jpeg, .png" class="invisible" required />
        <p id="fileInputDescription">jpg, png: 4mo max</p>
      </div>
      <div id="inputWrapper">
        <label for="title" class="inputDescription">Titre</label>
        <input type="text" name="title" id="title" required />
        <label for="category" class="inputDescription">Catégorie</label>
        <select name="category" id="category" required>
          <option value=""></option>
        </select>
      </div>
    </form>
  `

  let addImgForm = document.getElementById("addImgForm");
  let title = document.getElementById("title");

  let categorySelect = document.getElementById("category");
  categories.forEach((category) => categorySelect.innerHTML += `<option value=${category.id}>${category.name}</option>`);

  const overlay = document.querySelector(".addImgOverlay");

  let addImgInput = document.getElementById("image");
  addImgInput.addEventListener(("change"), (e) => {

    const files = e.target.files

    if(files.length > 0) {
      const file = files[0];
      
      const reader = new FileReader();

      reader.onload = (e) => {
        const imgUrl = e.target.result
        overlay.style.background = `no-repeat #E8F1F6 center/50% url(${imgUrl})`;
        overlay.classList.add("overlay");
      }

      reader.readAsDataURL(file)
    }
  })

  setTimeout([addImgInput, title, categorySelect].forEach((el) => {
    el.addEventListener(("input"), (e) => {
      const isFileSelected = addImgInput.files.length > 0;
      const isTitleFilled = title.value.trim();
      const isCategorySelected = categorySelect.value;

      if(modalConfirmationBtn.classList.contains("disabled") && (isFileSelected && isTitleFilled && isCategorySelected)) {
        modalConfirmationBtn.classList.remove("disabled")
      } else if (!modalConfirmationBtn.classList.contains("disabled") && (!isFileSelected || !isTitleFilled || !isCategorySelected)) {
        modalConfirmationBtn.classList.add("disabled")
      }
    })
  }), 100)

  addImgForm.addEventListener(("submit"), (e) => {
    e.preventDefault();
    const body = new FormData(addImgForm)
    const category = parseInt(document.getElementById("category").value);
    body.set("category", category);
    
    addNewImage(body);
    addImgForm.reset();
    overlay.classList.remove("overlay");
    alertMsg("Image ajoutée", "add");
  })
}

modalBackBtn.addEventListener(("click"), (e) => {
  e.stopPropagation();
  modalBackBtn.setAttribute("disabled", "");
  modalBackBtn.classList.add("invisible");
  addDeletePicturesContent();
})

modalAddPictureBtn.addEventListener("click", (e) => {
  e.preventDefault();
  addNewPictureContent();
})


fillGallery()
fillCategories()
checkAuth()
