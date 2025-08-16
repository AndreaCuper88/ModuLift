/**
 * Stima %BF con Jackson & Pollock 3 pliche (JP3) + Siri.
 * Richiede sites come OGGETTO plain, non Map.
 *
 * @param {Object} params
 * @param {'male'|'female'} params.sex
 * @param {Object} params.sites  - pliche in mm:
 *   - male:   { chest, abdomen, thigh }
 *   - female: { triceps, suprailiac, thigh }
 * @param {number|string} params.ageYears  - età in anni (alla data della misura)
 * @param {number} [params.decimals=1]     - decimali per %BF
 * @returns {{isComplete:boolean, sum3?:number, bodyDensity?:number, fatPercent?:number, reason?:string}}
 */
export function estimateBfJP3({ sex, sites, ageYears, decimals = 1 }) {
    const s = String(sex || '').trim().toLowerCase();
    if (s !== 'male' && s !== 'female') {
        return { isComplete: false, reason: 'sex deve essere "male" o "female"' };
    }

    // sites deve essere un Object plain
    if (!sites || typeof sites !== 'object' || Array.isArray(sites)) {
        return { isComplete: false, reason: 'sites deve essere un oggetto { key: mm }' };
    }

    const age = toNum(ageYears);
    if (!Number.isFinite(age) || age < 0) {
        return { isComplete: false, reason: 'ageYears non valido' };
    }

    const keys = s === 'female'
        ? ['triceps', 'suprailiac', 'thigh']
        : ['chest', 'abdomen', 'thigh'];

    // Leggo e normalizzo le tre pliche richieste
    const vals = keys.map(k => toNum(sites[k]));
    const complete = vals.every(v => Number.isFinite(v) && v >= 0);

    if (!complete) {
        return { isComplete: false, reason: `pliche mancanti o non valide (${keys.join(', ')})` };
    }

    const sum3 = vals.reduce((acc, v) => acc + v, 0);

    let BD;
    if (s === 'female') {
        BD = 1.0994921 - 0.0009929 * sum3 + 0.0000023 * sum3 * sum3 - 0.0001392 * age;
    } else {
        BD = 1.10938   - 0.0008267 * sum3 + 0.0000016 * sum3 * sum3 - 0.0002574 * age;
    }

    const fatPercent = Number((495 / BD - 450).toFixed(decimals));
    return { isComplete: true, sum3, bodyDensity: BD, fatPercent };
}

// Converte stringhe/virgole in numero; vuoti -> undefined
function toNum(v) {
    if (v === '' || v === null || v === undefined) return undefined;
    const n = typeof v === 'string' ? Number(v.replace(',', '.')) : Number(v);
    return Number.isFinite(n) ? n : undefined;
}