// =====================
// Configuração
// =====================
const API_URL = "http://localhost:3000/api/dashboard"
const TOKEN = "SEU_TOKEN_AQUI"
const AUTH_HEADER = { Authorization: `Bearer ${TOKEN}` };
const limitPerPage = 10;
let currentHistoryPage = 1;
let financialChartInstance = null;

// =====================
// Seleção de elementos do HTML
// =====================
const clinicalView = document.getElementById("clinicalView");
const financialView = document.getElementById("financialView");
const showClinicalBtn = document.getElementById("showClinicalBtn");
const showFinancialBtn = document.getElementById("showFinancialBtn");
const totalPatientsElement = document.getElementById("totalPatients");
const todayAppointmentsElement = document.getElementById("todayAppointments");
const nextAppointmentElement = document.getElementById("nextAppointment");
const todayAppointmentsList = document.getElementById("todayAppointmentsList");
const historyAppointmentsList = document.getElementById("historyAppointmentsList");
const periodFilter = document.getElementById("periodFilter");
const applyFilterBtn = document.getElementById("applyFilterBtn");
const refreshTodayBtn = document.getElementById("refreshTodayBtn");
const financialPeriodFilter = document.getElementById("financialPeriodFilter");
const totalRevenueElement = document.getElementById("totalRevenue");
const totalExpensesElement = document.getElementById("totalExpenses");
const netProfitElement = document.getElementById("netProfit");
const salesCountElement = document.getElementById("salesCount");
const topProceduresList = document.getElementById("topProceduresList");
const financialChartCanvas = document.getElementById("financialChart").getContext('2d');
const defaultPeriod = document.getElementById('financialPeriodFilter')?.value || 'month';

// ===============================================
// Funções de Lógica da Interface (UI)
// ===============================================
function showClinicalView() {
    clinicalView.classList.remove('hidden');
    financialView.classList.add('hidden');
    showClinicalBtn.classList.add('active');
    showFinancialBtn.classList.remove('active');
}

function showFinancialView() {
    financialView.classList.remove('hidden');
    clinicalView.classList.add('hidden');
    showFinancialBtn.classList.add('active');
    showClinicalBtn.classList.remove('active');
}

const formatCurrency = (value) => value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

// ===============================================
// Funções de Chamada à API e Renderização
// ===============================================

async function fetchData(endpoint) {
    try {
        const response = await fetch(`${API_URL}${endpoint}`, { headers: AUTH_HEADER });
        if (!response.ok) throw new Error(`Erro na API: ${response.statusText}`);
        return await response.json();
    } catch (err) {
        console.error(`Erro ao buscar dados de ${endpoint}:`, err);
        return null;
    }
}

async function getTotalPatients() {
    const data = await fetchData('/patients-total');
    totalPatientsElement.textContent = data !== null ? data : "Erro";
}

