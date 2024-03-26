document.addEventListener("DOMContentLoaded", function () {
  const urlParams = new URLSearchParams(window.location.search);
  const mode = urlParams.get("mode");
  const loginLogoutLink = document.querySelector("#loginLogoutAction a");
  const editBanner = document.getElementById("editBanner");
  const editModal = document.getElementById("editModal");
  const closeBtn = document.querySelector(".close");
  const modifElement = document.getElementById("modif");
  const loginForm = document.getElementById("loginForm");
  const worksUrl = "http://localhost:5678/api/works";

  async function loginUser(event) {
    event.preventDefault(); // Empêche le comportement par défaut

    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    try {
      const response = await fetch("http://localhost:5678/api/users/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        throw new Error("Erreur dans l’identifiant ou le mot de passe");
      }

      const data = await response.json();
      localStorage.setItem("userToken", data.token); // Stocke le token dans le localStorage
      window.location.href = "./index.html?mode=edition"; // Redirige l'utilisateur en mode édition
    } catch (error) {
      console.error(error);
      document.getElementById("errorMessage").textContent = error.message;
    }
  }

  if (loginForm) {
    loginForm.addEventListener("submit", loginUser);
  }
  // Gestion du changement de texte du bouton login/logout
  if (loginLogoutLink) {
    if (mode === "edition" && localStorage.getItem("userToken")) {
      loginLogoutLink.textContent = "logout"; // Change le texte en "logout"
      loginLogoutLink.addEventListener("click", function (event) {
        event.preventDefault();
        localStorage.removeItem("userToken"); // Déconnexion de l'utilisateur
        window.location.href = "login.html"; // Redirection vers la page de connexion
      });

      // Afficher la bande "Mode Édition"
      if (editBanner) {
        editBanner.style.display = "flex"; // Rend la bande visible
        document.querySelector("header").style.paddingTop = "59px";
      }

      // Affiche l'élément #modif en mode édition
      if (modifElement) {
        modifElement.style.display = "flex";
      }
    } else {
      loginLogoutLink.textContent = "login";
      loginLogoutLink.href = "./login.html";
    }
  }
  function displayWorks(works) {
    const siteGallery = document.getElementById("siteGallery");

    if (!siteGallery) return;

    siteGallery.innerHTML = "";
    works.forEach((work) => {
      const workElement = document.createElement("div");
      workElement.classList.add("work-item");
      workElement.setAttribute("data-id", work.id);

      const imageElement = document.createElement("img");
      imageElement.src = work.imageUrl;
      imageElement.alt = work.title;
      workElement.appendChild(imageElement);

      const titleElement = document.createElement("h3");
      titleElement.textContent = work.title;
      workElement.appendChild(titleElement);

      siteGallery.appendChild(workElement);
    });
  }

  function resetImagePreview() {
    const imagePreview = document.getElementById("imagePreview");
    const uploadLabel = document.getElementById("uploadLabel");

    if (imagePreview) {
      imagePreview.src = ""; // Efface la source de l'image de prévisualisation
      imagePreview.style.display = "none"; // Cache l'image de prévisualisation
    }

    if (uploadLabel) {
      uploadLabel.style.display = "flex"; // Affiche à nouveau le label de téléchargement
    }
  }

  function extractCategories(works) {
    const categories = works.map((work) => work.category); // Extrait les catégories de chaque travail
    const uniqueCategories = [...new Set(categories)]; // Supprime les doublons
    return uniqueCategories;
  }
  // Gestion de l'ouverture et de la fermeture de la modale
  if (mode === "edition" && localStorage.getItem("userToken")) {
    if (modifElement && editModal) {
      modifElement.onclick = function () {
        editModal.style.display = "block"; // Ouvre la modale
        loadPhotoPreviews();
      };
    }
    if (modifElement && editModal) {
      modifElement.onclick = function () {
        editModal.style.display = "block";
        loadPhotoPreviews(); // Charge les aperçus des photos existantes
      };
    }
    if (closeBtn) {
      closeBtn.onclick = function () {
        editModal.style.display = "none"; // Ferme la modale quand on clique sur le bouton de fermeture
      };
    }

    // Ferme la modale si l'utilisateur clique en dehors
    window.onclick = function (event) {
      if (event.target == editModal) {
        editModal.style.display = "none";
      }
    };
  }
  async function fetchWorks() {
    try {
      const response = await fetch(worksUrl);
      if (!response.ok) {
        throw new Error(`Erreur HTTP! Statut: ${response.status}`);
      }
      const data = await response.json();
      worksTab = data;
      displayWorks(worksTab);
      extractCategories(worksTab);
      loadPhotoPreviews(); // Appeler ici pour charger les aperçus dans la modale
    } catch (error) {}
  }
  fetchWorks();

  function loadPhotoPreviews() {
    const photosContainer = document.getElementById("photosContainer");
    photosContainer.innerHTML = "";

    worksTab.forEach((work) => {
      const photoPreview = document.createElement("div");
      photoPreview.classList.add("photo-preview");
      photoPreview.setAttribute("data-id", work.id);

      const deleteIcon = document.createElement("i");
      deleteIcon.classList.add("fa", "fa-trash-can");
      deleteIcon.style.position = "absolute";
      deleteIcon.style.top = "10px";
      deleteIcon.style.right = "10px";
      deleteIcon.style.padding = "6px";
      deleteIcon.style.cursor = "pointer";
      deleteIcon.style.backgroundColor = "black";
      deleteIcon.style.borderRadius = "2px";
      deleteIcon.style.position = "absolute";
      deleteIcon.style.color = "white";
      deleteIcon.style.fontSize = "10px";
      deleteIcon.setAttribute("data-id", work.id);

      deleteIcon.addEventListener("click", function (event) {
        event.stopPropagation();

        deleteWork(this.getAttribute("data-id"));
        
      });

      const img = document.createElement("img");
      img.src = work.imageUrl;
      img.alt = work.title;

      photoPreview.appendChild(img);
      photoPreview.appendChild(deleteIcon);
      photosContainer.appendChild(photoPreview);
    });
  }

  const photosContainer = document.getElementById("photosContainer");
  if (photosContainer) {
    photosContainer.addEventListener("click", function (event) {
      let targetElement = event.target;

      while (targetElement != null && !targetElement.matches(".fa-trash-can")) {
        targetElement = targetElement.parentElement;
      }

      // Si un élément correspondant a été trouvé et a un attribut `data-id`
      if (targetElement && targetElement.getAttribute("data-id")) {
        const workId = targetElement.getAttribute("data-id");
        deleteWork(workId); // Appeler votre fonction de suppression
      }
    });
  }

  async function deleteWork(workId) {
    try {
      const response = await fetch(
        `http://localhost:5678/api/works/${workId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("userToken")}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Erreur lors de la suppression de la photo");
      }

      // Supprimer l'élément de l'aperçu
      const previewElement = document.querySelector(
        `.photo-preview[data-id="${workId}"]`
      );
      if (previewElement) {
        previewElement.remove();
        
      } else {
        
      }

      // Supprimer l'élément de la galerie
      const galleryElement = document.querySelector(
        `.work-item[data-id="${workId}"]`
      );
      if (galleryElement) {
        galleryElement.remove();
        
      } else {
        
      }
    } catch (error) {
      console.error("Erreur lors de la suppression :", error);
      alert("La suppression a échoué : " + error.message);
    }
  }

  function refreshPhotoList() {
    const photosContainer = document.getElementById("photosContainer");
    photosContainer.innerHTML = "";

    fetchWorks();
  }

  function clearAddPhotoModal() {
    document.getElementById("newPhotoTitle").value = "";
    document.getElementById("newPhotoCategory").selectedIndex = 0; // Réinitialiser au premier élément
    document.getElementById("newPhotoFile").value = ""; // Réinitialiser le champ de fichier

    // Appel à resetImagePreview pour réinitialiser l'aperçu de l'image
    resetImagePreview();
  }
  if (modifElement) {
    modifElement.onclick = function () {
      refreshPhotoList(); // Rafraîchit la liste à chaque ouverture de la modale
      editModal.style.display = "block";
    };
  }
  // Afficher la deuxième modale
  const addPhotoBtn = document.getElementById("addPhotoBtn");
  const addPhotoModal = document.getElementById("addPhotoModal");
  const secondModalClose = document.querySelector(".secondModalClose");
  if (addPhotoBtn) {
    addPhotoBtn.addEventListener("click", function () {
      clearAddPhotoModal();
      addPhotoModal.style.display = "block";
      editModal.style.display = "none";
    });
  }
  // Fermer la deuxième modale
  if (secondModalClose) {
    secondModalClose.addEventListener("click", function () {
      addPhotoModal.style.display = "none";
    });
  }
  window.addEventListener("click", function (event) {
    if (event.target == addPhotoModal) {
      addPhotoModal.style.display = "none";
    }
  });
});

const addPhotoBtn = document.getElementById("addPhotoBtn");
const addPhotoModal = document.getElementById("addPhotoModal");
const closeBtn = document.getElementsByClassName("close")[0];

// Ouvrir la modale
if (addPhotoModal) {
  addPhotoBtn.addEventListener("click", () => {
    addPhotoModal.style.display = "block";
  });
}

// Fermer la modale
if (closeBtn) {
  closeBtn.addEventListener("click", () => {
    addPhotoModal.style.display = "none";
  });
}
// Fermer la modale si l'utilisateur clique en dehors
window.addEventListener("click", (event) => {
  if (event.target == addPhotoModal) {
    addPhotoModal.style.display = "none";
  }
});

// Soumission du formulaire
const addPhotoForm = document.getElementById("newPhotoForm");
if (addPhotoForm) {
  addPhotoForm.addEventListener("submit", function (event) {
    event.preventDefault();

    const title = document.getElementById("newPhotoTitle").value;
    const category = document.getElementById("newPhotoCategory").value;
    const photoFile = document.getElementById("newPhotoFile").files[0];
    const token = localStorage.getItem("userToken");

    const formData = new FormData();
    formData.append("title", title);
    formData.append("category", category);
    formData.append("image", photoFile);

    fetch("http://localhost:5678/api/works", {
      method: "POST",
      body: formData,
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error(
            "Network response was not ok: " + response.statusText
          );
        }
        return response.json();
      })
      .then((data) => {
        

        // Création du conteneur pour la nouvelle photo et son titre pour la galerie du site
        const photoContainer = document.createElement("div");
        photoContainer.classList.add("photo-container");
        const newPhoto = document.createElement("img");
        newPhoto.src = data.imageUrl;
        newPhoto.alt = title;
        newPhoto.classList.add("photo-class");
        const photoTitle = document.createElement("h3");
        photoTitle.textContent = title;
        photoTitle.classList.add("photo-title");
        photoTitle.style.textAlign = "center";
        photoContainer.appendChild(newPhoto);
        photoContainer.appendChild(photoTitle);
        const siteGallery = document.getElementById("siteGallery");
        siteGallery.appendChild(photoContainer);

        // Création et ajout de la nouvelle photo dans l'aperçu de la modale
        const modalPhotoPreview = document.createElement("div");
        modalPhotoPreview.classList.add("photo-preview");
        const modalNewPhoto = document.createElement("img");
        modalNewPhoto.src = data.imageUrl;
        modalNewPhoto.alt = title;
        modalPhotoPreview.appendChild(modalNewPhoto);

        // Gestion de l'icône de suppression pour l'aperçu de la photo dans la modale
        const deleteIcon = document.createElement("i");
        deleteIcon.classList.add("fa", "fa-trash");
        deleteIcon.setAttribute("data-id", data.id);
        deleteIcon.onclick = function () {
         
        };
        modalPhotoPreview.appendChild(deleteIcon);

        const photosContainer = document.getElementById("photosContainer");
        photosContainer.appendChild(modalPhotoPreview);

        // Fermer la modale et réinitialiser le formulaire
        addPhotoModal.style.display = "none";
        addPhotoForm.reset();
      })
      .catch((error) => {
        console.error("Erreur lors de l'ajout de la photo :", error);
      });
  });
}
const newPhotoFile = document.getElementById("newPhotoFile")
if(newPhotoFile){
  newPhotoFile.addEventListener("change", function (event) {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();

      reader.onload = function (e) {
        const imagePreview = document.getElementById("imagePreview");
        const uploadLabel = document.getElementById("uploadLabel");

        imagePreview.src = e.target.result;
        imagePreview.style.display = "block";

        uploadLabel.style.display = "none";
      };

      reader.readAsDataURL(file); //
    }
  
    const addPhotoForm = document.getElementById("addPhotoForm");
    if (addPhotoForm) {
      addPhotoForm.addEventListener("submit", function (event) {
        event.preventDefault();
      });
    }

    const newPhotoFileInput = document.getElementById("newPhotoFile");
    if (newPhotoFileInput) {
      newPhotoFileInput.addEventListener("change", function (event) {
        const file = event.target.files[0];
        if (file) {
          const reader = new FileReader();

          reader.onload = function (e) {
            const imagePreview = document.getElementById("imagePreview");
            imagePreview.src = e.target.result;
            imagePreview.style.display = "block";

            const uploadLabel = document.getElementById("uploadLabel");
            uploadLabel.style.display = "none";
          };

          reader.readAsDataURL(file);
        }
      });
    }
  
  });
}
const titleInput = document.getElementById("newPhotoTitle");
const categorySelect = document.getElementById("newPhotoCategory");
const fileInput = document.getElementById("newPhotoFile");
const validateButton = document.getElementById("valider_btn");

function updateValidateButton() {
  // Vérifier si tous les champs sont remplis
  if (titleInput.value && categorySelect.value && fileInput.files.length > 0) {
    validateButton.style.backgroundColor = "#1D6154";
    validateButton.disabled = false;
  } else {
    validateButton.style.backgroundColor = "#A7A7A7";
    validateButton.disabled = true;
  }
}

//  vérifier les changements
if(titleInput){
titleInput.addEventListener("input", updateValidateButton);
categorySelect.addEventListener("change", updateValidateButton);
fileInput.addEventListener("change", updateValidateButton);

document.querySelector(".back-arrow").addEventListener("click", function () {
  document.getElementById("addPhotoModal").style.display = "none";
  document.getElementById("editModal").style.display = "block";

  document.getElementById("addPhotoBtn").addEventListener("click", function () {
    document.getElementById("addPhotoModal").style.display = "block";
  });
});
}