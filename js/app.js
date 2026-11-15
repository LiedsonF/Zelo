


// GUARDAR HORARIO ATUAL PARA COMPARAR COM O DAS DOSES REGISTRADAS -  return => True: Atrasado.
function estaAtrasada(horario) {
    const dataAtual = new Date();
    const horaAtual = String(dataAtual.getHours()).padStart(2, "0");
    const minAtual = String(dataAtual.getMinutes()).padStart(2, "0");
    const horaMinFormat = `${horaAtual}:${minAtual}`;
    return horario < horaMinFormat;
}

// FUNCAO PARA PEGAR A DATA ATUAL - uso posteriormente
function dataDeHoje() {
    const data = new Date();
    const ano = String(data.getFullYear());
    const mes = String(data.getMonth() + 1).padStart(2, '0');
    const dia = String(data.getDate()).padStart(2, '0');
    return `${ano}-${mes}-${dia}`;
}

// FUNÇAO PARA LER NO LOCAL STORAGE OS REMÉDIOS TOMADOS - SEPARADAMENTE DOS OUTROS
function lerTomadas() {
    try {
        const dados = JSON.parse(localStorage.getItem("tomadas"));
        return Array.isArray(dados) ? dados : [];
    } catch (erro) {
        return [];
    }
}


function iniciarApp() {
    // DATA ATUAL
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

    // ATUALIZAR PROGRESSO
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

    // MOSTRAR REMÉDIOS CADASTRADOS
    const secaoProximas = document.querySelector(".container-proximas");
    const secaoAtrasadas = document.querySelector('.container-atrasadas');
    const secaoTomadas = document.querySelector('.container-tomadas');

    if (secaoProximas) {
        const diasSemana = ["dom", "seg", "ter", "qua", "qui", "sex", "sab"];
        const hoje = diasSemana[new Date().getDay()];
        let remediosSalvos = [];

        try {
            const dados = JSON.parse(localStorage.getItem("remedios"));
            remediosSalvos = Array.isArray(dados) ? dados : [];
        } catch (erro) {
            remediosSalvos = [];
        }

        const dosesDeHoje = [];

        remediosSalvos.forEach(remedio => {
            if (!remedio || !Array.isArray(remedio.dias) || !Array.isArray(remedio.horarios)) return;

            const tomaHoje = remedio.dias.includes("todos") || remedio.dias.includes(hoje);
            if (!tomaHoje) return;

            remedio.horarios.forEach(horario => {
                dosesDeHoje.push({ nome: remedio.nome, dose: remedio.dose, horario, id: remedio.id });
            });
        });

        dosesDeHoje.sort((a, b) => String(a.horario).localeCompare(String(b.horario)));

        dosesDeHoje.forEach(item => {
            const atrasada = estaAtrasada(item.horario);
            const jaTomada = lerTomadas().some(registro =>
                registro.id === String(item.id) &&
                registro.horario === String(item.horario) &&
                registro.data === dataDeHoje()
            );
            const card = document.createElement("div");
            card.innerHTML = `
                <div class="info-medicamento">
                    <h4></h4>
                    <p></p>
                </div>
                <button class="btn-tomei" type="button">Tomei</button>`;
            card.querySelector("h4").textContent = item.nome;
            card.querySelector("p").textContent = `${item.dose} . ${item.horario}`;
            card.dataset.id = item.id;
            card.dataset.horario = item.horario;
            if (jaTomada) {
                card.className = 'box box-tomadas';
                const botaoCard = card.querySelector('.btn-tomei');
                botaoCard.className = 'btn-desfazer';
                botaoCard.textContent = 'Desfazer';
                const tagA = document.createElement("a");
                const tagImg = document.createElement("img");
                
                tagImg.src = "images/check.svg";
                tagImg.alt = "Check";
                
                tagA.appendChild(tagImg);
                card.prepend(tagA);
                secaoTomadas.append(card);
            }
            else if (atrasada) {
                card.className = 'box box-atrasada';
                const divStatus = document.createElement('div');
                divStatus.className = 'status-medicamento';
                divStatus.innerHTML = `<span>!</span>`;
                card.querySelector('.btn-tomei').before(divStatus);
                secaoAtrasadas.append(card);
            } else {
                card.className = "box box-proximas";
                secaoProximas.append(card);
            }
        });
    }

    // CADASTRO DE MEDICAMENTOS
    const formulario = document.getElementById("form-remedio");

    if (formulario) {
        const listaHorarios = document.getElementById("lista-horarios");
        const botaoAdicionarHorario = document.getElementById("btn-add-horario");

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
                if (valorDigitado.length > 4) valorDigitado = valorDigitado.slice(0, 4);
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

        // HORÁRIOS INICIAIS
        document.querySelectorAll(".horario").forEach(horario => {
            const texto = horario.querySelector("span");
            const inputExistente = horario.querySelector("input");
            const valorInicial = texto
                ? texto.textContent.trim()
                : (inputExistente ? inputExistente.value.trim() : "");
            const novoCampo = criarCampoHorario(valorInicial);
            horario.replaceWith(novoCampo);
        });

        // ADICIONAR HORÁRIO
        if (botaoAdicionarHorario && listaHorarios) {
            botaoAdicionarHorario.addEventListener("click", () => {
                const novoHorario = criarCampoHorario();
                if (botaoAdicionarHorario.parentNode === listaHorarios) {
                    listaHorarios.insertBefore(novoHorario, botaoAdicionarHorario);
                } else {
                    listaHorarios.appendChild(novoHorario);
                }
                novoHorario.querySelector("input").focus();
            });
        } else {
            console.warn("Elemento #btn-add-horario ou #lista-horarios não encontrado.");
        }

        // FREQUÊNCIA
        const checkboxTodos = document.querySelector(
            'input[name="dias"][value="todos"]'
        );

        const checkboxesDias = document.querySelectorAll(
            'input[name="dias"]:not([value="todos"])'
        );

        if (checkboxTodos) {
            checkboxTodos.addEventListener("change", () => {
                if (checkboxTodos.checked) {
                    checkboxesDias.forEach(checkbox => {
                        checkbox.checked = false;
                    });
                }
            });
        }

        checkboxesDias.forEach(checkbox => {
            checkbox.addEventListener("change", () => {
                if (checkbox.checked && checkboxTodos) {
                    checkboxTodos.checked = false;
                }
            });
        });

        // SALVAR REMÉDIO
        const horarioValido = h => /^([01]\d|2[0-3]):[0-5]\d$/.test(h);

        formulario.addEventListener("submit", (evento) => {
            evento.preventDefault();

            const nomeEl = document.getElementById("nome-remedio");
            const doseEl = document.getElementById("dose-remedio");
            const obsEl = document.getElementById("obs-remedio");

            const containerHorarios = listaHorarios || formulario;
            const horarios = [...containerHorarios.querySelectorAll(".horario input")]
                .map(i => i.value.trim());

            const dias = [...document.querySelectorAll('input[name="dias"]:checked')]
                .map(c => c.value);

            const remedio = {
                nome: nomeEl ? nomeEl.value.trim() : "",
                id: Date.now(),
                dose: doseEl ? doseEl.value.trim() : "",
                horarios,
                dias,
                observacoes: obsEl ? obsEl.value.trim() : ""
            };

            if (!remedio.nome || !remedio.dose) {
                alert("Preencha o nome e a dose do medicamento.");
                return;
            }

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
                const dados = JSON.parse(localStorage.getItem("remedios"));
                remedios = Array.isArray(dados) ? dados : [];
            } catch (erro) {
                remedios = [];
            }

            remedios.push(remedio);
            localStorage.setItem("remedios", JSON.stringify(remedios));

            window.location.href = "./solucao.html";
        });
    }

    // ------------------BOTOES TOMEI/DESFAZER----------------------- //
    const btnTomei = document.querySelectorAll(".btn-tomei, .btn-desfazer");
    const containerTomadas = document.getElementById("container-tomadas");

    if (containerTomadas) {
        btnTomei.forEach(botao => {

            

            botao.addEventListener("click", () => {

                const boxBotao = botao.closest(".box");
                if (!boxBotao) return;

                if (botao.classList.contains("btn-tomei")) {
                    const tomadas = lerTomadas();
                    tomadas.push({ id: boxBotao.dataset.id, horario: boxBotao.dataset.horario, data: dataDeHoje() });
                    localStorage.setItem("tomadas", JSON.stringify(tomadas));
                    containerTomadas.appendChild(boxBotao);
                    boxBotao.className = "box box-tomadas";

                    const tagA = document.createElement("a");
                    const tagImg = document.createElement("img");

                    tagImg.src = "images/check.svg";
                    tagImg.alt = "Check";

                    tagA.appendChild(tagImg);
                    boxBotao.prepend(tagA);

                    const statusAtual = boxBotao.querySelector(
                        ".status-medicamento"
                    );

                    if (statusAtual) statusAtual.remove();

                    botao.className = "btn-desfazer";
                    botao.textContent = "Desfazer";

                } else if (botao.classList.contains("btn-desfazer")) {
                    const tomadas = lerTomadas();
                    const restantes = tomadas.filter(registro => !(
                        registro.id === boxBotao.dataset.id &&
                        registro.horario === boxBotao.dataset.horario &&
                        registro.data === dataDeHoje()
                    ));
                    localStorage.setItem("tomadas", JSON.stringify(restantes));
                    location.reload();

                }

                atualizarProgresso();
            });
        });
    }


    // ========================================
    // EXCLUIR TODO O HISTÓRICO
    // ========================================

    const btnExcluirHistorico = document.querySelector(".box-1-header .btn-excluir");

    if (btnExcluirHistorico) {
        btnExcluirHistorico.addEventListener("click", () => {

            const confirmar = confirm(
                "Isso excluirá todos os remédios cadastrados. Deseja continuar?"
            );

            if (confirmar) {
                localStorage.removeItem("remedios");
                localStorage.removeItem("tomadas");
                location.reload();
            }
        });
    }
    const dataAoAbrir = dataDeHoje();
    if (secaoProximas) {
        setInterval(() => {
            const cardsProximas = [...document.querySelectorAll('.box-proximas')];
            const algumaAtrasou = cardsProximas.some(card => estaAtrasada(card.dataset.horario));
            const virouDia = dataAoAbrir !== dataDeHoje();
            if (algumaAtrasou || virouDia) {
                location.reload();
            }
        }, 30000);
    }
  
    atualizarProgresso();
}


// ========================================
// INICIAR APLICAÇÃO
// ========================================

if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", iniciarApp);
} else {
    iniciarApp();
}
