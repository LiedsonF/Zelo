

const dosesAtrasadas = document.querySelectorAll(".box-atrasada").length;

const dosesProximas = document.querySelectorAll(".box-proximas").length;





    


































































































    



















    














// --------------------------------- Arthur //

const btnTomei = document.querySelectorAll
('.btn-tomei');
console.log(btnTomei)
const dataAtual = new Date();

// const dosesAtrasadas = document.querySelectorAll(".box-atrasada").length;  APENAS LEMBRETE

// const dosesProximas = document.querySelectorAll(".box-proximas").length; APENAS LEMBRETE

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






