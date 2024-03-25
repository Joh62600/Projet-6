let worksTab = [];
const gallery = document.querySelector(".gallery");
const worksUrl = "http://localhost:5678/api/works";
let categoriesSet = new Set();

document.addEventListener('DOMContentLoaded', function() {
  async function fetchWorks() {
    try {
      const response = await fetch(worksUrl); // Attend que la requête fetch soit complétée
      if (!response.ok) {
        throw new Error(`Erreur HTTP! Statut: ${response.status}`);
      }
      const data = await response.json(); // Attend que les données soient converties en JSON
      worksTab = data;
      displayWorks(worksTab);
      extractCategories(worksTab); // Extraire et générer les boutons de filtre de catégorie
    } catch (error) {
      console.error(error); // Gère les erreurs potentielles dans le bloc try
    }
  }

function displayWorks(works) {
  gallery.innerHTML = "";
  works.forEach((work) => {
    const workElement = createWorkElement(work);
    gallery.appendChild(workElement);
  });
}

function createWorkElement(work) {
  const workElement = document.createElement("div");
  workElement.classList.add("work");

  const titleElement = document.createElement("h3");
  titleElement.textContent = work.title;
  workElement.appendChild(titleElement);

  const imageElement = document.createElement("img");
  imageElement.src = work.imageUrl;
  workElement.appendChild(imageElement);

  return workElement;
}

function extractCategories(works) {
  // Extraire les catégories des travaux et les ajouter
  works.forEach((work) => {
    categoriesSet.add(work.category.name);
  });

  // Générer les boutons de filtre de catégorie
  generateCategoryButtons(Array.from(categoriesSet));
}

function generateCategoryButtons(categories) {
  const categoryButtonsContainer = document.querySelector(".categoryButtons");

  // Ajouter le bouton "Tout"
  const buttonAll = document.createElement("button");
  buttonAll.textContent = "Tous";
  buttonAll.classList.add("filter", "active");
  buttonAll.onclick = () => filterWorksByCategory("Tous");
  categoryButtonsContainer.appendChild(buttonAll);

  // Ajouter les boutons de filtre pour chaque catégorie
  categories.forEach((category) => {
    const buttonFilter = document.createElement("button");
    buttonFilter.textContent = category;
    buttonFilter.classList.add("filter");
    buttonFilter.onclick = () => filterWorksByCategory(category);
    categoryButtonsContainer.appendChild(buttonFilter);
  });
}

function filterWorksByCategory(selectedCategory) {
  let filteredWorks;

  // Désactiver la classe active de tous les boutons
  const filterButtons = document.querySelectorAll(".filter");
  filterButtons.forEach((btn) => {
    btn.classList.remove("active");
  });

  // Activer la classe active sur le bouton cliqué
  filterButtons.forEach((btn) => {
    if (btn.textContent === selectedCategory) {
      btn.classList.add("active");
    }
  });

  if (selectedCategory === "Tous") {
    // Afficher tous les travaux si "Tout" est sélectionné
    filteredWorks = worksTab;
  } else {
    // Filtrer les travaux par la catégorie sélectionnée
    filteredWorks = worksTab.filter(
      (work) => work.category.name === selectedCategory
    );
  }

  // Afficher les travaux filtrés
  displayWorks(filteredWorks);
}

// Appeler la fonction pour récupérer les travaux
fetchWorks();

const addPhotoForm = document.getElementById('addPhotoForm');
    if (addPhotoForm) {
        addPhotoForm.addEventListener('submit', function(event) {
            event.preventDefault();

            const formData = new FormData(addPhotoForm);
            formData.append('title', document.getElementById('photoTitle').value);
            formData.append('category', document.getElementById('photoCategory').value);
            const photoFile = document.getElementById('photoUpload').files[0];
            formData.append('image', photoFile);

            fetch('http://localhost:5678/api/works', {
                method: 'POST',
                body: formData,
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('userToken')}`
                },
            })
            .then(response => response.json())
            .then(data => {
                console.log('Photo ajoutée avec succès:', data);
                worksTab.push(data); // Ajouter la nouvelle photo à worksTab
                displayWorks(worksTab); // Mettre à jour l'affichage
                document.getElementById('editModal').style.display = 'none'; // Fermer la modale
            })
            .catch(error => console.error('Erreur lors de l\'ajout de la photo:', error));
        });
    }
});
