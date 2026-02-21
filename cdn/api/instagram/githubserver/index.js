/**
 * Fungsi buat dapetin waktu sekarang di zona GMT+8
 */
function getWaktuSekarang() {
    const options = {
        timeZone: 'Asia/Makassar', // Ini GMT+8 bro
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
    };
    
    const formatter = new Intl.DateTimeFormat('sv-SE', options);
    const parts = formatter.formatToParts(new Date());
    const d = {};
    parts.forEach(p => d[p.type] = p.value);
    
    return `${d.year}-${d.month}-${d.day} ${d.hour}:${d.minute} GMT+8`;
}

/**
 * Fungsi Inti: Eksekusi 4 Request Berurutan
 */
async function updateInstagramBioOtomatis() {
    const waktuBio = getWaktuSekarang();
    console.log(`[${new Date().toLocaleTimeString()}] Memulai update bio ke: ${waktuBio}`);

    const commonHeaders = {
        'accept': '*/*',
        'content-type': 'application/x-www-form-urlencoded',
        'x-csrftoken': document.cookie.split('csrftoken=')[1].split(';')[0],
        'x-ig-app-id': '936619743392459',
        'x-requested-with': 'XMLHttpRequest'
    };

    try {
        // --- REQ 3: GraphQL Consent ---
        await fetch('https://www.instagram.com/api/graphql', {
            method: 'POST',
            headers: commonHeaders,
            body: 'av=17841478186266096&__d=www&__user=0&__a=1&fb_api_caller_class=RelayModern&fb_api_req_friendly_name=useCustomGenderConsentedQuery&variables=%7B%7D&doc_id=9460890570704385'
        });
        console.log("Req 3 Done...");

        // --- REQ 4: Settings Refetch ---
        await fetch('https://www.instagram.com/graphql/query', {
            method: 'POST',
            headers: commonHeaders,
            body: 'av=17841478186266096&__d=www&__user=0&__a=1&fb_api_req_friendly_name=PolarisSettingsTierOneDependenciesRefetchQuery&variables=%7B%7D&doc_id=24585568727751354'
        });
        console.log("Req 4 Done...");

        // --- REQ 1: Set Gender ---
        await fetch('https://www.instagram.com/api/v1/web/accounts/set_gender/', {
            method: 'POST',
            headers: commonHeaders,
            body: 'custom_gender=&gender=3&jazoest=23110'
        });
        console.log("Req 1 Done...");

        // --- REQ 2: EDIT BIO (GONG-NYA) ---
        const payload = new URLSearchParams();
        payload.append('biography', waktuBio); // Pakai waktu GMT+8
        payload.append('chaining_enabled', 'on');
        payload.append('external_url', '');
        payload.append('first_name', '');
        payload.append('username', 'vertisana'); 
        payload.append('jazoest', '23110');

        const res = await fetch('https://www.instagram.com/api/v1/web/accounts/edit/', {
            method: 'POST',
            headers: commonHeaders,
            body: payload
        });

        const result = await res.json();
        if (result.status === 'ok') {
            console.log("%c ANJAY! Bio berhasil diupdate!", "color: #00ff00; font-weight: bold;");
        } else {
            console.log("Njir, gagal pas di Req 2:", result);
        }

    } catch (err) {
        console.error("Waduh, ada kendala jaringan bro:", err);
    }
}

// Jalankan pertama kali pas script di-paste
updateInstagramBioOtomatis();

// Set interval buat jalan tiap 1 jam (3.600.000 ms)
setInterval(() => {
    updateInstagramBioOtomatis();
}, 3600 * 1000);

console.log("Script Auto-Bio GMT+8 udah standby Bro. Jangan tutup tab-nya ya!");
