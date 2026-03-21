import Dexie from "dexie";

export const db = new Dexie("ModuLiftDB"); //Creazione db

db.version(1).stores({
    workoutProgress: "[planId+sessionId] ,planId ,updatedAt",   //Tabella con dati da sincronizzare, Dexie non richiede di dichiarare tutti i campi
    syncQueue: "++id, tipo, operazione, timestamp" //Tabella con coda operazioni
});