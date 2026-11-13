//DATA ATUAL
const dataAtual = new Date();

const dataFormatada = new Intl.DateTimeFormat("pt-BR", {
    weekday: "long",
    day: "numeric",
    month: "long"
}).format(dataAtual);

const elementoData = document.getElementById("data-atual");

if (elementoData) {
    elementoData.textContent = dataFormatada
        .replace("-feira", "")
        .replace(/^./, letra => letra.toUpperCase());
}

//ATUALIZAR PROGRESSO
function atualizarProgresso() {
    const dosesTomadas = document.querySelectorAll(".box-tomadas").length;
    const dosesAtrasadas = document.querySelectorAll(".box-atrasada").length;
    const dosesProximas = document.querySelectorAll(".box-proximas").length;

    const totalDoses = dosesTomadas + dosesAtrasadas + dosesProximas;

    const percentual = totalDoses === 0
    ? 0
    : Math.round((dosesTomadas / totalDoses) * 100);

    const texto = document.getElementById("texto-progresso");
    const porcentagem = document.getElementById("porcentagem-progresso");
    const barra = document.getElementById("barra-preenchimento");

 if (texto) {
        texto.textContent = `${dosesTomadas} de ${totalDoses} doses tomadas`;
    }
if (porcentagem) {
        porcentagem.textContent = `${percentual}%`;
    }
if (barra) {
        barra.style.width = `${percentual}%`;
    }
}

//NOVO: MOSTRAR REMÉDIOS CADASTRADOS
const secaoProximas = document.querySelector(".container-proximas");

if (secaoProximas) {
    const diasSemana = ["dom", "seg", "ter", "qua", "qui", "sex", "sab"];
    const remediosSalvos = JSON.parse(localStorage.getItem("remedios")) || [];

    remediosSalvos.forEach(remedio => {
        const tomaHoje = remedio.dias.includes("todos") ||
                         remedio.dias.includes(diasSemana[new Date().getDay()]);
        if (!tomaHoje) return;

        remedio.horarios.forEach(horario => {
            const card = document.createElement("div");
            card.className = "box box-proximas";
            card.innerHTML = `
                <div class="info-medicamento">
                    <h4></h4>
                    <p></p>
                </div>
                <button class="btn-tomei">Tomei</button>`;
            card.querySelector("h4").textContent = remedio.nome;
            card.querySelector("p").textContent = `${remedio.dose} . ${horario}`;
            secaoProximas.append(card);
        });
    });
}

atualizarProgresso();

//CADASTRO DE MEDICAMENTOS
const formulario = document.getElementById("form-remedio");

if (formulario) {
    const listaHorarios = document.getElementById("lista-horarios");
    const botaoAdicionarHorario = document.getElementById("btn-add-horario");
    
 //CRIAR CAMPO DE HORÁRIO
    function criarCampoHorario(valor = "") {
        const novoHorario = document.createElement("div");
        novoHorario.classList.add("horario");

    const input = document.createElement("input");
        input.type = "text";
        input.placeholder = "HH:MM";
        input.value = valor;
        input.maxLength = 5;
        input.required = true;
        input.inputMode = "numeric";
        input.autocomplete = "off";
        input.setAttribute("aria-label", "Horário do medicamento");

        input.addEventListener("input", () => {
            let valorDigitado = input.value.replace(/\D/g, "");

    if (valorDigitado.length > 4) {
             valorDigitado = valorDigitado.slice(0, 4);}

    if (valorDigitado.length > 2) {
            valorDigitado = valorDigitado.slice(0, 2) + ":" + valorDigitado.slice(2); }
        input.value = valorDigitado;
        });

        const botaoRemover = document.createElement("button");

        botaoRemover.type = "button";
        botaoRemover.classList.add("btn-remover-horario");
        botaoRemover.setAttribute("aria-label", "Remover horário");
        botaoRemover.textContent = "×";
        botaoRemover.addEventListener("click", () => {
            novoHorario.remove();
        });

        novoHorario.append(input, botaoRemover);

        return novoHorario;}

//HORÁRIOS INICIAIS
    document.querySelectorAll(".horario").forEach(horario => {
        const texto = horario.querySelector("span");
        const valorInicial = texto ? texto.textContent.trim() : "";
        const novoCampo = criarCampoHorario(valorInicial);

        horario.replaceWith(novoCampo);});
//ADICIONAR HORÁRIO
    botaoAdicionarHorario.addEventListener("click", () => {
        const novoHorario = criarCampoHorario();

        listaHorarios.insertBefore(novoHorario, botaoAdicionarHorario);
        novoHorario.querySelector("input").focus();});
//FREQUÊNCIA
    const checkboxTodos = document.querySelector(
        'input[name="dias"][value="todos"]');
    const checkboxesDias = document.querySelectorAll(
        'input[name="dias"]:not([value="todos"])');

    checkboxTodos.addEventListener("change", () => {
        if (checkboxTodos.checked) {
            checkboxesDias.forEach(checkbox => {
                checkbox.checked = false;
            });
        }
    });

    checkboxesDias.forEach(checkbox => {
        checkbox.addEventListener("change", () => {
            if (checkbox.checked) {
                checkboxTodos.checked = false;
            }
        });
    });

//NOVO: SALVAR REMÉDIO
    formulario.addEventListener("submit", (evento) => {
        evento.preventDefault();

        const remedio = {
            nome: document.getElementById("nome-remedio").value.trim(),
            dose: document.getElementById("dose-remedio").value.trim(),
            horarios: [...listaHorarios.querySelectorAll(".horario input")].map(i => i.value),
            dias: [...document.querySelectorAll('input[name="dias"]:checked')].map(c => c.value),
            observacoes: document.getElementById("obs-remedio").value.trim()
        };

        const remedios = JSON.parse(localStorage.getItem("remedios")) || [];
        remedios.push(remedio);
        localStorage.setItem("remedios", JSON.stringify(remedios));

        window.location.href = "./index.html";
    });
}


//------------------JS Arthur-----------------------//

const btnTomei = document.querySelectorAll
('.btn-tomei');
console.log(btnTomei)


const containerTomadas = document.getElementById
('container-tomadas');



btnTomei.forEach((botao) => {
    const originalContainer = botao.closest('.container');
    const classText = botao.closest('.box').className;
    const statusMed = botao.closest('.box').querySelector('.status-medicamento');
    botao.addEventListener(('click'), () => {
        const boxBotao = botao.closest('.box');
        if (botao.className === 'btn-tomei') {
            containerTomadas.appendChild(boxBotao);
            boxBotao.className = 'box box-tomadas';
            const tagA = document.createElement('a');
            const tagImg = document.createElement('img');
            tagImg.src = 'images/check.svg';
            tagImg.alt = 'Check';
            tagA.appendChild(tagImg);
            boxBotao.prepend(tagA);
            if (boxBotao.querySelector('.status-medicamento')) {
                boxBotao.querySelector('.status-medicamento').remove();
            }
            botao.className = 'btn-desfazer';
            botao.textContent = 'Desfazer';
        } else if (botao.className === 'btn-desfazer') {
            originalContainer.appendChild(boxBotao);
            boxBotao.className = classText;
            boxBotao.querySelector('a').remove();
            if (statusMed !== null) {
                botao.before(statusMed);
            }
            botao.className = 'btn-tomei';
            botao.textContent = 'Tomei';
        }    
    })
});

//-------------------------------------------------------//