// var enviarNotas = document.getElementById("textareaID");
// enviarNotas.addEventListener("keydown", function (e) {
//    if (e.code === "Enter") {
//       //   validate(e);
//       imprime()
//    }
// });

// function validate(e) {
//     var text = e.target.value;
//     //validation of the input...
// }

var notasDefault = `
    [{
      "nota": "1929655",
      "status": "0"
    },
    {
      "nota": "1929653",
      "status": "1"
    },
    {
      "nota": "1929654",
      "status": "0"
    }]
    `;

var sysDefault = `
    [{
      "sys": "600",
      "status": "0"
    },
    {
      "sys": "602",
      "status": "0"
    },
    {
      "sys": "604",
      "status": "0"
    }]
    `;

var mainList = []
var subList = []
const siteSAP = "https://launchpad.support.sap.com/#/notes/"

class Nota {
   constructor(nota, status) {
      this.nota = nota;
      this.status = status;
   }
}

class System {
   constructor(sys, status) {
      this.sys = sys;
      this.status = status;
   }
}

// grava notas no storage
function gravarNotas() {

   // recebe o conteúdo da textarea
   let textAreaContent = document.getElementById("notas_adicionar")

   // valida se vazio
   if (textAreaContent.value == "") {
      alert("Lista vazia!")
      return false
   }

   // divide o conteúdo em linhas
   let linhas = textAreaContent.value.split("\n");

   let notasUnicas = new Set()

   for (let i = 0; i < linhas.length; i++) {
      if (linhas[i].length < 1) { //elimina linhas vazias
         continue
      }
      notasUnicas.add(linhas[i])
   }

   // ordena as notas
   let notasAdicionar = Array.from(notasUnicas).sort()

   // recebe uma cópia das notas do storage
   let copiaNotas = mainList

   // checa se a nota já foi adicionada ao storage
   if (copiaNotas) { //checa se vazio primeiro

      for (let i = 0; i < copiaNotas.length; i++) {
         if (notasAdicionar.includes(copiaNotas[i].nota)) {
            notasAdicionar.splice(copiaNotas[i], 1)
               --i
         }
      }
   }

   for (let i = 0; i < notasAdicionar.length; i++) {
      mainList.push(new Nota(notasAdicionar[i], 0))
   }

   localStorage.setItem("__notas_principais__", JSON.stringify(mainList))

   document.getElementById('notas_adicionar').value = ""; //limpa campos
   $("#modalRegistro").modal("hide")

   alert("Foram adicionadas " + notasAdicionar.length + " notas")
   listarNotas()
}

//lista todas as tabelas
function listarNotas() {

   // tabela de notas
   let html = "<table>"

   if (mainList) {

      // ordena por nota de forma ascendente
      // let sorted = Array.from(mainList).sort((a, b) => (a.nota > b.nota) ? 1 : -1)

      // ordena por id = 0, depois por ordem crescente
      let sorted = Array.from(mainList).sort((a, b) => ((b.status == 0) ? 1 : -1) || ((a.nota > b.nota) ? 1 : -1))

      for (let i = 0; i < sorted.length; i++) {
         let refNote = ""
         let refBtn = ""
         if (sorted[i].status == 1) { //coloca estilo taxado
            refNote = `<td><s>${sorted[i].nota}</s></td>`
            refBtn = `<td><button type='button' class='btn btn-primary' disabled><i class='fa fa-tasks' /></button></td>`
         } else {
            refNote = `<td><a href="${siteSAP}${sorted[i].nota}" target="_blank">${sorted[i].nota}</a></td>`
            refBtn = `<td><button type='button' class='btn btn-primary' data-toggle="modal" data-target="#modalSub"
            onclick="prepararBtnSub(${sorted[i].nota}, 1)"><i class='fa fa-tasks' /></button></td>`
         }

         html += `
   <tr>
      ${refNote}${refBtn}
   </tr>
   `;
      }

      html += "</table>"
   } else {
      html = "<h2>ainda não há notas</h2>"
   }

   document.getElementById("listar_notas").innerHTML = html;

   // tabela de subnotas
   html = "<table>"

   if (subList) {


      // ordena
      sorted = Array.from(subList).sort((a, b) => ((b.status == 0) ? 1 : -1) || ((a.nota > b.nota) ? 1 : -1))

      for (let i = 0; i < sorted.length; i++) {
         let refNote = ""
         let refBtn = ""
         if (sorted[i].status == 1) { //coloca estilo taxado
            refNote = `<td><s>${sorted[i].nota}</s></td>`
            refBtn = `<td><button type='button' class='btn btn-primary' disabled><i class='fa fa-tasks' /></button></td>`
         } else {
            refNote = `<td><a href="${siteSAP}${sorted[i].nota}" target="_blank">${sorted[i].nota}</a></td>`
            refBtn = `<td><button type='button' class='btn btn-primary' data-toggle="modal" data-target="#modalSub"
            onclick="prepararBtnSub(${sorted[i].nota}, 2)"><i class='fa fa-tasks' /></button></td>`
         }

         html += `
   <tr>
      ${refNote}${refBtn}
   </tr>
   `;
      }

      html += "</table>"
   } else {
      html = "<h2>ainda não há notas</h2>"
   }

   document.getElementById("listar_subnotas").innerHTML = html;

   listarTotais()

   function listarTotais(){

      let html = `
      <p>Total de Notas: ${mainList.length}<br>
      Total de Subnotas: ${subList.length}</p>
      `

      document.getElementById("listar_totais").innerHTML = html;
   }
}

