document.addEventListener('DOMContentLoaded', () => {
	const ctx = document.getElementById('myChart').getContext('2d');
	let chart;
    
	// Fetch data from the server
	fetch('/api/spotify-data')
	    .then(response => {
		if (!response.ok) {
		    throw new Error(`HTTP error! Status: ${response.status}`);
		}
		return response.json();
	    })
	    .then(data => {
		const tracks = data.tracks.items;
		const trackNames = tracks.map(track => track.name);
		const trackPopularity = tracks.map(track => track.popularity);
    
		// Normalize popularity data to a 0-1 scale if needed
		const maxPopularity = Math.max(...trackPopularity);
		const normalizedPopularity = trackPopularity.map(popularity => popularity / maxPopularity);
    
		// Sort tracks by popularity
		const sortedTracks = tracks.sort((a, b) => b.popularity - a.popularity);
		const sortedNames = sortedTracks.map(track => track.name);
		const sortedPopularity = sortedTracks.map(track => track.popularity / maxPopularity);
    
		// Limit the number of displayed labels and group others
		const maxLabels = 10;
		const displayNames = sortedNames.slice(0, maxLabels);
		const displayPopularity = sortedPopularity.slice(0, maxLabels);
    
		if (sortedNames.length > maxLabels) {
		    const otherPopularity = sortedPopularity.slice(maxLabels).reduce((sum, popularity) => sum + popularity, 0);
		    displayNames.push('Other');
		    displayPopularity.push(otherPopularity);
		}
    
		// Initial chart type
		let chartType = 'bar';
    
		function updateChart() {
		    if (chart) {
			chart.destroy();
		    }
		    if (chartType === 'pie') {
			ctx.canvas.parentNode.style.width = '400px';
			ctx.canvas.parentNode.style.height = '400px';
			document.querySelector('.container').style.height = '70%';

		    } else {
			ctx.canvas.parentNode.style.width = '100%';
			ctx.canvas.parentNode.style.height = 'auto';
		    }
    
		    const chartData = {
			labels: displayNames,
			datasets: [{
			    label: 'Popularity',
			    data: displayPopularity,
			    backgroundColor: chartType === 'pie' ? displayPopularity.map(() => `hsl(${Math.random() * 360}, 100%, 75%)`) : '#1ed75fb4',
			    borderColor: chartType === 'pie' ? undefined : 'rgba(75, 192, 192, 1)',
			    borderWidth: 1
			}]
		    };

		    const options = {
			responsive: true,
			plugins: {
			    legend: {
				display: true,
				labels: {
				    color: 'white'
				}
			    },
			    tooltip: {
				backgroundColor: chartType === 'pie' ? undefined :'rgba(0, 0, 0, 0.8)',
				titleColor: chartType === 'pie' ? undefined :'white', 
				bodyColor: chartType === 'pie' ? undefined :'white'
			    }
			},
			scales: {
			    x: {
				ticks: {
				    color: chartType === 'pie' ? '#1f1f1f' : 'white' 
				},
				grid: {
				    color: chartType === 'pie' ? '#1f1f1f' : '#1ed75f27'
				}
			    },
			    y: {
				ticks: {
				    color: chartType === 'pie' ? '#1f1f1f' : 'white'
				},
				grid: {
				    color: chartType === 'pie' ? '#1f1f1f' :'#1ed75f27'
				}
			    }
			}
		    };
		    
    
		    chart = new Chart(ctx, {
			type: chartType,
			data: chartData,
			options: options
		    });
		}
    
		updateChart();
    
		document.getElementById('chartType').addEventListener('change', (event) => {
		    chartType = event.target.value;
		    updateChart();
		});
	    })
	    .catch(error => {
		console.error('Error fetching data:', error);
	    });
    });
    