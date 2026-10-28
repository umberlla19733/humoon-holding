// The server is authoritative: never show success before persistent storage confirms it.
export async function submitContact(division, fields) {
  const response = await fetch('/contact.php', {method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({action:'submit', division, ...fields})});
  if (!response.ok || !(response.headers.get('content-type') || '').includes('application/json')) throw new Error('Contact submission failed');
  const data = await response.json();
  if (!data.inquiry || !/^HM-[A-F0-9]{32}$/.test(data.inquiry.trackingCode || '')) throw new Error('Invalid server response');
  return data.inquiry;
}
export async function trackContact(code) {
  const response = await fetch('/contact.php', {method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({action:'track', code})});
  if (!response.ok || !(response.headers.get('content-type') || '').includes('application/json')) throw new Error('Tracking unavailable');
  return (await response.json()).inquiry;
}