// define propriedades para chamar o gravarSubnotas
function prepararBtnSub(nota, tipo) {

   document.getElementById('modalSubLabel').innerHTML = `
   Tabela de notas para <a href="${siteSAP}${nota}" target="_blank">${nota}</a>
   `;
   document.getElementById("btnSalvarSub").setAttribute('onClick', 'gravarSubNotas(' + nota + ', false, ' + tipo + ')');
   document.getElementById("btnZeroSub").setAttribute('onClick', 'gravarSubNotas(' + nota + ', true, ' + tipo + ')');
}

// grava subnotas
function gravarSubNotas(nota, nda, tipo) {

   if (nda) { //true
      let _confirm = confirm("Não há notas a serem aplicadas? Tem certeza?")

      if (_confirm) {
         alert("Definido como OK!")
         document.getElementById('primeira_linha').value = ""; //limpa campos
         document.getElementById('subnotas_adicionar').value = "";
         defineOK(nota, tipo)
         $("#modalSub").modal("hide")
         listarNotas()
         return
      } else {
         return false
      }

   }

   let sistema = validaSistema(true)

   let textAreaContent = document.getElementById("subnotas_adicionar")
   let primeiraLinha = document.getElementById("primeira_linha").value

   let subNotas = new Set()

   if (textAreaContent.value == "") {
      alert("Lista vazia!")
      return false
   }

   // posicao da nota
   let lastNotePos = primeiraLinha.length
   let firstNotePos = primeiraLinha.length - 7

   // posicao do sistema
   let lastSysPos = primeiraLinha.length - 8
   let firstSysPos = primeiraLinha.length - 11
   let linhas = textAreaContent.value.split("\n");

   let qtdNotas = 0

   for (let i = 0; i < linhas.length; i++) {

      if (linhas[i].length < 1) { //elimina linhas vazias
         continue
      }

      if (sistema == linhas[i].substring(firstSysPos, lastSysPos)) {
         qtdNotas++
         subNotas.add(linhas[i].substring(firstNotePos, lastNotePos))
      }
   }

   // ordena as notas
   let notasAdicionar = Array.from(subNotas).sort()

   // recebe uma cópia das notas do storage
   let copiaNotas = subList

   // checa se a nota já foi adicionada ao storage
   if (copiaNotas) { //checa se vazio primeiro

      for (let i = 0; i < copiaNotas.length; i++) {
         if (notasAdicionar.includes(copiaNotas[i].nota)) {
            notasAdicionar.splice(copiaNotas[i], 1)
               --i
         }
      }
   }

   for (let i = 0; i < notasAdicionar.length; i++) {
      subList.push(new Nota(notasAdicionar[i], 0))
   }

   localStorage.setItem("__notas_sub__", JSON.stringify(subList))

   document.getElementById('primeira_linha').value = ""; //limpa campos
   document.getElementById('subnotas_adicionar').value = "";
   defineOK(nota, tipo)
   $("#modalSub").modal("hide")

   if (notasAdicionar.length > 0) {
      alert("Foram adicionadas " + notasAdicionar.length + " notas")
   } else {
      alert("As notas submetidas já foram adicionadas")
   }

   listarNotas()

}

// risca notas levantadas
function defineOK(nota, tipo) {
   if (tipo == 1) {
      for (i = 0; i < mainList.length; i++) {
         if (mainList[i].nota == nota) mainList[i].status = 1
      }

      localStorage.setItem("__notas_principais__", JSON.stringify(mainList))
   } else if (tipo == 2) {
      for (i = 0; i < subList.length; i++) {
         if (subList[i].nota == nota) subList[i].status = 1
      }
      localStorage.setItem("__notas_sub__", JSON.stringify(subList))
   }

}

