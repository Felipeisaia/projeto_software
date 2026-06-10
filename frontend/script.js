// URL base da API e token JWT
const API_URL = "http://localhost:3000/api/patients"
const TOKEN =
  "SEU_TOKEN_AQUI"
const limitPerPage = 10 // <-- ADICIONE ESTA LINHA AQUI
let currentPage = 1 // Página atual

// =====================
// Seleção de elementos do HTML
// =====================
const searchInput = document.getElementById("searchInput")
const searchBtn = document.getElementById("searchBtn")
const patientList = document.getElementById("patientList")
const patientIdInput = document.getElementById("patientIdInput")
const getPatientByIdBtn = document.getElementById("getPatientByIdBtn")
const patientDetail = document.getElementById("patientDetail")
const updateId = document.getElementById("updateId")
const updateName = document.getElementById("updateName")
const updateEmail = document.getElementById("updateEmail")
const updatePhone = document.getElementById("updatePhone")
const updatePatientBtn = document.getElementById("updatePatientBtn")
const deleteId = document.getElementById("deleteId")
const deletePatientBtn = document.getElementById("deletePatientBtn")

// Elementos do formulário de criação
const createPatientForm = document.getElementById("createPatientForm")
const createName = document.getElementById("createName")
const createPhone = document.getElementById("createPhone")
const createEmail = document.getElementById("createEmail")
const createCpf = document.getElementById("createCpf")
const createBirthDate = document.getElementById("createBirthDate")
const createAddress = document.getElementById("createAddress")
const createCity = document.getElementById("createCity")
const createState = document.getElementById("createState")
const createZipCode = document.getElementById("createZipCode")
const createEmergencyContact = document.getElementById("createEmergencyContact")
const createAllergies = document.getElementById("createAllergies")
const createMedications = document.getElementById("createMedications")
const createNotes = document.getElementById("createNotes")

// Elementos do formulário de edição
const editPatientForm = document.getElementById("editPatientForm")
const editName = document.getElementById("editName")
const editPhone = document.getElementById("editPhone")
const editEmail = document.getElementById("editEmail")
const editCpf = document.getElementById("editCpf")
const editBirthDate = document.getElementById("editBirthDate")
const editAddress = document.getElementById("editAddress")
const editCity = document.getElementById("editCity")
const editState = document.getElementById("editState")
const editZipCode = document.getElementById("editZipCode")
const editEmergencyContact = document.getElementById("editEmergencyContact")
const editAllergies = document.getElementById("editAllergies")
const editMedications = document.getElementById("editMedications")
const editNotes = document.getElementById("editNotes")

const newPatientBtn = document.getElementById("newPatientBtn")
const newPatientModal = document.getElementById("newPatientModal")
const patientModal = document.getElementById("patientModal")
const editPatientModal = document.getElementById("editPatientModal")

// =====================
// Cadastrar paciente
// =====================
async function createPatient(event) {
  event.preventDefault() // Impede o recarregamento da página

  // Monta o objeto com os dados do paciente
  const patientData = {
    name: createName.value.trim(),
    phone: createPhone.value.trim(),
    email: createEmail.value.trim(),
    cpf: createCpf.value.trim(),
    birthDate: createBirthDate.value ? createBirthDate.value : null,
    address: createAddress.value.trim(),
    city: createCity.value.trim(),
    state: createState.value.trim(),
    zipCode: createZipCode.value.trim(),
    emergencyContact: createEmergencyContact.value.trim(),
    allergies: createAllergies.value.trim(),
    medications: createMedications.value.trim(),
    notes: createNotes.value.trim(),
  }

  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(patientData),
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error || "Não foi possível cadastrar o paciente.")
    }

    alert("Paciente cadastrado com sucesso!")
    createPatientForm.reset() // Limpa o formulário
    getPatients() // Atualiza a lista de pacientes na tela
  } catch (err) {
    console.error(err)
    alert(`Erro ao cadastrar paciente: ${err.message}`)
  }
}

