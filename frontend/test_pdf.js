async function test() {
  try {
    const res = await fetch('https://e.customjs.io/html2pdf', {
      method: 'POST',
      headers: { 'x-api-key': 'C0qnuX29dbaeeRuwKNVDQ3YZ54iHocytadiHwhGL', 'Content-Type': 'application/json' },
      body: JSON.stringify({ input: { html: '<h1>Test</h1>' } })
    });
    const buffer = await res.arrayBuffer();
    console.log("Status:", res.status, "Size:", buffer.byteLength);
    if (!res.ok) console.error("Text:", new TextDecoder().decode(buffer));
  } catch(e) {
    console.error("Error:", e.message);
  }
}
test();