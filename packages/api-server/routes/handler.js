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
      
      // Extract action from payload field
      let action = null;
      if (eventData.payload) {
        try {
          const payloadObj = JSON.parse(eventData.payload);
          action = payloadObj.action;
        } catch (e) {
          // If payload is not JSON, try to extract action directly
          const actionMatch = eventData.payload.match(/"action":\s*"([^"]+)"/);
          action = actionMatch ? actionMatch[1] : null;
        }
      }
      
      // Construct new object with required fields
      const processedEvent = {
        repo_name: repoName,
        actor_login: actorLogin,
        type: eventData.type || null,
        action: action,
        id: eventData.id || null
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

// Active contributors endpoint
router.get('/active-contributors', async (req, res) => {
  try {
    // Get the 'since' query parameter, default to 'today'
    const since = req.query.since || 'today';
    
    // Convert 'today' to ISO format string
    let dateKey;
    if (since === 'today') {
      dateKey = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
    } else {
      dateKey = since; // Assume it's already in the correct format
    }
    
    // Construct the Redis key
    const contributorScoreKey = `github-events:contributor-score:${dateKey}:sum`;
    
    console.log(`Reading top contributors from Redis key: ${contributorScoreKey}`);
    
    // Get top 20 contributors ordered by score (highest to lowest)
    const contributors = await redis.zrevrange(contributorScoreKey, 0, 19, 'WITHSCORES');
    
    // Convert the flat array to array of objects
    const contributorData = [];
    for (let i = 0; i < contributors.length; i += 2) {
      contributorData.push({
        contributor: contributors[i],
        score: parseInt(contributors[i + 1])
      });
    }
    
    // Check if response is empty
    if (contributorData.length === 0) {
      return res.json({
        message: "It's the wee hours. Let's get going.",
        data: []
      });
    }
    
    // Return successful response with data
    res.json({
      message: 'success',
      data: contributorData
    });
    
  } catch (error) {
    console.error('Error reading contributors from Redis:', error);
    res.status(500).json({
      message: 'error',
      error: error.message
    });
  }
});

module.exports = router;
