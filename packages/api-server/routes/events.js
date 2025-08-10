const express = require('express');
const redis = require('../redis-client');
const { getEventStreamKey } = require('../redis-key-generator');

const router = express.Router();

// Event stream endpoint
router.get('/event-stream', async (req, res) => {
  try {
    const streamKey = getEventStreamKey();
    console.log(`Reading from Redis stream: ${streamKey}`);
    
    // Read from the stream (latest 100 entries)
    const streamData = await redis.xrevrange(streamKey, '+', '-', 'COUNT', 100);
    
    console.log('Response from Redis:', streamData);
    
    // Create a new array to store processed events
    const processedEvents = [];
    
    // Iterate through each element in the stream data
    streamData.forEach((streamEntry) => {
      const [entryId, payload] = streamEntry;
      
      // Convert payload array to key-value pairs
      const eventData = {};
      for (let i = 0; i < payload.length; i += 2) {
        eventData[payload[i]] = payload[i + 1];
      }
      
      // Extract repo name from repo field
      let repoName = null;
      if (eventData.repo) {
        try {
          const repoObj = JSON.parse(eventData.repo);
          repoName = repoObj.name;
        } catch (e) {
          // If repo is not JSON, try to extract name directly
          const nameMatch = eventData.repo.match(/"name":\s*"([^"]+)"/);
          repoName = nameMatch ? nameMatch[1] : null;
        }
      }
      
      // Extract actor login from actor field
      let actorLogin = null;
      if (eventData.actor) {
        try {
          const actorObj = JSON.parse(eventData.actor);
          actorLogin = actorObj.login;
        } catch (e) {
          // If actor is not JSON, try to extract login directly
          const loginMatch = eventData.actor.match(/"login":\s*"([^"]+)"/);
          actorLogin = loginMatch ? loginMatch[1] : null;
        }
      }
      
      // Construct new object with required fields
      const processedEvent = {
        repo_name: repoName,
        actor_login: actorLogin,
        type: eventData.type || null
      };
      
      // Push to the new array
      processedEvents.push(processedEvent);
    });
    
    // Console.log the new array
    console.log('Processed Events:', processedEvents);
    console.log('Number of processed events:', processedEvents.length);
    
    res.json({ 
      message: 'success', 
      data: processedEvents 
    });
  } catch (error) {
    console.error('Error reading from Redis stream:', error);
    res.status(500).json({ 
      message: 'error', 
      error: error.message 
    });
  }
});

module.exports = router;
