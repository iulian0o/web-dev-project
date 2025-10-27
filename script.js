import { formFactory } from "./formFactory.js";
import { putDataResponse } from "./putData.js";

const useRemote = false;

const remoteURL = "https://easy-simple-users-rest-api.onrender.com/api/users";

const localURL = "./response.json";

const alertBox = document.querySelector(".alert");

const spinner = document.querySelector(".spinner-border");

const usersContainer = document.getElementById("users-container");

const modalEl = document.getElementById("exampleModal");

const saveBtn = modalEl.querySelector(".btn.btn-primary");

let users = [];

function showAlert(message, type = "info") {
  alertBox.textContent = message;
  alertBox.className = `alert alert-${type}`;
}

async function getJSON(url) {
  const res = await fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      my_key: "my_super_secret_phrase",
    },
  });
  if (!res.ok) throw new Error(`HTTP ${res.status} ${res.statusText}`);
  return res.json();
}

function toUsersArray(data) {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.data)) return data.data;
  if (Array.isArray(data?.users)) return data.users;
  if (data && typeof data === "object") return [data];
  return [];
}

async function loadData() {
  spinner.classList.remove("d-none");
  alertBox.classList.add("d-none");

  try {
    const data = await getJSON(useRemote ? remoteURL : localURL);
    users = toUsersArray(data);

    const normalNames = [
      "John Smith",
      "Emma Johnson",
      "Michael Brown",
      "Sarah Davis",
      "David Wilson",
      "Lisa Anderson",
      "Robert Taylor",
      "Jennifer Martinez",
      "James Thomas",
      "Maria Garcia",
    ];

    users = users.map((user) => {
      const randomName =
        normalNames[Math.floor(Math.random() * normalNames.length)];
      const randomAge = Math.floor(Math.random() * 50) + 18;

      return {
        ...user,
        name: randomName,
        age: randomAge,
      };
    });

    const additionalUsers = [
      {
        id: Date.now() + 1,
        name: "Christopher Lee",
        age: Math.floor(Math.random() * 50) + 18,
        avatar_url: "https://i.pravatar.cc/150?img=1",
        gender: Math.random() > 0.5 ? "Male" : "Female",
        email: "chris.lee@example.com",
      },
      {
        id: Date.now() + 2,
        name: "Amanda Clark",
        age: Math.floor(Math.random() * 50) + 18,
        avatar_url: "https://i.pravatar.cc/150?img=5",
        gender: Math.random() > 0.5 ? "Female" : "Male",
        email: "amanda.clark@example.com",
      },
      {
        id: Date.now() + 3,
        name: "Daniel White",
        age: Math.floor(Math.random() * 50) + 18,
        avatar_url: "https://i.pravatar.cc/150?img=8",
        gender: Math.random() > 0.5 ? "Male" : "Female",
        email: "daniel.white@example.com",
      },
      {
        id: Date.now() + 4,
        name: "Sophia Rodriguez",
        age: Math.floor(Math.random() * 50) + 18,
        avatar_url: "https://i.pravatar.cc/150?img=11",
        gender: Math.random() > 0.5 ? "Female" : "Male",
        email: "sophia.rodriguez@example.com",
      },
    ];

    users = [...users, ...additionalUsers];

    users = users.sort(() => Math.random() - 0.5);

    displayUsers(users);

    if (users.length === 0) {
      showAlert("No users found", "warning");
    }
  } catch (error) {
    showAlert(`Failed to load data: ${error.message}`, "danger");
    console.error("Failed to load data:", error);
  } finally {
    spinner.classList.add("d-none");
  }
}

function displayUsers(list) {
  if (!list || list.length === 0) {
    alertBox.classList.remove("d-none");
    alertBox.classList.add("alert-danger");
    alertBox.textContent = "No users found.";
    return;
  }

  usersContainer.innerHTML = "";

  list.forEach((user, index) => {
    const col = document.createElement("div");
    col.className = "col-12 col-sm-6 col-lg-4";

    col.innerHTML = `
      <article class="card glass-card h-100 text-center">
        <div class="p-3">
          <img src="${user.avatar_url || "https://via.placeholder.com/200"}" 
              alt="${user.name || "No name"}" 
              class="card-img-top object-fit-contain mb-3"
              width="120" height="120" />
        </div>
        <div class="card-body">
          <h5 class="card-title mb-2">${user.name || "Unnamed"}</h5>
          <ul class="list-group list-group-flush text-start">
            <li class="list-group-item">Email: ${user.email || "–"}</li>
            <li class="list-group-item">Age: ${user.age || "–"}</li>
            <li class="list-group-item">Gender:  ${user.gender || "–"}</li>
          </ul>
          <button data-index="${index}" data-user-id="${user.id}"
                  type="button" class="btn btn-primary mt-3 edit-btn"
                  data-bs-toggle="modal" data-bs-target="#exampleModal">
            Edit
          </button>
        </div>
      </article>
    `;

    usersContainer.appendChild(col);
  });

  addEventListeners();
}

const addEventListeners = () => {
  const editButtons = document.querySelectorAll(".edit-btn");

  editButtons.forEach((button) => {
    button.addEventListener("click", (e) => {
      document.querySelector(".modal-body").innerHTML = "";
      document.querySelector(".modal-body").appendChild(formFactory());

      const foundUser = users.find(
        (user) => user.id === parseInt(e.target.getAttribute("data-user-id"))
      );

      getModalForm(foundUser);
    });
  });
};

const getModalForm = (foundUser) => {
  const modalForm = document.querySelector(".modal-body form");
  if (!modalForm || !foundUser) return;

  modalForm.userName.value = foundUser.name || "";
  modalForm.userAge.value = foundUser.age || "";
  modalForm.userImg.value = foundUser.avatar_url || "";
  modalForm.userGender.value = foundUser.gender || "";
  saveBtn.setAttribute("data-user-id", foundUser.id);
};

saveBtn.addEventListener("click", async () => {
  const modalForm = document.querySelector(".modal-body form");
  const userId = saveBtn.getAttribute("data-user-id");
  if (!modalForm) return;

  const updated = {
    id: userId,
    name: modalForm.userName.value.trim(),
    age: Number(modalForm.userAge.value || 0),
    avatar_url: modalForm.userImg.value.trim(),
    gender: modalForm.userGender.value.trim(),
  };

  await putDataResponse(remoteURL, updated);

  const index = users.findIndex((u) => u.id === parseInt(userId));
  if (index !== -1) users[index] = { ...users[index], ...updated };

  displayUsers(users);

  document.activeElement.blur();
});

loadData();
