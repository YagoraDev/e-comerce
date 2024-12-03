document.addEventListener("DOMContentLoaded", function () {
  const loginOption = document.getElementById("loginOption");
  const registerOption = document.getElementById("registerOption");
  const logoutOption = document.getElementById("logoutOption");
  const userNameDisplay = document.getElementById("userNameDisplay");
  const userNameText = document.getElementById("userNameText");
  const cartCount = document.getElementById("cartCount");
  const cartDetails = document.getElementById("cartDetails");
  const apiUrl = "http://localhost:3000"; // URL base do json-server

  let cart = []; // Array para armazenar os itens do carrinho

  // Inicializar todos os carrosséis do Bootstrap
  const carousels = document.querySelectorAll(".carousel");
  carousels.forEach((carouselElement, index) => {
    if (carouselElement) {
      new bootstrap.Carousel(carouselElement, {
        interval: 5000,
        wrap: true,
        ride: "carousel"
      });
    }
  });

  // Atualizar navbar
  async function updateNavbarState() {
    const loggedInUser = JSON.parse(localStorage.getItem("loggedInUser"));

    if (loggedInUser) {
      userNameText.textContent = `Olá, ${loggedInUser.name}`;
      userNameDisplay.style.display = "block";
      loginOption.style.display = "none";
      registerOption.style.display = "none";
      logoutOption.style.display = "block";
    } else {
      userNameDisplay.style.display = "none";
      loginOption.style.display = "block";
      registerOption.style.display = "block";
      logoutOption.style.display = "none";
    }
  }

  // Exibir mensagem de sucesso
  function showSuccessMessage(message) {
    const successMessage = document.createElement("div");
    successMessage.className = "alert alert-success";
    successMessage.textContent = message;
    successMessage.style.position = "fixed";
    successMessage.style.bottom = "20px";
    successMessage.style.right = "20px";
    successMessage.style.zIndex = "1000";
    document.body.appendChild(successMessage);

    setTimeout(() => {
      document.body.removeChild(successMessage);
    }, 3000);
  }

  // Cadastro
  document.getElementById("registerForm").addEventListener("submit", async function (event) {
    event.preventDefault();

    const name = document.getElementById("registerName").value;
    const email = document.getElementById("registerEmail").value;
    const password = document.getElementById("registerPassword").value;

    try {
      const response = await fetch(`${apiUrl}/users`);
      const users = await response.json();

      if (users.some(user => user.email === email)) {
        alert("Este email já está registrado.");
        return;
      }

      const newUser = { name, email, password };

      const postResponse = await fetch(`${apiUrl}/users`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newUser),
      });

      if (postResponse.ok) {
        localStorage.setItem("loggedInUser", JSON.stringify(newUser));
        updateNavbarState();
        $('#registerModal').modal('hide');
        document.getElementById("registerForm").reset();
        showSuccessMessage("Cadastro realizado com sucesso!");
      } else {
        alert("Erro ao cadastrar usuário. Por favor, tente novamente.");
      }
    } catch (error) {
      console.error("Erro na solicitação de cadastro:", error);
      alert("Erro ao realizar o cadastro. Tente novamente mais tarde.");
    }
  });

  // Login
  document.getElementById("loginForm").addEventListener("submit", async function (event) {
    event.preventDefault();

    const email = document.getElementById("loginEmail").value;
    const password = document.getElementById("loginPassword").value;

    try {
      const response = await fetch(`${apiUrl}/users?email=${email}&password=${password}`);
      const users = await response.json();

      if (users.length > 0) {
        localStorage.setItem("loggedInUser", JSON.stringify(users[0]));
        updateNavbarState();
        $('#loginModal').modal('hide');
        showSuccessMessage("Login realizado com sucesso!");
      } else {
        alert("Email ou senha incorretos.");
      }
    } catch (error) {
      console.error("Erro na solicitação de login:", error);
      alert("Erro ao realizar o login. Tente novamente mais tarde.");
    }
  });

  // Logout
  logoutOption.addEventListener("click", function () {
    localStorage.removeItem("loggedInUser");
    updateNavbarState();
    showSuccessMessage("Logout realizado com sucesso!");
  });

  // Adicionar ao carrinho
  document.querySelectorAll(".add-to-cart").forEach(button => {
    button.addEventListener("click", function () {
      const name = this.dataset.name;
      const price = parseFloat(this.dataset.price);
      const image = this.dataset.image;

      cart.push({ name, price, image });
      updateCartDisplay();

      showSuccessMessage("Produto adicionado ao carrinho!");
    });
  });

  // Atualizar exibição do carrinho
  function updateCartDisplay() {
    cartCount.textContent = cart.length;

    cartDetails.innerHTML = "";

    if (cart.length === 0) {
      cartDetails.innerHTML = '<li><p class="dropdown-item">O carrinho está vazio.</p></li>';
      return;
    }

    cart.forEach((item, index) => {
      const cartItem = document.createElement("li");
      cartItem.className = "dropdown-item d-flex justify-content-between align-items-center";
      cartItem.innerHTML = `
        <div>
          <strong>${item.name}</strong><br>
          <span>R$ ${item.price.toFixed(2)}</span>
        </div>
        <button class="btn btn-sm btn-danger remove-from-cart" data-index="${index}">Remover</button>
      `;
      cartDetails.appendChild(cartItem);
    });

    const finalizeButton = document.createElement("li");
    finalizeButton.className = "dropdown-item text-center";
    finalizeButton.innerHTML = `
      <button class="btn btn-primary btn-sm w-100">Finalizar Compra</button>
    `;
    cartDetails.appendChild(finalizeButton);

    document.querySelectorAll(".remove-from-cart").forEach(button => {
      button.addEventListener("click", function () {
        const index = parseInt(this.dataset.index, 10);
        cart.splice(index, 1);
        updateCartDisplay();
        showSuccessMessage("Item removido do carrinho!");
      });
    });
  }

  // Atualizar estado inicial da navbar
  updateNavbarState();
});
