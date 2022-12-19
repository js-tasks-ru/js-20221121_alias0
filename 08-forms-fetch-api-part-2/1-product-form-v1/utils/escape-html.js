export default string => string
  .replace(/&/g, '&amp;')
  .replace(/"/g, '\"')
  .replace(/'/g, '&#39;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;');
