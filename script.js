const TOTAL=60;
let jogadores=[];
let turno=0;
let tipos=[];
let perguntas=[];

function criarCampos(){
 const q=+document.getElementById('qtd').value;
 const d=document.getElementById('nomes'); d.innerHTML='';
 for(let i=1;i<=q;i++) d.innerHTML+=`<input id="n${i}" placeholder="Jogador ${i}"><br>`;
}
criarCampos();

async function iniciarJogo(){
 const q=+document.getElementById('qtd').value;
 for(let i=1;i<=q;i++){
   jogadores.push({nome:document.getElementById('n'+i).value||('Jogador '+i),pos:0,xp:0,pontos:0,skip:0,cor:'j'+i});
 }
 const res=await fetch('perguntas.json');
 perguntas=(await res.json()).perguntas;
 gerarCasas();
 document.getElementById('setup').classList.add('hidden');
 document.getElementById('jogo').classList.remove('hidden');
 criarTabuleiro();
 atualizar();
}

function gerarCasas(){
 tipos=Array(TOTAL).fill('normal');
 ['pergunta','laboratorio','corrosao','pesquisa','evento'].forEach(t=>{
   for(let i=0;i<5;i++){
     let p=Math.floor(Math.random()*58)+1;
     tipos[p]=t;
   }
 });
 tipos[59]='final';
}

function criarTabuleiro(){
 const t=document.getElementById('tabuleiro'); t.innerHTML='';
 for(let i=0;i<TOTAL;i++){
   t.innerHTML+=`<div class="casa" data-p="${i}"><span class="numero">${i}</span><div class="jogadoresCasa"></div><span class="tipo">${tipos[i]}</span></div>`;
 }
 document.getElementById('dadoBtn').onclick=rolar;
 render();
}

function render(){
 document.querySelectorAll('.jogadoresCasa').forEach(x=>x.innerHTML='');
 jogadores.forEach(j=>{
   const el=document.querySelector(`[data-p="${j.pos}"] .jogadoresCasa`);
   if(el) el.innerHTML+=`<div class="peca ${j.cor}"></div>`;
 });
}

function atualizar(){
 document.getElementById('turno').textContent='Turno: '+jogadores[turno].nome;
 const div=document.getElementById('jogadoresInfo');
 div.innerHTML='';
 jogadores.forEach(j=>div.innerHTML+=`<div class="info"><b>${j.nome}</b><br>Casa:${j.pos}<br>XP:${j.xp}<br>Pontos:${j.pontos}</div>`);
 render();
}

function rolar(){
 const j=jogadores[turno];
 if(j.skip>0){ j.skip--; prox(); return; }
 const v=Math.floor(Math.random()*6)+1;
 document.getElementById('resultadoDado').textContent=v;
 j.pos=Math.min(59,j.pos+v);
 eventoCasa(j);
 if(j.pos===59 && j.pontos>=80){ alert(j.nome+' venceu!'); }
 atualizar();
 prox();
}

function prox(){ turno=(turno+1)%jogadores.length; atualizar(); }

function eventoCasa(j){
 const t=tipos[j.pos];
 if(t==='pergunta'){
   const p=perguntas[Math.floor(Math.random()*perguntas.length)];
   const r=prompt(p.pergunta+"\n"+p.alternativas.map((a,i)=>`${i+1}-${a}`).join('\n'));
   if(+r-1===p.correta){ alert('Acertou!'); j.xp+=10; j.pontos+=5; }
   else { alert('Errou!'); j.xp+=2; }
 }
 else if(t==='laboratorio'){ j.xp+=15; alert('Experimento bem sucedido! +15 XP'); }
 else if(t==='corrosao'){ j.pontos=Math.max(0,j.pontos-5); alert('Corrosão! -5 pontos'); }
 else if(t==='pesquisa'){ j.xp+=20; alert('Pesquisa concluída! +20 XP'); }
 else if(t==='evento'){
   const e=Math.random();
   if(e<0.33){ j.pontos+=15; alert('Financiamento! +15 pontos'); }
   else if(e<0.66){ j.skip=1; alert('Pane! Perde próximo turno'); }
   else { j.xp+=25; alert('Artigo publicado! +25 XP'); }
 }
}
