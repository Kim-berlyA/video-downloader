fetch('/api/info/', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    url: youtubeUrl,
  }),
});

fetch('/api/download/', {
  method: 'POST',
  body: JSON.stringify({
    url: youtubeUrl,
    format: selectedFormat,
  }),
});