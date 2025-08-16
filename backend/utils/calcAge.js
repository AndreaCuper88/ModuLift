
export function calcAge(birthDate, at = new Date()) {
    const b = birthDate instanceof Date ? birthDate : new Date(birthDate); //Controllo sul formato
    const r = at instanceof Date ? at : new Date(at);

    if (Number.isNaN(b.getTime()) || Number.isNaN(r.getTime())) { //Chiamando getTime su un Invalid Date si ottiene NaN
        throw new Error('Date non valide');
    }
    if (r < b) return 0; // niente età negativa

    let years = r.getUTCFullYear() - b.getUTCFullYear();
    //Salvo mese e giorno di entrambe le date
    const rMonth = r.getUTCMonth(), rDay = r.getUTCDate();
    const bMonth = b.getUTCMonth(), bDay = b.getUTCDate();

    //Quindi posso capire se ha già compiuto gli anni quest'anno
    if (rMonth < bMonth || (rMonth === bMonth && rDay < bDay)) years--; //Se non li ha ancora compiuti, sottraggo 1 dagli anni
    return years;
}