//GET PATIENTS
async function getPatients(page = 1) {
  try {
    const search = searchInput.value.trim()

    // Usa a nova constante 'limitPerPage'
    const url = `${API_URL}?page=${page}&limit=${limitPerPage}${search ? `&search=${encodeURIComponent(search)}` : ""}`

    const response = await fetch(url, {
      headers: { Authorization: `Bearer ${TOKEN}` },
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error("API Error:", response.status, errorText)
      throw new Error(`Erro ${response.status}: ${errorText || "Erro ao buscar pacientes"}`)
    }

    const data = await response.json()
    const patients = Array.isArray(data) ? data : data.patients || data.data || []

    patientList.innerHTML = ""

    if (patients.length === 0) {
      patientList.innerHTML =
        '<tr><td colspan="5" style="text-align: center; padding: 20px;">Nenhum paciente encontrado</td></tr>'
      return
    }

    patients.forEach((p) => {
      const tr = document.createElement("tr")
      tr.innerHTML = `
        <td>${p.name}</td>
        <td>${p.cpf || "Não informado"}</td>
        <td>${p.phone || "Não informado"}</td>
        <td>${p.email || "Não informado"}</td>
        <td>
          <div class="action-buttons">
            <button class="btn-action btn-view" onclick="viewPatient('${p.id}')" title="Ver detalhes">
              <i class="fas fa-eye"></i>
            </button>
            <button class="btn-action btn-edit" onclick="editPatient('${p.id}')" title="Editar">
              <i class="fas fa-edit"></i>
            </button>
            <button class="btn-action btn-delete" onclick="confirmDeletePatient('${p.id}')" title="Excluir">
              <i class="fas fa-trash"></i>
            </button>
          </div>
        </td>
      `
      patientList.appendChild(tr)
    })

    currentPage = page
    renderPaginationControls(patients.length)
  } catch (err) {
    console.error("Error in getPatients:", err)
    patientList.innerHTML =
      '<tr><td colspan="5" style="text-align: center; padding: 20px; color: red;">Erro ao carregar pacientes. Verifique a conexão com a API.</td></tr>'
  }
}

// =====================
// Renderizar controles de paginação (CORRIGIDO)
// =====================
function renderPaginationControls(patientsCount) {
  const paginationContainer = document.getElementById("paginationControls")
  paginationContainer.innerHTML = ""

  // Botão "Anterior"
  const prevButton = document.createElement("button")
  prevButton.innerText = "Anterior"
  prevButton.disabled = currentPage === 1
  prevButton.addEventListener("click", () => getPatients(currentPage - 1))
  paginationContainer.appendChild(prevButton)

  // Informação da página
  const pageInfo = document.createElement("span")
  pageInfo.innerText = `Página ${currentPage}`
  paginationContainer.appendChild(pageInfo)

  // Botão "Próximo"
  const nextButton = document.createElement("button")
  nextButton.innerText = "Próximo"
  // Usa a nova constante 'limitPerPage'
  nextButton.disabled = patientsCount < limitPerPage
  nextButton.addEventListener("click", () => getPatients(currentPage + 1))
  paginationContainer.appendChild(nextButton)
}

// =====================
// Buscar paciente por ID
// =====================
async function getPatientById() {
  try {
    const id = patientIdInput.value.trim()
    if (!id) {
      alert("Informe o ID do paciente.")
      return
    }

    patientDetail.innerHTML = "" // Limpa os detalhes anteriores

    const response = await fetch(`${API_URL}/${id}`, {
      headers: { Authorization: `Bearer ${TOKEN}` },
    })

    if (response.ok) {
      const p = await response.json()

      // Monta o HTML com os detalhes básicos do paciente
      let patientHTML = `
        <h3>Detalhes do Paciente</h3>
        <p><strong>ID:</strong> ${p.id}</p>
        <p><strong>Nome:</strong> ${p.name}</p>
        <p><strong>CPF:</strong> ${p.cpf || "Não informado"}</p>
        <p><strong>Email:</strong> ${p.email || "Não informado"}</p>
        <p><strong>Telefone:</strong> ${p.phone}</p>
      `

      // Verifica se existe um histórico de consultas e o adiciona no HTML
      if (p.appointments && p.appointments.length > 0) {
        patientHTML += `<h4>Últimas 10 Consultas:</h4><ul>`
        p.appointments.forEach((app) => {
          const appointmentDate = new Date(app.date).toLocaleDateString("pt-BR")
          patientHTML += `<li>
            <strong>${appointmentDate}</strong> - ${app.treatment || "Consulta de rotina"} (Status: ${app.status})
          </li>`
        })
        patientHTML += `</ul>`
      } else {
        patientHTML += `<p><em>Nenhuma consulta encontrada no histórico.</em></p>`
      }

      patientDetail.innerHTML = patientHTML
    } else {
      const errorData = await response.json()
      throw new Error(errorData.error || `Erro ${response.status}`)
    }
  } catch (err) {
    console.error(err)
    alert(`Erro ao buscar paciente: ${err.message}`)
    patientDetail.innerHTML = `<p style="color: red;">${err.message}</p>`
  }
}

// =====================
// Atualizar paciente
// =====================
let currentEditingPatientId = null

async function updatePatient(event) {
  if (event) event.preventDefault()

  try {
    if (!currentEditingPatientId) {
      alert("Erro: ID do paciente não encontrado.")
      return
    }

    const patientData = {
      name: editName.value.trim(),
      phone: editPhone.value.trim(),
      email: editEmail.value.trim(),
      cpf: editCpf.value.trim(),
      birthDate: editBirthDate.value ? editBirthDate.value : null,
      address: editAddress.value.trim(),
      city: editCity.value.trim(),
      state: editState.value.trim(),
      zipCode: editZipCode.value.trim(),
      emergencyContact: editEmergencyContact.value.trim(),
      allergies: editAllergies.value.trim(),
      medications: editMedications.value.trim(),
      notes: editNotes.value.trim(),
    }

    const response = await fetch(`${API_URL}/${currentEditingPatientId}`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(patientData),
    })

    if (!response.ok) throw new Error("Erro ao atualizar paciente")

    alert("Paciente atualizado com sucesso!")
    closeModal("editPatientModal")
    getPatients()
    currentEditingPatientId = null
  } catch (err) {
    console.error(err)
    alert("Erro ao atualizar paciente. Veja o console.")
  }
}