// carrega opções radio do sistema
function lerRadioSistema() {

   let html = '<form action="/action_page.php">'

   for (let i = 0; i < sysRadio.length; i++) {

      if (sysRadio[i].status == 1) {
         html += `<input type="radio" id="${sysRadio[i].sys}" name="sysType" value="${sysRadio[i].sys}" onchange="atualizaRadioAtivo()" checked></input>`
      } else {
         html += `<input type="radio" id="${sysRadio[i].sys}" name="sysType" value="${sysRadio[i].sys}" onchange="atualizaRadioAtivo()"></input>`
      }

      html += `<label for="${sysRadio[i].sys}">${sysRadio[i].sys}</label><br>`
   }

   // html =
   // `<form action="/action_page.php">
   //    <input type="radio" id="600" name="sysType" value="600">
   //    <!--checked-->
   //    <label for="600">600</label><br>
   //    <input type="radio" id="604" name="sysType" value="604">
   //    <label for="604">604</label><br>
   //    <input type="radio" id="608" name="sysType" value="608">
   //    <label for="608">608</label>
   // </form>`

   html += '</form>'

   html += `
      <label for="outro_sys">Outro</label>
      <input id="outro_sys" type="text" placeholder="Ex: 700" size="4" maxlength="4" />
      <button type="button" class="btn btn-primary" onclick="incluiSistema()"><i class="fa fa-arrow-up"></i></button>
   `;

   document.getElementById("listar_system").innerHTML = html;
}

function validaSistema(retorno = false) {

   let sistema = ""

   // Obtendo o sistema selecionado
   let radios = document.getElementsByName('sysType');

   for (var i = 0; i < radios.length; i++) {
      if (radios[i].checked) {
         sistema = radios[i].value
         break;
      }
   }

   if (sistema == "") {

      document.getElementById("add_nota").disabled = true;

      alert("Selecione um sistema!")

      setTimeout(() => { //desabilita o botão por 3 segundos
         document.getElementById("add_nota").disabled = false;
      }, 3000);

      return false
   }

   if (retorno == true) {
      return sistema
   }
}

function incluiSistema() {

   let _confirm = confirm("O sistema " + $(outro_sys).val() + " será adicionado à lista, OK?")

   if (_confirm) {
      sysRadio.push(new System($(outro_sys).val(), 1))
      localStorage.setItem("__sys_type__", JSON.stringify(sysRadio))
      alert("Adicionado!")
      $(outro_sys).val("")
      lerRadioSistema()
   }
}

function atualizaRadioAtivo() {

   sysRadio = []

   // Obtendo o sistema selecionado
   let radios = document.getElementsByName('sysType');

   let sistemasUnicos = new Set()

   for (var i = 0; i < radios.length; i++) {
      if (radios[i].checked) {
         sistemasUnicos.add(new System(radios[i].value, 1))
      } else {
         sistemasUnicos.add(new System(radios[i].value, 0))
      }
   }

   // ordenando sistemas
   let systemAdicionar = Array.from(sistemasUnicos).sort((a, b) => (a.sys > b.sys) ? 1 : -1)

   localStorage.setItem("__sys_type__", JSON.stringify(systemAdicionar))
   document.location.reload(true);

}

// acesso e deleção de dados do Storage
function lerStorage() {

   sysRadio = JSON.parse(localStorage.getItem("__sys_type__"))
   if (!sysRadio) {
      sysRadio = JSON.parse(sysDefault)
   }

   // mainList = JSON.parse(notasDefault)
   mainList = JSON.parse(localStorage.getItem("__notas_principais__"))
   if (!mainList) { //se nulo, seta um array vazio
      mainList = []
   }

   subList = JSON.parse(localStorage.getItem("__notas_sub__"))
   if (!subList) { //se nulo, seta um array vazio
      subList = []
   }
}

function limparStorage() {

   let _confirm = confirm("CUIDADO: deseja reiniciar o processo de levantamento? Perderá o progresso.")

   if (_confirm) {

      localStorage.removeItem("__sys_type__");
      localStorage.removeItem("__notas_principais__");
      localStorage.removeItem("__notas_sub__");

      alert("Excluído com sucesso!")

      document.location.reload(true);
   }

}

function exibeSuporte(info, show = false) {

   if (info == 1 && show == true) {
      document.getElementById("suporte").style.display = "block";
      document.getElementById("btnSuporte").setAttribute("onClick", "exibeSuporte(" + info + ")");
   } else if (info == 1 && show == false) {
      document.getElementById("suporte").style.display = "none";
      document.getElementById("btnSuporte").setAttribute("onClick", "exibeSuporte(" + info + "," + true + ")");
   }

}

window.onload = lerStorage(), lerRadioSistema(), listarNotas(); // carrega a tabela junto com a página