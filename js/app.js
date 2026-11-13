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
        texto.textContent = totalDoses === 0
            ? "Nenhuma dose para hoje"
            : `${dosesTomadas} de ${totalDoses} doses tomadas`;
    }
    if (porcentagem) {
        porcentagem.textContent = `${percentual}%`;
    }
    if (barra) {
        barra.style.width = `${percentual}%`;
    }
}

//MOSTRAR REMÉDIOS CADASTRADOS
const secaoProximas = document.querySelector(".container-proximas");

if (secaoProximas) {
    const diasSemana = ["dom", "seg", "ter", "qua", "qui", "sex", "sab"];
    const hoje = diasSemana[new Date().getDay()];
    let remediosSalvos = [];

    try {
        remediosSalvos = JSON.parse(localStorage.getItem("remedios")) || [];
    } catch (erro) {
        remediosSalvos = [];
    }

    // Monta uma lista de doses de hoje e ordena por horário
    const dosesDeHoje = [];

    remediosSalvos.forEach(remedio => {
        const tomaHoje = remedio.dias.includes("todos") || remedio.dias.includes(hoje);
        if (!tomaHoje) return;

        remedio.horarios.forEach(horario => {
            dosesDeHoje.push({ nome: remedio.nome, dose: remedio.dose, horario });
        });
    });

    dosesDeHoje.sort((a, b) => a.horario.localeCompare(b.horario));

    dosesDeHoje.forEach(item => {
        const card = document.createElement("div");
        card.className = "box box-proximas"; // "box" é necessário para o botão Tomei funcionar
        card.innerHTML = `
            <div class="info-medicamento">
                <h4></h4>
                <p></p>
            </div>
            <button class="btn-tomei">Tomei</button>`;
        card.querySelector("h4").textContent = item.nome;
        card.querySelector("p").textContent = `${item.dose} . ${item.horario}`;
        secaoProximas.append(card);
    });
}

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
                valorDigitado = valorDigitado.slice(0, 4);
            }

            if (valorDigitado.length > 2) {
                valorDigitado = valorDigitado.slice(0, 2) + ":" + valorDigitado.slice(2);
            }

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

        return novoHorario;
    }

    //HORÁRIOS INICIAIS
    document.querySelectorAll(".horario").forEach(horario => {
        const texto = horario.querySelector("span");
        const valorInicial = texto ? texto.textContent.trim() : "";
        const novoCampo = criarCampoHorario(valorInicial);

        horario.replaceWith(novoCampo);
    });

    //ADICIONAR HORÁRIO
    botaoAdicionarHorario.addEventListener("click", () => {
        const novoHorario = criarCampoHorario();

        listaHorarios.insertBefore(novoHorario, botaoAdicionarHorario);
        novoHorario.querySelector("input").focus();
    });

    //FREQUÊNCIA
    const checkboxTodos = document.querySelector('input[name="dias"][value="todos"]');
    const checkboxesDias = document.querySelectorAll('input[name="dias"]:not([value="todos"])');

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

    //SALVAR REMÉDIO
    const horarioValido = h => /^([01]\d|2[0-3]):[0-5]\d$/.test(h);

    formulario.addEventListener("submit", (evento) => {
        evento.preventDefault();

        const remedio = {
            nome: document.getElementById("nome-remedio").value.trim(),
            dose: document.getElementById("dose-remedio").value.trim(),
            horarios: [...listaHorarios.querySelectorAll(".horario input")].map(i => i.value),
            dias: [...document.querySelectorAll('input[name="dias"]:checked')].map(c => c.value),
            observacoes: document.getElementById("obs-remedio").value.trim()
        };

        if (remedio.dias.length === 0) {
            alert("Selecione pelo menos um dia.");
            return;
        }

        if (remedio.horarios.length === 0 || !remedio.horarios.every(horarioValido)) {
            alert("Informe horários válidos, no formato HH:MM.");
            return;
        }

        let remedios = [];
        try {
            remedios = JSON.parse(localStorage.getItem("remedios")) || [];
        } catch (erro) {
            remedios = [];
        }

        remedios.push(remedio);
        localStorage.setItem("remedios", JSON.stringify(remedios));

        window.location.href = "./index.html";
    });
}

//------------------JS Arthur-----------------------//

const btnTomei = document.querySelectorAll('.btn-tomei');
const containerTomadas = document.getElementById('container-tomadas');

if (containerTomadas) {
    btnTomei.forEach((botao) => {
        const originalContainer = botao.closest('.container');
        const classText = botao.closest('.box').className;
        const statusMed = botao.closest('.box').querySelector('.status-medicamento');

        botao.addEventListener('click', () => {
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

                // BOTÃO EXCLUIR
                const botaoExcluir = document.createElement('button');

                botaoExcluir.className = 'btn-excluir';
                botaoExcluir.textContent = 'Excluir';
                botaoExcluir.type = 'button';

                botaoExcluir.addEventListener('click', () => {
                    const confirmar = confirm('Deseja excluir este medicamento da lista de tomadas?');

                    if (confirmar) {
                        boxBotao.remove();
                        atualizarProgresso();
                    }
                });

                boxBotao.appendChild(botaoExcluir);

            } else if (botao.className === 'btn-desfazer') {
                originalContainer.appendChild(boxBotao);
                boxBotao.className = classText;
                boxBotao.querySelector('a').remove();

                // Remove o botão excluir ao desfazer
                boxBotao.querySelector('.btn-excluir').remove();

                if (statusMed !== null) {
                    botao.before(statusMed);
                }

                botao.className = 'btn-tomei';
                botao.textContent = 'Tomei';
            }

            atualizarProgresso();
        });
    });
}

//-------------------------------------------------------//

// Calcula o progresso inicial
atualizarProgresso();