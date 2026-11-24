// Depois de publicar o backend no Render, substitua pela URL pública da API.
// Exemplo: https://sua-api.onrender.com
const API_URL = "https://sistema-eventos-backend.onrender.com";

const form = document.querySelector("#event-form");
const eventsList = document.querySelector("#events-list");
const formMessage = document.querySelector("#form-message");
const submitButton = form.querySelector("button[type='submit']");
const refreshButton = document.querySelector("#refresh-button");

function formatDateForDatabase(dateValue) {
  const [year, month, day] = dateValue.split("-");
  return `${day}/${month}/${year}`;
}

function showMessage(message, type = "") {
  formMessage.textContent = message;
  formMessage.className = `form-message ${type}`;
}

function createEventCard(evento) {
  const card = document.createElement("article");
  card.className = "event-card";

  const top = document.createElement("div");
  top.className = "event-card-top";

  const title = document.createElement("h3");
  title.textContent = evento.titulo;

  const date = document.createElement("span");
  date.className = "event-date";
  date.textContent = evento.data_evento;

  const description = document.createElement("p");
  description.className = "event-description";
  description.textContent = evento.descricao || "Sem descrição informada.";

  const location = document.createElement("div");
  location.className = "event-location";
  const locationIcon = document.createElement("span");
  locationIcon.textContent = "⌖";
  location.append(locationIcon, document.createTextNode(evento.local));

  top.append(title, date);
  card.append(top, description, location);
  return card;
}

async function loadEvents() {
  if (API_URL.startsWith("COLE_AQUI")) {
    eventsList.innerHTML = '<div class="empty-state"><strong>Backend ainda não configurado</strong>Publique a API no Render e informe a URL no arquivo script.js.</div>';
    return;
  }

  eventsList.innerHTML = '<div class="loading-state">Carregando eventos...</div>';

  try {
    const response = await fetch(`${API_URL}/api/eventos`);
    if (!response.ok) throw new Error("Falha ao consultar a API.");

    const eventos = await response.json();
    eventsList.replaceChildren();

    if (!eventos.length) {
      eventsList.innerHTML = '<div class="empty-state"><strong>Nenhum evento cadastrado</strong>Use o formulário para adicionar o primeiro evento.</div>';
      return;
    }

    eventos.forEach((evento) => eventsList.appendChild(createEventCard(evento)));
  } catch (error) {
    eventsList.innerHTML = '<div class="empty-state"><strong>Não foi possível carregar os eventos</strong>Verifique se a API do Render está publicada e tente novamente.</div>';
    console.error(error);
  }
}

form.addEventListener("submit", async (event) => {
  event.preventDefault();

  if (API_URL.startsWith("COLE_AQUI")) {
    showMessage("Configure primeiro a URL pública do backend no arquivo script.js.", "error");
    return;
  }

  const formData = new FormData(form);
  const evento = {
    titulo: formData.get("titulo").trim(),
    descricao: formData.get("descricao").trim(),
    data_evento: formatDateForDatabase(formData.get("data_evento")),
    local: formData.get("local").trim()
  };

  submitButton.disabled = true;
  submitButton.querySelector("span").textContent = "Cadastrando...";
  showMessage("");

  try {
    const response = await fetch(`${API_URL}/api/eventos`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(evento)
    });

    const result = await response.json();
    if (!response.ok) throw new Error(result.erro || "Não foi possível cadastrar.");

    form.reset();
    showMessage("Evento cadastrado com sucesso!", "success");
    await loadEvents();
  } catch (error) {
    showMessage(error.message, "error");
  } finally {
    submitButton.disabled = false;
    submitButton.querySelector("span").textContent = "Cadastrar evento";
  }
});

refreshButton.addEventListener("click", loadEvents);
loadEvents();
