// app.js - Interfaz de usuario

let tableros = [];
let piezas = [];

function agregarTablero() {
  const ancho = prompt('Ancho del tablero (mm):', '2440');
  const largo = prompt('Largo del tablero (mm):', '1220');
  const cantidad = prompt('Cantidad:', '1');

  if (ancho && largo && cantidad) {
    tableros.push({
      id: Date.now(),
      ancho: parseInt(ancho),
      largo: parseInt(largo),
      cantidad: parseInt(cantidad)
    });
    renderTableros();
  }
}

function agregarPieza() {
  const ancho = prompt('Ancho de la pieza (mm):', '600');
  const largo = prompt('Largo de la pieza (mm):', '400');
  const cantidad = prompt('Cantidad:', '1');

  if (ancho && largo && cantidad) {
    piezas.push({
      id: Date.now(),
      ancho: parseInt(ancho),
      largo: parseInt(largo),
      cantidad: parseInt(cantidad),
      rotar: confirm('¿Permitir rotación?')
    });
    renderPiezas();
  }
}

function renderTableros() {
  const container = document.getElementById('tableros-lista');
  container.innerHTML = tableros.map((t, i) => `
    <div class="item">
      <strong>Tablero ${i + 1}:</strong> ${t.ancho} x ${t.largo} mm 
      (x${t.cantidad})
      <button onclick="eliminarTablero(${t.id})">🗑️</button>
    </div>
  `).join('');
}

function renderPiezas() {
  const container = document.getElementById('piezas-lista');
  container.innerHTML = piezas.map((p, i) => `
    <div class="item">
      <strong>Pieza ${i + 1}:</strong> ${p.ancho} x ${p.largo} mm 
      (x${p.cantidad}) ${p.rotar ? '🔄' : ''}
      <button onclick="eliminarPieza(${p.id})">🗑️</button>
    </div>
  `).join('');
}

function eliminarTablero(id) {
  tableros = tableros.filter(t => t.id !== id);
  renderTableros();
}

function eliminarPieza(id) {
  piezas = piezas.filter(p => p.id !== id);
  renderPiezas();
}

function optimizar() {
  const kerf = parseFloat(document.getElementById('kerf').value) || 3.2;
  
  const opt = new OptimizadorCortes(kerf);

  tableros.forEach(t => {
    opt.agregarTablero(t.ancho, t.largo, t.cantidad);
  });

  piezas.forEach(p => {
    opt.agregarPieza(p.ancho, p.largo, p.cantidad, p.rotar);
  });

  const resultados = opt.optimizar();
  renderResultados(resultados);
}

function renderResultados(resultados) {
  const container = document.getElementById('resultados');
  container.style.display = 'block';

  const resumen = document.getElementById('resumen');
  resumen.innerHTML = `
    <div class="resumen-grid">
      <div>📦 Tableros usados: <strong>${resultados.tablerosUsados}</strong></div>
      <div>✂️ Piezas cortadas: <strong>${piezas.reduce((s, p) => s + p.cantidad, 0) - resultados.piezasRestantes}</strong></div>
      <div>⚠️ Piezas restantes: <strong>${resultados.piezasRestantes}</strong></div>
    </div>
  `;

  const diagrama = document.getElementById('diagrama');
  diagrama.innerHTML = resultados.cortes.map(corte => `
    <div class="tablero-diagrama">
      <h3>Tablero ${corte.tablero} - ${corte.dimensiones} mm</h3>
      <p>Eficiencia: ${corte.eficiencia}% | Desperdicio: ${corte.desperdicio}%</p>
      <div class="canvas-container" style="
        width: ${Math.min(400, corte.dimensiones.split(' x ')[0])}px;
        height: ${Math.min(300, corte.dimensiones.split(' x ')[1])}px;
        border: 2px solid #333;
        position: relative;
        background: #f0f0f0;
      ">
        ${corte.piezas.map(p => `
          <div style="
            position: absolute;
            left: ${p.x}px;
            top: ${p.y}px;
            width: ${p.ancho}px;
            height: ${p.largo}px;
            background: ${p.rotada ? '#667eea' : '#764ba2'};
            border: 1px solid #333;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-size: 10px;
          ">
            ${p.ancho}x${p.largo}
          </div>
        `).join('')}
      </div>
    </div>
  `).join('');
}

// Inicializar
renderTableros();
renderPiezas();
