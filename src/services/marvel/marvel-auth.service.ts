import md5 from "md5";

export const generateAuthenticationString = () => {
    const ts = new Date().getTime();  // Asegúrate de usar el mismo valor de ts
    const privateKey = process.env.MARVEL_API_PRIVATE_KEY;
    const publicKey = process.env.NEXT_PUBLIC_MARVEL_API_PUBLIC_KEY;

    // Verifica los valores que se están utilizando
    console.log('Timestamp (ts):', ts);
    console.log('Private Key:', privateKey);
    console.log('Public Key:', publicKey);

    if (!privateKey || !publicKey) {
        console.error("API Keys are missing!");
        return '';
    }

    const stringToHash = `${ts}${privateKey}${publicKey}`;
    console.log('String to Hash:', stringToHash);

    const hash = md5(stringToHash);
    console.log('Generated Hash:', hash);

    return `ts=${ts}&apikey=${publicKey}&hash=${hash}`;
};

