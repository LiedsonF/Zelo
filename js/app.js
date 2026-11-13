const dataAtual = new Date();

const dataFormatada = new Intl.DateTimeFormat("pt-BR", {
    weekday: "long",
    day: "numeric",
    month: "long"
}).format(dataAtual);

document.getElementById("data-atual").textContent = dataFormatada;

const dosesTomadas = document.querySelectorAll(".box-tomadas").length;
const dosesAtrasadas = document.querySelectorAll(".box-atrasadas").length;
const dosesProximas = document.querySelectorAll(".box-proximas").length;

const totalDoses = dosesTomadas + dosesAtrasadas + dosesProximas;

const percentual = totalDoses === 0 ? 0