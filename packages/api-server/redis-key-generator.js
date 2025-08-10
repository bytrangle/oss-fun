const PREFIX = 'github-events';
const getKey = (suffix) => `${PREFIX}:${suffix}`;
const getEventStreamKey = () => getKey('event-stream');

module.exports = {
  getEventStreamKey
}
