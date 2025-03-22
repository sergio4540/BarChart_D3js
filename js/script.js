// Colores para las barras (5 colores diferentes)
const colors = ['#4285F4', '#EA4335', '#FBBC05', '#34A853', '#8F44AD'];

// Configuración inicial del gráfico
const margin = {top: 30, right: 30, bottom: 60, left: 60};
const width = 700 - margin.left - margin.right;
const height = 400 - margin.top - margin.bottom;

// Crear el SVG
const svg = d3.select("#chart")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

// Añadir título al gráfico
svg.append("text")
    .attr("x", width / 2)
    .attr("y", -10)
    .attr("text-anchor", "middle")
    .style("font-size", "16px")
    .style("font-weight", "bold")
    .text("Chart");
    
// Añadir eje X (inicialmente vacío)
const x = d3.scaleBand()
    .range([0, width])
    .padding(0.2);
    
const xAxis = svg.append("g")
    .attr("transform", `translate(0,${height})`);
    
// Añadir etiqueta del eje X
svg.append("text")
    .attr("x", width / 2)
    .attr("y", height + 40)
    .attr("text-anchor", "middle")
    .style("font-size", "14px")
    .text("Valores");
    
// Añadir eje Y (inicialmente vacío)
const y = d3.scaleLinear()
    .range([height, 0]);
    
const yAxis = svg.append("g");

// Añadir etiqueta del eje Y
svg.append("text")
    .attr("transform", "rotate(-90)")
    .attr("y", -40)
    .attr("x", -(height / 2))
    .attr("text-anchor", "middle")
    .style("font-size", "14px")
    .text("Valor");

/**
 * Actualiza el gráfico de barras con los datos proporcionados
 * @param {Array<number>} data - Array de números enteros para visualizar
 */
function updateChart(data) {
    // Actualizar escala X
    x.domain(data.map((d, i) => i));
    xAxis.call(d3.axisBottom(x).tickFormat(i => data[i]));
    
    // Actualizar escala Y
    const maxValue = d3.max(data);
    y.domain([0, maxValue * 1.1]); // Añadir 10% más de espacio
    yAxis.transition().duration(1000).call(d3.axisLeft(y).ticks(5));
    
    // Unir datos con elementos visuales
    const bars = svg.selectAll(".bar")
        .data(data);
        
    // Eliminar barras antiguas
    bars.exit().remove();
    
    // Actualizar barras existentes
    bars.transition()
        .duration(1000)
        .attr("x", (d, i) => x(i))
        .attr("y", d => y(d))
        .attr("width", x.bandwidth())
        .attr("height", d => height - y(d))
        .attr("fill", (d, i) => colors[i % colors.length]);
        
    // Agregar nuevas barras
    bars.enter()
        .append("rect")
        .attr("class", "bar")
        .attr("x", (d, i) => x(i))
        .attr("width", x.bandwidth())
        .attr("y", height) // Comienza desde abajo
        .attr("height", 0)
        .attr("fill", (d, i) => {
            // Asegurarse de que barras contiguas no tengan el mismo color
            if (i > 0 && colors[(i-1) % colors.length] === colors[i % colors.length]) {
                return colors[(i+1) % colors.length];
            }
            return colors[i % colors.length];
        })
        .transition()
        .duration(1000)
        .attr("y", d => y(d))
        .attr("height", d => height - y(d));
        
    // Actualizar etiquetas
    const labels = svg.selectAll(".bar-label")
        .data(data);
        
    // Eliminar etiquetas antiguas
    labels.exit().remove();
    
    // Actualizar etiquetas existentes
    labels.transition()
        .duration(1000)
        .attr("x", (d, i) => x(i) + x.bandwidth() / 2)
        .attr("y", d => y(d) - 5)
        .text(d => d);
        
    // Agregar nuevas etiquetas
    labels.enter()
        .append("text")
        .attr("class", "bar-label")
        .attr("x", (d, i) => x(i) + x.bandwidth() / 2)
        .attr("y", d => y(d) - 5)
        .attr("opacity", 0)
        .text(d => d)
        .transition()
        .duration(1000)
        .attr("opacity", 1);
}

/**
 * Valida y procesa los datos ingresados por el usuario
 * @returns {boolean} true si los datos son válidos, false en caso contrario
 */
function validateAndProcessData() {
    const inputData = document.getElementById("sourceData").value;
    const errorElement = document.getElementById("error");
    
    // Validar entrada
    if (!inputData) {
        errorElement.style.display = "block";
        errorElement.textContent = "Por favor, ingrese algunos datos.";
        return false;
    }
    
    // Convertir string a array de números
    const dataArray = inputData.split(",").map(item => {
        return parseInt(item.trim());
    });
    
    // Verificar que todos los elementos sean números válidos
    if (dataArray.some(isNaN)) {
        errorElement.style.display = "block";
        errorElement.textContent = "Por favor, ingrese solo números enteros separados por comas.";
        return false;
    }
    
    // Ocultar mensaje de error si todo está bien
    errorElement.style.display = "none";
    
    // Actualizar el gráfico
    updateChart(dataArray);
    return true;
}

// Manejar el evento de clic en el botón
document.getElementById("updateData").addEventListener("click", validateAndProcessData);

// También permitir actualizar al presionar Enter
document.getElementById("sourceData").addEventListener("keypress", function(event) {
    if (event.key === "Enter") {
        validateAndProcessData();
    }
});

// Datos iniciales para demostración
const initialData = [5, 10, 15, 20, 25];
updateChart(initialData);