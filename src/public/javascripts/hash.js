async function hashSHA256(input) {
    let textBuffer = new TextEncoder().encode(input);
    let hashBuffer = await window.crypto.subtle.digest("SHA-256", textBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hash = hashArray
        .map((item) => item.toString(16).padStart(2, "0"))
        .join("");
    return hash;
}