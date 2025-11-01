// Chart.js configuration for expense visualization
document.addEventListener('DOMContentLoaded', function() {
  const expenseDataEl = document.getElementById('expenseData');
  
  if (expenseDataEl) {
    const expenseData = JSON.parse(expenseDataEl.getAttribute('data-expenses'));
    
    if (Object.keys(expenseData).length > 0) {
      const ctx = document.getElementById('expenseChart').getContext('2d');
      
      // Prepare data for chart
      const labels = Object.keys(expenseData);
      const data = Object.values(expenseData);
      
      // Generate colors for each category
      const backgroundColors = [
        'rgba(255, 99, 132, 0.8)',
        'rgba(54, 162, 235, 0.8)',
        'rgba(255, 206, 86, 0.8)',
        'rgba(75, 192, 192, 0.8)',
        'rgba(153, 102, 255, 0.8)',
        'rgba(255, 159, 64, 0.8)',
        'rgba(201, 203, 207, 0.8)',
        'rgba(255, 99, 255, 0.8)',
        'rgba(99, 255, 132, 0.8)',
        'rgba(132, 99, 255, 0.8)'
      ];
      
      const borderColors = [
        'rgba(255, 99, 132, 1)',
        'rgba(54, 162, 235, 1)',
        'rgba(255, 206, 86, 1)',
        'rgba(75, 192, 192, 1)',
        'rgba(153, 102, 255, 1)',
        'rgba(255, 159, 64, 1)',
        'rgba(201, 203, 207, 1)',
        'rgba(255, 99, 255, 1)',
        'rgba(99, 255, 132, 1)',
        'rgba(132, 99, 255, 1)'
      ];
      
      new Chart(ctx, {
        type: 'pie',
        data: {
          labels: labels,
          datasets: [{
            label: 'Expenses by Category',
            data: data,
            backgroundColor: backgroundColors.slice(0, labels.length),
            borderColor: borderColors.slice(0, labels.length),
            borderWidth: 2
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: true,
          plugins: {
            legend: {
              position: 'bottom',
              labels: {
                padding: 15,
                font: {
                  size: 12
                }
              }
            },
            tooltip: {
              callbacks: {
                label: function(context) {
                  let label = context.label || '';
                  if (label) {
                    label += ': ';
                  }
                  label += '$' + context.parsed.toFixed(2);
                  
                  // Calculate percentage
                  const total = context.dataset.data.reduce((a, b) => a + b, 0);
                  const percentage = ((context.parsed / total) * 100).toFixed(1);
                  label += ' (' + percentage + '%)';
                  
                  return label;
                }
              }
            }
          }
        }
      });
    } else {
      // Display message if no expense data
      const canvas = document.getElementById('expenseChart');
      canvas.style.display = 'none';
      const message = document.createElement('p');
      message.className = 'text-muted text-center';
      message.textContent = 'No expense data to display. Add some expenses to see the chart!';
      canvas.parentElement.appendChild(message);
    }
  }
});