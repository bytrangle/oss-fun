async function fetchPublicEvents() {
  try {
    console.log('Fetching public events from GitHub API...');
    
    const response = await fetch('https://api.github.com/events?per_page=100', {
      headers: {
        'Accept': 'application/vnd.github+json',
        'User-Agent': 'oss-realtime-app'
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const events = await response.json();
    
    console.log(`\nFetched ${events.length} public events:\n`);
    
    events.forEach((event, index) => {
      console.log(`${index + 1}. Event: ${event.type}`);
      console.log(`   Actor: ${event.actor.login}`);
      console.log(`   Repository: ${event.repo.name}`);
      console.log(`   Created: ${new Date(event.created_at).toLocaleString()}`);
      console.log('   ---');
    });

    console.log(`\nTotal events retrieved: ${events.length}`);
    
  } catch (error) {
    console.error('Error fetching GitHub events:', error.message);
  }
}

// Run the function
fetchPublicEvents();