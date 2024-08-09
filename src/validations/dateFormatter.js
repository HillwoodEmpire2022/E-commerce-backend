export default function dateFormatter(date) {
  const options = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
    timeZone: 'Africa/Harare', // Central Africa Time
    timeZoneName: 'short',
  };

  return new Intl.DateTimeFormat('en-US', options).format(date);
}