async function getTodayAppointments() {
    const appointments = await fetchData('/today');
    if (!appointments) {
        todayAppointmentsElement.textContent = "Erro";
        nextAppointmentElement.textContent = "Erro";
        todayAppointmentsList.innerHTML = '<tr><td colspan="5" class="error-cell">Erro ao carregar consultas</td></tr>';
        return;
    }
    
    todayAppointmentsElement.textContent = appointments.length;

    const now = new Date();
    const currentTime = now.getHours() * 60 + now.getMinutes();
    const nextAppointment = appointments.find(app => {
        const [hours, minutes] = app.time.split(":").map(Number);
        return (hours * 60 + minutes) > currentTime;
    });
    nextAppointmentElement.textContent = nextAppointment ? nextAppointment.time : "Nenhuma";

    todayAppointmentsList.innerHTML = "";
    if (appointments.length === 0) {
        todayAppointmentsList.innerHTML = '<tr><td colspan="5" class="empty-cell">Nenhuma consulta agendada para hoje</td></tr>';
        return;
    }
    appointments.forEach(app => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
            <td>${app.time}</td>
            <td>${app.patient?.name || "N/A"}</td>
            <td>${app.treatment || "N/A"}</td>
            <td><span class="status-badge status-${app.status.toLowerCase()}">${app.status}</span></td>
            <td><div class="action-buttons"><button class="btn-action btn-view" title="Ver detalhes"><i class="fas fa-eye"></i></button></div></td>`;
        todayAppointmentsList.appendChild(tr);
    });
}

// ==================================================
// FUNÇÕES DO HISTÓRICO (ADICIONADAS)
// ==================================================
async function getAppointmentHistory(page = 1, period = "all") {
    try {
        const url = `/history?page=${page}&limit=${limitPerPage}&period=${period}`;
        const appointments = await fetchData(url);

        if (appointments === null) {
            throw new Error("Falha ao buscar dados do histórico.");
        }

        renderHistoryAppointments(appointments);
        currentHistoryPage = page;
        renderHistoryPaginationControls(appointments.length);
    } catch (err) {
        console.error("Erro ao buscar histórico de consultas:", err);
        historyAppointmentsList.innerHTML = '<tr><td colspan="5" style="text-align: center; color: red;">Erro ao carregar histórico</td></tr>';
    }
}

function renderHistoryAppointments(appointments) {
    historyAppointmentsList.innerHTML = "";

    if (appointments.length === 0) {
        historyAppointmentsList.innerHTML = '<tr><td colspan="5" style="text-align: center;">Nenhuma consulta encontrada no período</td></tr>';
        return;
    }

    appointments.forEach((appointment) => {
        const appointmentDate = new Date(appointment.date).toLocaleDateString("pt-BR", {timeZone: 'UTC'});
        const tr = document.createElement("tr");
        tr.innerHTML = `
            <td>${appointmentDate}</td>
            <td>${appointment.time}</td>
            <td>${appointment.patient?.name || "N/A"}</td>
            <td>${appointment.treatment || "N/A"}</td>
            <td><span class="status-badge status-${appointment.status.toLowerCase()}">${appointment.status}</span></td>`;
        historyAppointmentsList.appendChild(tr);
    });
}

function renderHistoryPaginationControls(appointmentsCount) {
    const paginationContainer = document.getElementById("historyPaginationControls");
    paginationContainer.innerHTML = "";

    const prevButton = document.createElement("button");
    prevButton.innerText = "Anterior";
    prevButton.disabled = currentHistoryPage === 1;
    prevButton.addEventListener("click", () => getAppointmentHistory(currentHistoryPage - 1, periodFilter.value));
    paginationContainer.appendChild(prevButton);

    const pageInfo = document.createElement("span");
    pageInfo.innerText = `Página ${currentHistoryPage}`;
    paginationContainer.appendChild(pageInfo);

    const nextButton = document.createElement("button");
    nextButton.innerText = "Próximo";
    nextButton.disabled = appointmentsCount < limitPerPage;
    nextButton.addEventListener("click", () => getAppointmentHistory(currentHistoryPage + 1, periodFilter.value));
    paginationContainer.appendChild(nextButton);
}


// --- Funções da Visão Financeira ---
async function updateFinancialSummary(period = 'month') {
    const [revenueData, expenseData, salesData] = await Promise.all([
        fetchData(`/revenue/total?period=${period}`),
        fetchData(`/expenses/total?period=${period}`),
        fetchData(`/sales-count?period=${period}`)
    ]);

    const revenue = revenueData ? revenueData.totalRevenue : 0;
    const expenses = expenseData ? expenseData.totalExpenses : 0;
    const sales = salesData ? salesData.salesCount : 0;
    const profit = revenue - expenses;

    totalRevenueElement.textContent = formatCurrency(revenue);
    totalExpensesElement.textContent = formatCurrency(expenses);
    netProfitElement.textContent = formatCurrency(profit);
    salesCountElement.textContent = sales;
}

async function getTopProcedures() {
    const procedures = await fetchData('/procedures/top?limit=5');
    topProceduresList.innerHTML = "";
    if (!procedures || procedures.length === 0) {
        topProceduresList.innerHTML = '<li>Nenhum procedimento encontrado.</li>';
        return;
    }
    procedures.forEach(proc => {
        const li = document.createElement('li');
        li.innerHTML = `<span>${proc.procedure}</span> <span>${proc.count}</span>`;
        topProceduresList.appendChild(li);
    });
}

// Função para renderizar o gráfico financeiro
async function renderFinancialChart(period = 'year') {

    // Verificações se o canvas e se o seu contexto existem
    const canvasElement = document.getElementById('financialChart');
    if (!canvasElement) {
        console.error('Canvas não encontrado');
        return;
    }
    const canvasContext = canvasElement.getContext('2d');
    if (!canvasContext) {
        console.error('Contexto do canvas não encontrado');
        return;
    }

    const data =  await fetchData(`/financial-summary/annual?period=${period}`);

    const labels = data?.labels || ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'];
	const revenueSeries = data?.revenueSeries || Array(labels.length).fill(0);
	const expensesSeries = data?.expensesSeries || Array(labels.length).fill(0);

    // 
    if (financialChartInstance) { 
        financialChartInstance.destroy(); // Destrói o gráfico antigo para não sobrepor o novo (usado quando troca o período)
    }

    // financialChartInstance = new Chart(canvasContext, { // Cria o novo grafico
    //     type: 'bar',
    //     data: {
    //         labels,
    //         datasets: [{
    //             label: 'Faturamento',
    //             data: revenueSeries,
    //             backgroundColor: 'rgba(75, 192, 192, 0.6)',
	// 			borderColor: 'rgba(75, 192, 192, 1)',
	// 			borderWidth: 1
    //         }, {
    //             label: 'Despesas',
    //             data: expensesSeries,
    //             backgroundColor: 'rgba(255, 99, 132, 0.6)',
    //             borderColor: 'rgba(255, 99, 132, 1)',
    //             borderWidth: 1
                
    //         }]
    //     },
    //     options: {
    //         responsive: true,
    //         maintainAspectRatio: true,
    //         plugins: {
    //             tooltip: {
    //                 callbacks: {
    //                     label: (context) => {
    //                         const value = context.parsed.y ?? context.parsed;
    //                         return `${context.dataset.label}: ${formatCurrency(value || 0)}`;
    //                     }
    //                 }
    //             },
    //             legend: { labels: { usePointStyle: true} }
    //         },
    //         scales: {
    //             y: {
    //                 beginAtZero: true,
    //                 ticks: { callback: (value) => formatCurrency(value) }
    //             },
    //             x: {grid: { display: false } }
    //         }
    //     }
    // });


    financialChartInstance = new Chart(canvasContext, {
        type: 'line',
        data: {
          labels,
          datasets: [
            {
              label: 'Faturamento',
              data: revenueSeries,
              borderColor: 'rgba(75, 192, 192, 1)',
              backgroundColor: 'rgba(75, 192, 192, 0.15)',
              tension: 0.35, // curva
              pointRadius: 2,
              fill: true
            },
            {
              label: 'Despesas',
              data: expensesSeries,
              borderColor: 'rgba(255, 99, 132, 1)',
              backgroundColor: 'rgba(255, 99, 132, 0.15)',
              tension: 0.35,
              pointRadius: 2,
              fill: true
            }
          ]
        },
        options: { responsive: true, maintainAspectRatio: true }
      });
}

/*  
    // Usa os dados da API ou arrays vazios em caso de erro
    const revenueByMonth = annualData ? annualData.revenueByMonth : Array(12).fill(0);
    const expensesByMonth = annualData ? annualData.expensesByMonth : Array(12).fill(0);

    if (financialChartInstance) {
        financialChartInstance.destroy(); // Destrói o gráfico antigo
    }

    financialChartInstance = new Chart(financialChartCanvas, {
        type: 'bar',
        data: {
            labels: ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'],
            datasets: [{
                label: 'Faturamento',
                data: revenueByMonth, // <-- USA DADOS REAIS
                backgroundColor: 'rgba(75, 192, 192, 0.6)',
            }, {
                label: 'Despesas',
                data: expensesByMonth, // <-- USA DADOS REAIS
                backgroundColor: 'rgba(255, 99, 132, 0.6)',
            }]
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: (value) => formatCurrency(value)
                    }
                }
            }
        }
    });
*/



// =====================
// Event listeners
// =====================
showClinicalBtn.addEventListener('click', showClinicalView);
showFinancialBtn.addEventListener('click', showFinancialView);
refreshTodayBtn.addEventListener('click', getTodayAppointments);
financialPeriodFilter.addEventListener('change', (e) => {
    const period = e.target.value;
    updateFinancialSummary(e.target.value);
    renderFinancialChart(period);
});

// Listener do Filtro de Histórico (ADICIONADO)
applyFilterBtn.addEventListener("click", () => {
    getAppointmentHistory(1, periodFilter.value);
});


// =====================
// Inicializar dashboard
// =====================
function initializeDashboard() {
    // Funções da visão clínica
    getTotalPatients();
    getTodayAppointments();
    getAppointmentHistory(1, 'all'); // Carrega a primeira página do histórico sem filtro inicialmente

    // Funções da visão financeira (carrega os dados mesmo que escondido)
    updateFinancialSummary('month');
    getTopProcedures();
    renderFinancialChart(defaultPeriod);
    
    // Define a visão clínica como padrão
    showClinicalView();
}

// Carregar dados iniciais
initializeDashboard();