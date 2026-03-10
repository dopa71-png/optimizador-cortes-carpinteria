// optimizer.js - Algoritmo MaxRects en JavaScript

class MaxRectsBin {
  constructor(ancho, largo, kerf = 3.2) {
    this.ancho = ancho;
    this.largo = largo;
    this.kerf = kerf;
    this.espaciosLibres = [{ x: 0, y: 0, w: ancho, h: largo }];
    this.piezasColocadas = [];
  }

  colocarPieza(ancho, largo, rotar = false) {
    let mejorEspacio = null;
    let mejorPuntaje = Infinity;

    const dimensiones = rotar 
      ? [[ancho, largo], [largo, ancho]] 
      : [[ancho, largo]];

    for (const [w, h] of dimensiones) {
      for (let i = 0; i < this.espaciosLibres.length; i++) {
        const espacio = this.espaciosLibres[i];
        if (w <= espacio.w && h <= espacio.h) {
          const puntaje = (espacio.w - w) + (espacio.h - h);
          if (puntaje < mejorPuntaje) {
            mejorPuntaje = puntaje;
            mejorEspacio = {
              indice: i,
              x: espacio.x,
              y: espacio.y,
              w,
              h,
              rotada: w !== ancho
            };
          }
        }
      }
    }

    if (!mejorEspacio) return null;

    const espacio = this.espaciosLibres.splice(mejorEspacio.indice, 1)[0];
    
    const pieza = {
      x: mejorEspacio.x,
      y: mejorEspacio.y,
      ancho: mejorEspacio.w - this.kerf,
      largo: mejorEspacio.h - this.kerf,
      rotada: mejorEspacio.rotada
    };
    
    this.piezasColocadas.push(pieza);
    this.dividirEspacio(espacio, mejorEspacio.w, mejorEspacio.h);

    return pieza;
  }

  dividirEspacio(espacio, wUsado, hUsado) {
    if (espacio.w - wUsado > this.kerf) {
      this.espaciosLibres.push({
        x: espacio.x + wUsado + this.kerf,
        y: espacio.y,
        w: espacio.w - wUsado - this.kerf,
        h: hUsado
      });
    }

    if (espacio.h - hUsado > this.kerf) {
      this.espaciosLibres.push({
        x: espacio.x,
        y: espacio.y + hUsado + this.kerf,
        w: espacio.w,
        h: espacio.h - hUsado - this.kerf
      });
    }

    // Limpiar espacios muy pequeños
    this.espaciosLibres = this.espaciosLibres.filter(
      e => e.w > 50 && e.h > 50
    );
  }
}

class OptimizadorCortes {
  constructor(kerf = 3.2) {
    this.kerf = kerf;
    this.tableros = [];
    this.piezas = [];
  }

  agregarTablero(ancho, largo, cantidad = 1) {
    for (let i = 0; i < cantidad; i++) {
      this.tableros.push({ ancho, largo });
    }
  }

  agregarPieza(ancho, largo, cantidad = 1, rotar = true) {
    for (let i = 0; i < cantidad; i++) {
      this.piezas.push({ ancho, largo, rotar });
    }
  }

  optimizar() {
    // Ordenar piezas por área (mayor a menor)
    this.piezas.sort((a, b) => (b.ancho * b.largo) - (a.ancho * a.largo));

    const resultados = [];
    let piezasPendientes = [...this.piezas];

    for (let i = 0; i < this.tableros.length; i++) {
      if (piezasPendientes.length === 0) break;

      const tablero = this.tableros[i];
      const bin = new MaxRectsBin(tablero.ancho, tablero.largo, this.kerf);
      const piezasColocadas = [];

      for (let j = piezasPendientes.length - 1; j >= 0; j--) {
        const pieza = piezasPendientes[j];
        const resultado = bin.colocarPieza(pieza.ancho, pieza.largo, pieza.rotar);

        if (resultado) {
          piezasColocadas.push(resultado);
          piezasPendientes.splice(j, 1);
        }
      }

      if (piezasColocadas.length > 0) {
        const areaTotal = tablero.ancho * tablero.largo;
        const areaUsada = piezasColocadas.reduce(
          (sum, p) => sum + ((p.ancho + this.kerf) * (p.largo + this.kerf)), 
          0
        );

        resultados.push({
          tablero: i + 1,
          dimensiones: `${tablero.ancho} x ${tablero.largo}`,
          piezas: piezasColocadas,
          desperdicio: ((areaTotal - areaUsada) / areaTotal * 100).toFixed(2),
          eficiencia: (areaUsada / areaTotal * 100).toFixed(2)
        });
      }
    }

    return {
      cortes: resultados,
      piezasRestantes: piezasPendientes.length,
      tablerosUsados: resultados.length
    };
  }
}

// Exportar para usar en app.js
window.OptimizadorCortes = OptimizadorCortes;
