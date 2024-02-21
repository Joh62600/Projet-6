document.addEventListener("DOMContentLoaded", function () {
  const urlParams = new URLSearchParams(window.location.search);
  const mode = urlParams.get("mode");
  const loginLogoutLink = document.querySelector("#loginLogoutAction a");
  const editBanner = document.getElementById("editBanner");
  const editModal = document.getElementById("editModal");
  const closeBtn = document.querySelector(".close");

  // Ajout pour la gestion de l'élément #modif
  const modifElement = document.getElementById("modif"); 

  const loginForm = document.getElementById("loginForm");
  if (loginForm) {
    loginForm.addEventListener("submit", function (event) {
      event.preventDefault(); // Empêche le comportement par défaut du formulaire

      const email = document.getElementById("email").value;
      const password = document.getElementById("password").value;

      fetch("http://localhost:5678/api/users/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      })
        .then((response) => {
          if (!response.ok) {
            throw new Error("Erreur dans l’identifiant ou le mot de passe");
          }
          return response.json();
        })
        .then((data) => {
          console.log("Réponse de l’API:", data);
          localStorage.setItem("userToken", data.token); // Stocke le token dans le localStorage
          window.location.href = "./index.html?mode=edition"; // Redirige l'utilisateur en mode édition
        })
        .catch((error) => {
          console.error(error);
          document.getElementById("errorMessage").textContent = error.message;
        });
    });
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
    const siteGallery = document.getElementById('siteGallery');
    
    if (!siteGallery) return;

    siteGallery.innerHTML = ''; 
    works.forEach(work => {
        const workElement = document.createElement('div');
        workElement.classList.add('work-item'); 
        workElement.setAttribute('data-id', work.id); 

        const imageElement = document.createElement('img');
        imageElement.src = work.imageUrl;
        imageElement.alt = work.title;
        workElement.appendChild(imageElement);

        const titleElement = document.createElement('h3');
        titleElement.textContent = work.title;
        workElement.appendChild(titleElement);

        siteGallery.appendChild(workElement);
    });
}
function extractCategories(works) {
  const categories = works.map(work => work.category); // Extrait les catégories de chaque travail
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
    fetch(worksUrl)
      .then((response) => {
        if (!response.ok) {
          throw new Error(`Erreur HTTP! Statut: ${response.status}`);
        }
        return response.json();
      })
      .then((data) => {
        worksTab = data;
        displayWorks(worksTab);
        extractCategories(worksTab);
        loadPhotoPreviews(); // Appeler ici pour charger les aperçus dans la modale
      })
      .catch((error) => {
        console.error(error);
      });
  }
  fetchWorks();

  function loadPhotoPreviews() {
    const photosContainer = document.getElementById("photosContainer");
    photosContainer.innerHTML = ""; 

    worksTab.forEach((work) => {
        const photoPreview = document.createElement("div");
        photoPreview.classList.add("photo-preview");

        
        const deleteIcon = document.createElement("i");
        deleteIcon.classList.add("fa", "fa-trash-can"); 
        deleteIcon.style.position = "absolute";
        deleteIcon.style.top = "10px";
        deleteIcon.style.right = "10px";
        deleteIcon.style.padding = "6px";
        deleteIcon.style.cursor = "pointer";
        deleteIcon.style.backgroundColor = "black";
        deleteIcon.style.borderRadius ="2px";
        deleteIcon.style.position ="absolute";
        deleteIcon.style.color ="white";
        deleteIcon.style.fontSize = "10px"
        deleteIcon.setAttribute("data-id", work.id);

        
        deleteIcon.addEventListener("click", function(event) {
            event.stopPropagation(); 
            
            deleteWork(this.getAttribute("data-id"));
            console.log(this.getAttribute("data-id")); 
        });

        const img = document.createElement("img");
        img.src = work.imageUrl;
        img.alt = work.title; 

        photoPreview.appendChild(img);
        photoPreview.appendChild(deleteIcon); 
        photosContainer.appendChild(photoPreview);
    });
}
function deleteWork(id) {
  fetch(`http://localhost:5678/api/works/${id}`, {
    method: "DELETE",
    headers: {
      'Authorization': `Bearer ${localStorage.getItem("userToken")}`,
    },
  })
  .then(response => {
    if (!response.ok) {
      throw new Error("Erreur lors de la suppression de la photo");
    }
    
    document.querySelectorAll(`[data-id="${id}"]`).forEach(element => {
     
      const container = element.closest('.photo-preview, .work-item');
      if (container) {
        container.remove();
      }
    });

    worksTab = worksTab.filter(work => work.id !== id); 
    displayWorks(worksTab); 
  })
  .catch(error => {
    console.error("Erreur lors de la suppression :", error);
    alert("La suppression a échoué : " + error.message);
  });
}

  // Afficher la deuxième modale
  const addPhotoBtn = document.getElementById("addPhotoBtn");
  const addPhotoModal = document.getElementById("addPhotoModal");
  const secondModalClose = document.querySelector(".secondModalClose");

  addPhotoBtn.addEventListener("click", function () {
    addPhotoModal.style.display = "block";
  });

  // Fermer la deuxième modale
  secondModalClose.addEventListener("click", function () {
    addPhotoModal.style.display = "none";
  });

  window.addEventListener("click", function (event) {
    if (event.target == addPhotoModal) {
      addPhotoModal.style.display = "none";
    }
  });
});

document.addEventListener("DOMContentLoaded", function () {
  const addPhotoBtn = document.getElementById("addPhotoBtn");
  const addPhotoModal = document.getElementById("addPhotoModal");
  const closeBtn = document.getElementsByClassName("close")[0];

  // Ouvrir la modale
  addPhotoBtn.addEventListener("click", () => {
    addPhotoModal.style.display = "block";
  });

  // Fermer la modale
  closeBtn.addEventListener("click", () => {
    addPhotoModal.style.display = "none";
  });

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
        'Accept': "application/json",
        'Authorization': `Bearer ${token}`
      }
    })
    .then(response => {
      if (!response.ok) {
        throw new Error("Network response was not ok: " + response.statusText);
      }
      return response.json();
    })
    .then(data => {
      console.log("Success:", data);

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
        
        console.log("Suppression de la photo avec l'ID:", this.getAttribute("data-id"));
      };
      modalPhotoPreview.appendChild(deleteIcon);

      const photosContainer = document.getElementById("photosContainer");
      photosContainer.appendChild(modalPhotoPreview);

      // Fermer la modale et réinitialiser le formulaire
      addPhotoModal.style.display = "none";
      addPhotoForm.reset();
    })
    .catch(error => {
      console.error("Erreur lors de l'ajout de la photo :", error);
    });
  });
}
document
  .getElementById("newPhotoFile")
  .addEventListener("change", function (event) {
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
  
})