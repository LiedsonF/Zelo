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
                dosesDeHoje.push({ nome: remedio.nome, dose: remedio.dose, horario });
            });
        });

        dosesDeHoje.sort((a, b) => String(a.horario).localeCompare(String(b.horario)));

        dosesDeHoje.forEach(item => {
            const card = document.createElement("div");
            card.className = "box box-proximas";
            card.innerHTML = `
                <div class="info-medicamento">
                    <h4></h4>
                    <p></p>
                </div>
                <button class="btn-tomei" type="button">Tomei</button>`;
            card.querySelector("h4").textContent = item.nome;
            card.querySelector("p").textContent = `${item.dose} . ${item.horario}`;
            secaoProximas.append(card);
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
        const checkboxTodos = document.querySelector('input[name="dias"][value="todos"]');
        const checkboxesDias = document.querySelectorAll('input[name="dias"]:not([value="todos"])');

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

            window.location.href = "./index.html";
        });
    }

    // ------------------JS Arthur----------------------- //
    const btnTomei = document.querySelectorAll(".btn-tomei");
    const containerTomadas = document.getElementById("container-tomadas");

    if (containerTomadas) {
        btnTomei.forEach((botao) => {
            const boxInicial = botao.closest(".box");
            if (!boxInicial) return;

            const originalContainer = botao.closest(".container, .container-proximas");
            const classText = boxInicial.className;
            const statusMed = boxInicial.querySelector(".status-medicamento");

            botao.addEventListener("click", () => {
                const boxBotao = botao.closest(".box");
                if (!boxBotao) return;

                if (botao.className === "btn-tomei") {
                    containerTomadas.appendChild(boxBotao);
                    boxBotao.className = "box box-tomadas";

                    const tagA = document.createElement("a");
                    const tagImg = document.createElement("img");
                    tagImg.src = "images/check.svg";
                    tagImg.alt = "Check";
                    tagA.appendChild(tagImg);
                    boxBotao.prepend(tagA);

                    const statusAtual = boxBotao.querySelector(".status-medicamento");
                    if (statusAtual) statusAtual.remove();

                    botao.className = "btn-desfazer";
                    botao.textContent = "Desfazer";

                    const botaoExcluir = document.createElement("button");
                    botaoExcluir.className = "btn-excluir";
                    botaoExcluir.textContent = "Excluir";
                    botaoExcluir.type = "button";

                    botaoExcluir.addEventListener("click", () => {
                        const confirmar = confirm("Deseja excluir este medicamento da lista de tomadas?");
                        if (confirmar) {
                            boxBotao.remove();
                            atualizarProgresso();
                        }
                    });

                    boxBotao.appendChild(botaoExcluir);
                } else if (botao.className === "btn-desfazer") {
                    if (originalContainer) {
                        originalContainer.appendChild(boxBotao);
                    }
                    boxBotao.className = classText;

                    const tagA = boxBotao.querySelector("a");
                    if (tagA) tagA.remove();

                    const btnExcluir = boxBotao.querySelector(".btn-excluir");
                    if (btnExcluir) btnExcluir.remove();

                    if (statusMed !== null) {
                        botao.before(statusMed);
                    }

                    botao.className = "btn-tomei";
                    botao.textContent = "Tomei";
                }

                atualizarProgresso();
            });
        });
    }

    atualizarProgresso();
}

if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", iniciarApp);
} else {
    iniciarApp();
}