// =====================
// Deletar paciente
// =====================
async function deletePatient() {
  try {
    const id = deleteId.value.trim()
    if (!id) return alert("Informe o ID do paciente.")

    const response = await fetch(`${API_URL}/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${TOKEN}` },
    })

    if (!response.ok) throw new Error("Erro ao deletar paciente")

    alert("Paciente deletado com sucesso!")
    getPatients()
  } catch (err) {
    console.error(err)
    alert("Erro ao deletar paciente. Veja o console.")
  }
}

// =====================
// Modal functions
// =====================
function openModal(modalId) {
  document.getElementById(modalId).style.display = "block"
}

function closeModal(modalId) {
  document.getElementById(modalId).style.display = "none"
}

function viewPatient(id) {
  patientIdInput.value = id
  getPatientById()
  openModal("patientModal")
}

async function editPatient(id) {
  try {
    // Fetch patient data to populate the form
    const response = await fetch(`${API_URL}/${id}`, {
      headers: { Authorization: `Bearer ${TOKEN}` },
    })

    if (!response.ok) throw new Error("Erro ao buscar dados do paciente")

    const patient = await response.json()

    // Store the patient ID for updating
    currentEditingPatientId = id

    // Populate the edit form with patient data
    editName.value = patient.name || ""
    editPhone.value = patient.phone || ""
    editEmail.value = patient.email || ""
    editCpf.value = patient.cpf || ""
    editBirthDate.value = patient.birthDate ? patient.birthDate.split("T")[0] : ""
    editAddress.value = patient.address || ""
    editCity.value = patient.city || ""
    editState.value = patient.state || ""
    editZipCode.value = patient.zipCode || ""
    editEmergencyContact.value = patient.emergencyContact || ""
    editAllergies.value = patient.allergies || ""
    editMedications.value = patient.medications || ""
    editNotes.value = patient.notes || ""

    // Open the edit modal
    openModal("editPatientModal")
  } catch (err) {
    console.error(err)
    alert(`Erro ao carregar dados do paciente: ${err.message}`)
  }
}

function confirmDeletePatient(id) {
  if (confirm("Tem certeza que deseja excluir este paciente?")) {
    deleteId.value = id
    deletePatient()
  }
}

// =====================
// Event listeners
// =====================
createPatientForm.addEventListener("submit", (e) => {
  createPatient(e)
  closeModal("newPatientModal")
})

editPatientForm.addEventListener("submit", updatePatient)

searchBtn.addEventListener("click", () => getPatients(1))
searchInput.addEventListener("keyup", (e) => {
  if (e.key === "Enter") getPatients(1)
})

newPatientBtn.addEventListener("click", () => openModal("newPatientModal"))

getPatientByIdBtn.addEventListener("click", getPatientById)
deletePatientBtn.addEventListener("click", deletePatient)

// =====================
// Modal close functionality
// =====================
document.querySelectorAll(".close").forEach((closeBtn) => {
  closeBtn.addEventListener("click", (e) => {
    const modal = e.target.closest(".modal")
    modal.style.display = "none"
  })
})

window.addEventListener("click", (e) => {
  if (e.target.classList.contains("modal")) {
    e.target.style.display = "none"
  }
})

// =====================
// Carrega lista inicial
// =====================
getPatients()
