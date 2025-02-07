
const emailInput = document.getElementById("email");
const pwdInput = document.getElementById("pwd");
const loginForm = document.getElementById("loginForm");
const loginBtn = document.getElementById("loginBtn");
const invalidCredMessage = document.querySelector(".invalidCred");
const editMode = document.querySelector(".editMode");
const modifyGalleryButton = document.getElementById("galleryModifBouton");
const categoryButtonsContainer = document.querySelector(".categories");
let token
let userId

const checkAuth = () => {
  if (sessionStorage.getItem('authToken')) {
    loginBtn.innerText = 'logout'
    editMode.classList.remove("inactive");
    categoryButtonsContainer && categoryButtonsContainer.classList.add("inactive");
    modifyGalleryButton && galleryModifBouton.classList.remove("inactive");
    token = sessionStorage.getItem('authToken');
  } else {
    loginBtn.innerText = 'login';
    editMode.classList.add("inactive");
    modifyGalleryButton && galleryModifBouton.classList.add("inactive");
    categoryButtonsContainer && categoryButtonsContainer.classList.remove("inactive")
  }
}



const removeMessage = () => invalidCredMessage.classList.add("inactive");

if (emailInput && pwdInput) {
  [emailInput, pwdInput].forEach((el) => {
    el.addEventListener(("input"), () => {
      removeMessage();
    })
  })
}


const authUser = async (email, pwd) => {
  const chargeUtile = {
    "email": email,
    "password": pwd
  }

  try {
    const data = await fetch("http://localhost:5678/api/users/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(chargeUtile)
    });

    switch (data.status) {
      case 200:
        const res = await data.json();
        sessionStorage.setItem('authToken', res.token);
        sessionStorage.setItem('userId', res.userId)
        window.location.href = "./index.html";
        loginBtn.innerText = 'logout'
        break;
      case 404:
      case 401:
        invalidCredMessage.classList.remove("inactive")
        invalidCredMessage.classList.add("shake")
        break;
      case 500:
        alert("Network error. Please try again later");
        break;
    }

  } catch (error) {
    console.log(error);
  }
}

if (loginForm) {
  loginForm.addEventListener("submit", (e => {
    e.preventDefault();

    authUser(emailInput.value, pwdInput.value);
  }))
}

const logoutUser = () => {
  sessionStorage.removeItem("authToken");
  loginBtn.innerText = 'login';
}

loginBtn.addEventListener("click", (e) => {
  sessionStorage.getItem("authToken") && logoutUser()
})


checkAuth();

export { checkAuth, logoutUser };

