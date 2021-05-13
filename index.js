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
var reqManual = []
const siteSAP = "https://launchpad.support.sap.com/#/notes/"

class Nota {
   constructor(nota, status) {
      this.nota = nota;
      this.status = status;
   }
}

class SubNota extends Nota {
   constructor(grau, notaPai, nota, status) {
      super(nota, status);
      this.grau = grau;
      this.notaPai = notaPai;
   }
}

class PreReq {
   constructor(nota, requisito) {
      this.nota = nota;
      this.requisito = requisito;
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
   let copiaNotas = []

   for (let i = 0; i < mainList.length; i++) {
      copiaNotas.push(mainList[i].nota)
   }

   // checa se a nota já foi adicionada ao storage
   notasAdicionar = validarDiferenca(notasAdicionar, copiaNotas)

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
      let sorted = Array.from(mainList).sort(function (a, b) {
         return a.status - b.status || a.nota - b.nota;
      });

      for (let i = 0; i < sorted.length; i++) {
         let refNote = ""
         let refBtn = ""
         if (sorted[i].status == 1) { //coloca estilo taxado
            refNote = `<td><s>${sorted[i].nota}</s></td>`
            refBtn = `<td><button type='button' class='btn btn-primary' disabled><i class='fa fa-tasks' /></button></td>`
         } else {
            refNote = `<td><a href="${siteSAP}${sorted[i].nota}" target="_blank">${sorted[i].nota}</a></td>`
            refBtn = `<td><button type='button' class='btn btn-primary' data-toggle="modal" data-target="#modalSub"
            onclick="prepararBtnSub(0, ${sorted[i].nota}, 1)"><i class='fa fa-tasks' /></button></td>`
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
      sorted = Array.from(subList).sort(function (a, b) {
         return a.status - b.status || a.nota - b.nota;
      });

      for (let i = 0; i < sorted.length; i++) {
         let refNote = ""
         let refBtn = ""
         if (sorted[i].status == 1) { //coloca estilo taxado
            refNote = `<td><s>${sorted[i].grau}º-${sorted[i].nota}</s></td>`
            refBtn = `<td><button type='button' class='btn btn-primary' disabled><i class='fa fa-tasks' /></button></td>`
         } else {
            refNote = `<td><a href="${siteSAP}${sorted[i].nota}" target="_blank">${sorted[i].grau}º-${sorted[i].nota}</a></td>`
            refBtn = `<td><button type='button' class='btn btn-primary' data-toggle="modal" data-target="#modalSub"
            onclick="prepararBtnSub(${sorted[i].grau}, ${sorted[i].nota}, 2)"><i class='fa fa-tasks' /></button></td>`
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

   function listarTotais() {

      let html = `
      <p>Total de Notas: ${mainList.length}<br>
      Total de Subnotas: ${subList.length}</p>
      `

      document.getElementById("listar_totais").innerHTML = html;
   }
}

// define propriedades para chamar o gravarSubnotas
function prepararBtnSub(grau, notaPai, tipo) {

   // tipo 1 - lista de notas (para riscar da lista)
   // tipo 2 - lista de subnotas (para riscar da lista)

   document.getElementById('modalSubLabel').innerHTML = `
   Tabela de notas para <a href="${siteSAP}${notaPai}" target="_blank">${notaPai}</a>
   `;

   document.getElementById("btnSalvarSub")
      .setAttribute('onClick', 'gravarSubNotas(' + grau + ',' + notaPai + ', false, ' + tipo + ')');

   document.getElementById("btnZeroSub")
      .setAttribute('onClick', 'gravarSubNotas(' + grau + ',' + notaPai + ', true, ' + tipo + ')');
}

// grava subnotas
function gravarSubNotas(grau, notaPai, nda, tipo) {

   // nda - não possui subnotas de pré-requisito

   if (nda) { //true
      let _confirm = confirm("Não há notas a serem aplicadas? Tem certeza?")

      if (_confirm) {
         alert("Definido como OK!")
         document.getElementById('subnotas_adicionar').value = ""; //limpa campos

         console.log("entrou")
         // if (tipo == 1) mainList.push(new SubNota(grau, notaPai, notaPai, 1)) // adiciona a nota pai como requisito

         subList.push(new SubNota(1, notaPai, notaPai, 1))
         localStorage.setItem("__notas_sub__", JSON.stringify(subList))

         defineOK(notaPai, tipo)
         $("#modalSub").modal("hide")
         listarNotas()
         return
      } else {
         return false
      }
   }

   let subNotas = new Set()

   // recebe CTRL + V do site da SAP
   let dadosSite = lerPaginaSap()
   let notasSite = dadosSite[0]
   let reasonSite = dadosSite[1]
   let manualImplement = dadosSite[2]

   reqManual.push(new PreReq(notaPai, manualImplement))
   localStorage.setItem("__req_manual__", JSON.stringify(reqManual))

   for (let i = 0; i < notasSite.length; i++) {
      subNotas.add(notasSite[i])
   }

   // ordena as notas enviadas
   let notasAdicionar = Array.from(subNotas).sort((a, b) => (a > b) ? 1 : -1)

   // recebe uma cópia das notas do storage
   let copiaNotas = []

   for (let i = 0; i < subList.length; i++) {
      copiaNotas.push(subList[i].nota)
   }

   // checa se a nota já foi adicionada ao storage
   notasAdicionar = validarDiferenca(notasAdicionar, copiaNotas)

   // notasAdicionar = validarDiferenca(notasAdicionar, copiaNotas
   grau++;
   for (let i = 0; i < notasAdicionar.length; i++) {
      subList.push(new SubNota(grau, notaPai, notasAdicionar[i], 0))
   }

   document.getElementById('subnotas_adicionar').value = ""; //limpa campos
   defineOK(notaPai, tipo)
   $("#modalSub").modal("hide")

   if (notasAdicionar.length > 0) {
      alert("Foram adicionadas " + notasAdicionar.length + " notas")
   } else {
      alert("As notas submetidas já foram adicionadas")
      subList.push(new SubNota(grau, notaPai, notaPai, 1))
   }

   localStorage.setItem("__notas_sub__", JSON.stringify(subList))

   listarNotas()

}

// valida diferença entre arrays
function validarDiferenca(r1, r2) {
   let r3 = r1.filter(a => !r2.includes(a));
   return r3
}

// risca notas levantadas
function defineOK(notaPai, tipo) {
   if (tipo == 1) {
      for (i = 0; i < mainList.length; i++) {
         if (mainList[i].nota == notaPai) mainList[i].status = 1
      }

      localStorage.setItem("__notas_principais__", JSON.stringify(mainList))
   } else if (tipo == 2) {
      for (i = 0; i < subList.length; i++) {
         if (subList[i].nota == notaPai) subList[i].status = 1
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

   reqManual = JSON.parse(localStorage.getItem("__req_manual__"))
   if (!reqManual) { //se nulo, seta um array vazio
      reqManual = []
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
      document.getElementById("btnSuporte").setAttribute("class", "btn btn-secondary");
      document.getElementById("btnSuporte").setAttribute("onClick", "exibeSuporte(" + info + ")");
   } else if (info == 1 && show == false) {
      document.getElementById("suporte").style.display = "none";
      document.getElementById("btnSuporte").setAttribute("class", "btn btn-primary");
      document.getElementById("btnSuporte").setAttribute("onClick", "exibeSuporte(" + info + "," + true + ")");
   }

}

// exibe tabela e opções para exportação
function exportar(show = true) {

   if (mainList == '') {
      alert("Não há notas listadas!")
      return false
   }

   if (show == true) {
      document.getElementById("btnExportarTabela").setAttribute("onClick", "exportar(false)");
      document.getElementById("btnExportarTabela").setAttribute("class", "btn btn-secondary");
   } else if (show == false) {
      document.getElementById("listar_tabela_excel").innerHTML = ""
      document.getElementById("btnExportarTabela").setAttribute("onClick", "exportar()");
      document.getElementById("btnExportarTabela").setAttribute("class", "btn btn-success");
      return false
   }

   let html = `
      <br><br><br>
      <table id="table_notes" class="display" style="width:50%">
         <thead>
         <tr>
            <th>Grau</th>
            <th>Nota</th>
            <th>Pré-Requisito</th>
            <th>Passo Manual</th>
         </tr>
      </thead>
      <tbody>
   `;

   for (let i = 0, preReq = []; i < subList.length; i++) {

      preReq = reqManual.filter(x => x.nota == subList[i].nota).map(x => x.requisito)[0]

      if (preReq == undefined) {
         preReq = '-'
      }

      html += `<tr>
      <td>${subList[i].grau}</td>
      <td>${subList[i].notaPai}</td>
      <td>${subList[i].nota}</td>
      <td>${preReq}</td>
      </tr>`;

   }

   html += "</tbody></table>"

   carregaTabelaDatatables()

   document.getElementById("listar_tabela_excel").innerHTML = html;

   setTimeout(() => { //aguarda carregar a tabela
      document.getElementById('listar_tabela_excel').scrollIntoView({
         block: 'start',
         behavior: 'smooth',
      });
   }, 500);

   // chama a classe datatables
   function carregaTabelaDatatables() {
      $(document).ready(function () {
         $('#table_notes').DataTable({

            select: true,

            "order": [
               [0, "desc"]
            ], //asc ou desc, index com início 0

            // "lengthMenu": [[10, 25, 50, -1], [10, 25, 50, "All"]],
            "lengthMenu": [10, 25, 50, 75, 100],

            language: {
               url: 'https://cdn.datatables.net/plug-ins/1.10.24/i18n/Portuguese-Brasil.json'
            },

            dom: 'Blfrtip',

            lengthMenu: [
               [10, 25, 50, 100, -1],
               [10, 25, 50, 100, "Todos"]
            ],

            buttons: [
               // 'copy', 'csv', 'excel', 'pdf', 'print'

               {
                  text: 'Copiar',
                  extend: 'copy',
                  className: 'btn btn-primary'
               },
               {
                  text: 'CSV',
                  extend: 'csv',
                  className: 'btn btn-primary'
               },
               {
                  text: 'Excel',
                  extend: 'excel',
                  className: 'btn btn-primary'
               },
               {
                  text: 'PDF',
                  extend: 'pdf',
                  className: 'btn btn-primary'
               },
               {
                  text: 'Imprimir',
                  extend: 'print',
                  className: 'btn btn-primary'
               }
            ]
         });
      });

      // $(document).ready(function () {
      //    $('#example').DataTable({
      //       dom: 'Bfrtip',
      //       buttons: [
      //          'copy', 'csv', 'excel', 'pdf', 'print'
      //       ]
      //    });
      // });

   }

}

// recebe CTRL+V da página do SAP
function lerPaginaSap() {
   let textAreaContent = document.getElementById("subnotas_adicionar")

   // valida se vazio
   if (textAreaContent.value == "") {
      alert("Lista vazia!")
      return false
   }

   // divide o conteúdo em linhas
   let linhas = textAreaContent.value.split("\n");

   let sistema = validaSistema(true)

   let count = 0
   let html = ""
   let lastLine
   let listaNotas = []
   let preRequisite = ""
   let manual = 0

   for (let i = 0; i < linhas.length; i++) {
      if (linhas[i].length < 1) { //elimina linhas vazias
         continue
      } else if (linhas[i].indexOf("Manual Activities:") == 0) {
         manual = linhas[i].substring(18, 19)
      } else if (linhas[i].indexOf("Reason and Prerequisites") == 0) { //lê as razões

         if (!(linhas[i + 1].indexOf("Solution") == 0)) { //lê as razões até Solution
            preRequisite += linhas[i + 1] + " "
         }

      } else if (linhas[i].indexOf("Prerequisites:") == 0) { //ignora primeira tag
         continue;
      } else if (linhas[i].indexOf("Prerequisites") == 0) { //lê a partir da segunda tag
         lastLine = i
      } else if (linhas[i].includes(sistema) && i > lastLine) {

         if ((linhas[i].lastIndexOf(sistema) - linhas[i].indexOf(sistema)) == 4) {
            listaNotas.push(linhas[i].substring((linhas[i].lastIndexOf(sistema) + sistema.length + 1), (linhas[i].lastIndexOf(sistema) + sistema.length + 8)))
         }
      }

   }

   let listaRetorno = [listaNotas, preRequisite, manual]
   return listaRetorno
}

window.onload = lerStorage(), lerRadioSistema(), listarNotas(); // carrega a tabela junto com a página